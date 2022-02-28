const Loader = require("./loader");
const Location = require("./container");



module.exports = {
    locations: {},
    runer:  Location.runer,

    create() {
        const locIds = process.env.locId.split(",");

        locIds.forEach((id)=> {
            let loc = new Loader(`loc_${id}`).container;
            this.locations[`loc_${id}`] = new Location(loc);
        });
        setTimeout(()=> {
            Object.keys(Zona.mini_loc).forEach((name)=> {
                this.locations[name] = new Location(Zona.mini_loc[name], name);
            });
        }, 4000);
    }
}
