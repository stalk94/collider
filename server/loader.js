const fs = require("fs");
const { Point, Polygon } = require("./global");
const MiniLocation = require("./mini-location.class");
const shell = require("shelljs"); 


global.Zona = { locations: {}, mini_loc: {} }


const o = {}
shell.ls('src/client/assets/maps').forEach((file)=> {
    let st = file.split(".");
    console.log(st)
    if(st[1]==='json') o[st[0]] = fs.readFileSync('src/client/assets/maps/'+file, {encoding:"utf-8"})
});



function Loader(name) {
    let loc = JSON.parse(o[name]);
    let app = {
        name: name,
        size: {width: loc.width*64,height: loc.height*64},
        children: [],
        addChild(o) {
            this.children.push(o)
        }
    }

    Zona.locations[name] = {static:{}, zone:{}, triger:{}, stop:{}, road:{}}
    this.stop = {}
    this.zone = {}
    this.triger = {}
    this.view = {}
    this.stockSubj = {}
    this.stock = {}
    this.subj = {}
    this.obj = {}
    

    loc.tilesets.forEach((tileObj)=> {
        if(tileObj.tiles) tileObj.tiles.forEach((tile)=> {
            if(tile.objectgroup && tile.objectgroup.objects) tile.objectgroup.objects.forEach((obj)=> {
                var subjPoly = {};
                
                if(obj.polygon && obj.type === "" && tile.image){
                    subjPoly.src = 'client/assets/maps/'+tile.image
                    subjPoly.gid = tileObj.firstgid + tile.id
                    subjPoly.type = 'static'
                    subjPoly.width = tile.imagewidth
                    subjPoly.height = tile.imageheight


                    subjPoly.hitPoly = new Polygon(obj.polygon.map((point)=> {
                        return {
                            x:point.x + obj.x, 
                            y:point.y + obj.y
                        }
                    }));
                    

                    if(tile.properties && tile.properties[0].name==="loot"){
                        subjPoly.lootSrc = "src/client/assets/maps/"+tile.properties[0].value
                    }
                    this.subj[subjPoly.gid] = subjPoly
                }

                if(tile.properties && tile.properties[0].name==="loot"){
                    subjPoly.loot = tile.properties[0].value
                }
            });
            else if(tileObj.name==='_road'||tileObj.name==='_trava') {
                this.subj[tileObj.firstgid+tile.id] = {
                    gid: tileObj.firstgid + tile.id,
                    src: 'client/assets/maps/'+tile.image,
                    type: tileObj.name.replace("_", ""),
                    width: tile.imagewidth,
                    height: tile.imageheight 
                }
            }
           
            if(tile.image){
                this.stockSubj[tileObj.firstgid + tile.id] = {}
                this.stockSubj[tileObj.firstgid + tile.id].src = 'client/assets/maps/'+tile.image
                this.stockSubj[tileObj.firstgid + tile.id].type = 'stock'
                this.stockSubj[tileObj.firstgid + tile.id].gid = tileObj.firstgid + tile.id

                this.stockSubj[tileObj.firstgid + tile.id].width = tile.imagewidth
                this.stockSubj[tileObj.firstgid + tile.id].height = tile.imageheight
            }
        });
    });
    loc.layers.forEach((layer)=> {
        if(layer.objects) layer.objects.forEach((obj)=> {
            if(!this.obj[obj.gid]) this.obj[obj.gid] = [];
            this.obj[obj.gid].push(obj)     // массив обьектов с одинаковым gid
        });
    });
    Object.keys(this.subj).forEach((key)=> {
        if(this.subj[key].lootSrc) this.subj[key].loot = this.subj[key].lootSrc 
    });
    

    this.createStatic =()=> { 
        Object.keys(this.obj).forEach((gid)=> {
            if(this.obj[gid]) this.obj[gid].forEach((obj, index)=> {  
                if(this.subj[gid]){ 
                    let newObjSprite = {}
                    newObjSprite.name = gid +":"+index
                    newObjSprite.gid = gid
                    newObjSprite.type = this.subj[gid].type??'static'
                    newObjSprite.x = obj.x
                    newObjSprite.src = this.subj[gid].src
                    newObjSprite.y = obj.y
                    //newObjSprite.anchor.set(0, 1)
                    newObjSprite.width = obj.width
                    newObjSprite.height = obj.height

                    
                    if(this.subj[gid].hitPoly){
                        let sx = obj.width/this.subj[gid].width;
                        let sy = obj.height/this.subj[gid].height;
                        
                        let poly = this.subj[gid].hitPoly.points.map((point)=> {
                            return new Point(
                                (point.x*sx) + obj.x,
                                ((point.y*sy) - obj.height)+obj.y         //! 
                            );
                        });
                        
                        Zona.locations[name].static[newObjSprite.name] = poly
                        newObjSprite.hitArea = new Polygon(poly)
                        newObjSprite.hitArea.type = 'static'

                        // есть таблица лута
                        if(this.subj[gid].loot){
                            newObjSprite.table = {
                                loot: this.subj[gid].loot,
                                timer: {}
                            }

                            newObjSprite.removeLootItem = function(guid, clb) {
                                if(this.table.itemsCell[guid]) clb(this.table.itemsCell)
                            }
                        }
                    }
                    
                    app.addChild(newObjSprite);
                }
            });
        });

        return this
    }
    this.createSpecial =()=> {
        loc.layers.forEach((layerObj)=> {
            if(layerObj.type === 'objectgroup'){
                if(layerObj.name==='zone') layerObj.objects.forEach((zone, index)=> { 
                    if(zone.polygon){
                        this.zone[zone.id] = {}
                        this.zone[zone.id].name = zone.id +":"+index
                        this.zone[zone.id].x = zone.x
                        this.zone[zone.id].y = zone.y
                        this.zone[zone.id].type = "zone"
                        this.zone[zone.id].zoneType = zone.type
                        this.zone[zone.id].width = zone.width
                        this.zone[zone.id].height = zone.height

                        let poly = zone.polygon.map((point)=> {
                            return new Point(point.x+zone.x, point.y+zone.y)
                        });

                        this.zone[zone.id].hitArea = new Polygon(poly)
                        Zona.locations[name].zone[zone.id] = poly
                        
                        let props;
                        // мапим пропсы
                        if(zone.properties){
                            zone.properties.forEach((prop)=> {
                                if(prop.value!==""&&prop.value.split){
                                    props = prop.value.split(";").map((v)=> {
                                        return v.split(":")
                                    })
                                }    
                            });
                            if(props){
                                let objProps = {}
                                props.map((arr)=> {
                                    if(arr[0] && arr[0]!=="") objProps[arr[0]] = !isNaN(arr[1]) ? +arr[1] : arr[1]
                                });
                                this.zone[zone.id].props = objProps;
                            }
                        }

                        app.addChild(this.zone[zone.id])
                    }
                });
                else if(layerObj.name==='triger' && layerObj.objects) layerObj.objects.forEach((triger, index)=> {
                    if(triger.polygon){
                        this.triger[triger.id] = {}
                        this.triger[triger.id].name = triger.id+":"+index
                        this.triger[triger.id].x = triger.x
                        this.triger[triger.id].y = triger.y
                        this.triger[triger.id].type = "triger"

                        let poly = triger.polygon.map((point)=> {
                            return new Point(point.x+triger.x, point.y+triger.y)
                        });

                        this.triger[triger.id].hitArea = new Polygon(poly)
                        Zona.locations[name].triger[triger.id] = poly

                        let props;
                        // мапим пропсы
                        if(triger.properties){
                            triger.properties.forEach((prop)=> {
                                if(prop.value!=="" && prop.value.split){
                                    props = prop.value.split(";").map((v)=> {
                                        let r = v.split(":")
                                        if(r.length===2){
                                            return [r[0].trim(), r[1].trim()]
                                        }
                                        else return ['', undefined]
                                    })
                                }  
                            });
                            if(props!==undefined){
                                let o = {}
                                props.map((arr)=> {
                                    if(arr[0] && arr[0]!=="") o[arr[0]] = !isNaN(arr[1]) ? +arr[1] : arr[1]
                                });
                                this.triger[triger.id].props = o;
                            }
                        }

                        //  ------- trigers --------
                        if(triger.type==='mini_loc'){
                            let mini = new MiniLocation(
                                this.triger[triger.id].props, 
                                {locId:name,x:triger.x,y:triger.y}, 
                                o,
                                Loader
                            );

                            this.triger[triger.id].props = {
                                ...this.triger[triger.id].props,
                                mini_loc: mini.name,
                                guid: mini.guid,
                                out: mini.exit
                            }
                        }
                        else if(triger.type==='exit'){
                            this.triger[triger.id].props = {
                                exit: this.triger[triger.id].props
                            }
                            this.triger[triger.id].exit = 'exit'
                        }
                        else if(triger.type==='trader'){
                            this.triger[triger.id].props = {
                                ...this.triger[triger.id].props,
                                trader: ""
                            }
                            this.triger[triger.id].hitArea.trader = ""
                        }

                        app.addChild(this.triger[triger.id])
                    }
                });
                else if(layerObj.name==='stop' && layerObj.objects) layerObj.objects.forEach((stop, index)=> {
                    if(stop.polygon){
                        this.stop[stop.id] = {}
                        this.stop[stop.id].name = stop.id+":"+index
                        this.stop[stop.id].x = stop.x
                        this.stop[stop.id].y = stop.y
                        this.stop[stop.id].type = 'stop'

                        let poly = stop.polygon.map((point)=> {
                            return new Point(point.x+stop.x, point.y+stop.y)
                        });
                        
                        this.stop[stop.id].hitArea = new Polygon(poly)
                        Zona.locations[name].stop[stop.id] = poly
                        app.addChild(this.stop[stop.id])
                    }
                });
                else if(layerObj.name==='_road' && layerObj.objects) layerObj.objects.forEach((zone, index)=> {
                    if(zone){
                        this.stock[zone.id] = {}
                        this.stock[zone.id].name = zone.id +":"+index
                        this.stock[zone.id].x = zone.x
                        this.stock[zone.id].y = zone.y
                        this.stock[zone.id].type = "road"
                        this.stock[zone.id].width = zone.width
                        if(this.subj[zone.gid] && this.subj[zone.gid].src) this.stock[zone.id].src = this.subj[zone.gid].src
                    }
                });
            }
        });
    }

    this.createStatic()
    this.createSpecial()

    return {
        container: app, 
        subj: this.subj
    }
}


module.exports = Loader;