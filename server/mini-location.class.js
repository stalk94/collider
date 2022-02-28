class MiniLocation {
    static guids = {}       //экземпляры
    static cache = {}       //прототипы

    constructor(props, transferData, locations, Loader) {
        let name = props.locId
        this.locId = props.locId

        if(MiniLocation.cache[name]) MiniLocation.guids[name]++
        else {
            if(locations) MiniLocation.cache[name] = JSON.parse(locations[name])
            else logger.error("eror LOCATIONS data not init")
            MiniLocation.guids[name] = 0
        }

        this.guid = MiniLocation.guids[name];
        this.name = name+":"+this.guid;
        this.exit = transferData;
        const load = new Loader(name, locations);
        Object.keys(load.container).map((key)=> {
            if(key!=="addChild") this[key] = load.container[key]
        });

        this.#setTransfer(transferData);
        Zona.mini_loc[name+":"+this.guid] = this;
        Zona.mini_loc[name+":"+this.guid]._loadData = load;
    }
    #setTransfer(dataToExit) {
        if(this.children) this.children.forEach((obj)=> {
            if(obj.type==="triger" && obj.hitArea.exit){
                this.exit = obj.hitArea
                this.exit.props = dataToExit
                obj.props = this.exit.points
            }
        });
    }
}


module.exports = MiniLocation;