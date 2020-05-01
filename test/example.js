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

systemFonts.getFontsExtended().then(res => console.log(res));

systemFonts.installFonts(['test/test-folder/LORENZA.ttf', 'test/test-folder/Pineapple Slice.ttf']).then(res => console.log(res)).catch(e => console.error('ERR', e));