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
    },
    {
        family: "Papyrus",
        style: "Bold"
    },
    {
        family: "Arial"
    },
    {
        family: "Arial",
        style: "Light"
    },
    {
        family: "Aril",
        style: "Bold"
    }
]).then( result => {
    console.log(result);
})

