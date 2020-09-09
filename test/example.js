const fs = require('fs');
const SystemFonts = require('../dist/main').default;

const systemFonts = new SystemFonts({ debug: true });
const request = [
    {family: 'Avenir Next', style: 'Bold'},
    {family: 'Avenir Next', style: 'Demi Bold Italic'},
    {family: 'Avenir Next', style: 'Demi Bold'},
    {family: 'HaveHeartTwo', style: 'Regular'},
    {family: 'Avenir Next', style: 'Heavy'},
    {family: 'Avenir Next', style: 'Medium'}
];

// systemFonts.findFonts(request).then( result => {
//     console.log(result);
// }).catch(e => console.error(e));

console.log(systemFonts.findFontsSync(request));

// systemFonts.getFontsExtended().then(res => {
//     res.forEach(item => {
//         if(item.family.toLowerCase().indexOf('avenir') !== -1) {
//             console.log(item);
//         }
//     });
// });

// const dir = 'test/test-folder';
// fs.readdir(dir, (err, files) => {
//     const arr = files.map(file => dir + '/' + file);
//     systemFonts.installFonts(arr).then(res => console.log(res)).catch(e => console.error('ERR', e));
// });