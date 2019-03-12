import fs from 'fs';
import path from 'path';
import ttfInfo from 'ttfinfo';

const getPlatform = () => (process.platform === 'darwin') ? 'osx' : (/win/.test(process.platform) ? 'windows' : 'linux');

const recGetFile = (target) => {
    let stats;
    try {
        stats = fs.statSync(target);
    } catch (e) {
        // console.error(e);
        return [];
    }
    if (stats.isDirectory()) {
        let files;
        try {
            files = fs.readdirSync(target);
        } catch (e) {
            console.error(e);
        }
        return files
            .reduce((arr, f) => {
                return arr.concat(recGetFile(path.join(target, f)));
            }, []);
    } else {
        const ext = path.extname(target).toLowerCase();
        if (ext === '.ttf' || ext === '.otf' || ext === '.ttc' || ext === '.dfont') {
            return [target];
        } else {
            return [];
        }
    }
};

const filterReadableFonts = arr => arr
    .filter(f => {
        const extension = path.extname(f).toLowerCase();
        return extension === '.ttf' || extension === '.otf';
    });

const tableToObj = (obj, file, systemFont) => {
    return {
        family: obj['16'] ? obj['16'] : obj['1'],
        subFamily: obj['17'] ? obj['17'] : obj['2'],
        postscript: obj['6'],
        file,
        systemFont,
        alternativeFamily: obj['16'],
        alternativeSubFamily: obj['17']
    };
};

const extendedReducer = (m, { family, subFamily, file, postscript, systemFont }) => {
    if (m.has(family)) {
        const origFont = m.get(family);
        return m.set(family, {
            ...origFont,
            systemFont: origFont.systemFont === false ? false : systemFont,
            subFamilies: [
                ...origFont.subFamilies,
                subFamily
            ],
            files: {
                ...origFont.files,
                [subFamily]: file
            },
            postscriptNames: {
                ...origFont.postscriptNames,
                [subFamily]: postscript
            }
        });
    } else {
        return m.set(family, {
            family,
            systemFont,
            subFamilies: [subFamily],
            files: {
                [subFamily]: file
            },
            postscriptNames: {
                [subFamily]: postscript
            }
        });
    }
};

const SystemFonts = function(options = {}) {

    const { ignoreSystemFonts = false, customDirs = [] } = options;

    if (!Array.isArray(customDirs)) {
        throw new Error('customDirs must be an array of folder path strings');
    }

    const customDirSet = new Set(customDirs);
    const customFontFiles = new Set();

    const getFontFiles = () => {

        let directories = [];

        if (customDirs.length > 0) {
            directories = [...customDirs];
        }

        const platform = getPlatform();
        if (platform === 'osx') {
            const home = process.env.HOME;
            directories = [
                ...directories,
                path.join(home, 'Library', 'Fonts'),
                path.join('/', 'Library', 'Fonts'),
                path.join('/', 'System', 'Library', 'Fonts')
            ];
        } else if (platform === 'windows') {
            const winDir = process.env.windir || process.env.WINDIR;
            directories = [
                ...directories,
                path.join(winDir, 'Fonts')
            ];
        } else { // some flavor of Linux, most likely
            const home = process.env.HOME;
            directories = [
                ...directories,
                path.join(home, '.fonts'),
                path.join(home, '.local', 'share', 'fonts'),
                path.join('/', 'usr', 'share', 'fonts'),
                path.join('/', 'usr', 'local', 'share', 'fonts')
            ];
        }

        return directories
            .reduce((arr, d) => {
                const files = recGetFile(d);
                if (customDirSet.has(d)) {
                    files.forEach(f => customFontFiles.add(f));
                }
                return arr.concat(files);
            }, []);
    };

    const allFontFiles = getFontFiles();

    // this list includes all TTF, OTF, OTC, and DFONT files
    this.getAllFontFilesSync = () => [...allFontFiles];

    const fontFiles = filterReadableFonts(allFontFiles);

    // this list includes all TTF and OTF files (these are the ones we parse in this lib)
    this.getFontFilesSync = () => [...fontFiles];

    this.getFontsExtended = () => new Promise((resolve, reject) => {

        const promiseList = [];

        const filteredFontFiles = !ignoreSystemFonts ? [...fontFiles] : fontFiles
            .filter(f => customFontFiles.has(f));

        filteredFontFiles
            .forEach((file, i) => {
                promiseList.push(new Promise(resolve1 => {
                    ttfInfo.get(file, (err, fontMeta) => {
                        if (!fontMeta) {
                            resolve1(null);
                        } else {
                            resolve1(tableToObj(fontMeta.tables.name, file, !customFontFiles.has(file)));
                        }
                    });
                }));
            });
        Promise.all(promiseList).then(
            (res) => {

                const names = res
                    .filter(data => data ? true : false)
                    .reduce(extendedReducer, new Map());

                const namesArr = [...names.values()]
                    .sort((a, b) => a.family.localeCompare(b.family));

                resolve(namesArr);
            },
            (err) => reject(err)
        );
    });

    this.getFontsExtendedSync = () => {

        const filteredFontFiles = !ignoreSystemFonts ? [...fontFiles] : fontFiles
            .filter(f => customFontFiles.has(f));

        const names = filteredFontFiles
            .reduce((arr, file) => {
                let data;
                try {
                    data = ttfInfo.getSync(file);
                } catch (e) {
                    return arr;
                }
                return arr.concat([tableToObj(data.tables.name, file, !customFontFiles.has(file))]);
            }, [])
            .filter(data => data ? true : false)
            .reduce(extendedReducer, new Map());
        const namesArr = [...names.values()]
            .sort((a, b) => a.family.localeCompare(b.family));

        return namesArr;
    };

    this.getFonts = () => new Promise((resolve, reject) => {
        this.getFontsExtended()
            .then(fontList => {
                const names = fontList
                    .map(({ family }) => family)
                    .reduce((obj, name) => {
                        obj[name] = 1;
                        return obj;
                    }, {});
                resolve(Object.keys(names).sort((a, b) => a.localeCompare(b)));
            })
            .catch(err => reject(err));
    });

    this.getFontsSync = () => {
        const names = this.getFontsExtendedSync()
            .map(({ family }) => family)
            .reduce((obj, name) => {
                obj[name] = 1;
                return obj;
            }, {});
        return Object.keys(names).sort((a, b) => a.localeCompare(b));
    };

    this.searchFonts = (fonts, search) => {
        const found = []
        const missing = []
        for(var n=0; n<search.length; n++) {
            let found_font = false;
            const { family } = search[n]
            for(var i=0; i<fonts.length; i++) {
                if(family === fonts[i].family) {
                    found_font = true;
                    let { style } = search[n]
                    const { files } = fonts[i]
                    if(style) {
                        if(typeof style !== "object") style = [style]
                        for(var s=0; s<style.length; s++) {
                            const return_font = {
                                family,
                                style: style[s],
                            }
                            if(files[style[s]]) {
                                return_font.file = files[style[s]]
                                found.push(return_font)
                            } else missing.push(return_font)
                        }
                    } else {
                        for(var key in files) {
                            found.push({
                                family,
                                style: key,
                                file: files[key]
                            })
                        }
                    }
                    break;
                }
            }
            if(!found_font) missing.push({ family })
        }
        return { found, missing };
    }

    this.findFonts = (search) => {
        return new Promise( (resolve, reject) => {
            this.getFontsExtended()
                .then(fonts => {
                    resolve(this.searchFonts(fonts, search))
                }).catch(err => reject(err));
        })
    }

    this.findFontsSync = (search) => {
        const fonts = this.getFontsExtendedSync()
        return this.searchFonts(fonts, search)
    }

};

export default SystemFonts;
