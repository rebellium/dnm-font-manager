const SystemFonts = require('../dist/main').default;

const systemFonts = new SystemFonts();
systemFonts.findFonts([
    {
        family: "Source Sans Pro",
        style: ["Black", "Semibold Italic"]
    },
    {
        family: "Papyrus",
        style: "Regular"
    }
]).then( result => {
    console.log(result);
})

