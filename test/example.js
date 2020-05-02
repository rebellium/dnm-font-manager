const fs = require('fs');
const SystemFonts = require('../dist/main').default;

const systemFonts = new SystemFonts();
systemFonts.findFonts([
    {
        family: 'Source Sans Pro',
        style: ['Black', 'Semibold Italic']
    },
    {
        family: 'Papyrus',
        style: 'Regular'
    },
    {
        family: 'Papyrus',
        style: 'Bold'
    },
    {
        family: 'Arial'
    },
    {
        family: 'Arial',
        style: 'Light'
    },
    {
        family: 'Aril',
        style: 'Bold'
    }
]).then( result => {
    //console.log(result);
});

//systemFonts.getFontsExtended().then(res => console.log(res));

const dir = 'test/test-folder';
fs.readdir(dir, (err, files) => {
    const arr = files.map(file => dir + '/' + file);
    systemFonts.installFonts(arr).then(res => console.log(res)).catch(e => console.error('ERR', e));
});