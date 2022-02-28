const fs = require("fs");
const Matter = require("matter-js");
const pinoms = require('pino-multi-stream');

Array.prototype.toStrings = function(symbol=",") {
    let rezult = '';
    this.map((elem, i)=> {
        if(i!==0) rezult += symbol + elem;
        else rezult += elem;
    });
    return rezult
}


global.logger = pinoms(pinoms.multistream([{stream: fs.createWriteStream('log.log')},{stream: pinoms.prettyStream()}]))


exports.EventEmmitter = class {
    constructor() {
      this.events = {};
    }
    on(eventName, fn) {
        if(!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(fn);
        
        return ()=> {
            this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
        }
    }
    emit(eventName, data) {
        const event = this.events[eventName];
        if(event){
            event.forEach((fn)=> {
                fn.call(null, data);
            });
        }
    }
}
exports.Point = class {
    constructor(x, y) {
        this.get = Matter.Vector.create(x, y);
        return this.get;
    }
}
exports.Polygon = class {
    constructor(arrPoint) {
        this.points = arrPoint;
    }
}

exports.createPoly =(elem)=> {
    let points = elem.hitArea.points.reduce((p, c) => {
        if(p[p.length-1].length===2) p.push([]);
        p[p.length-1].push(c);

        return p;
    }, [[]]);
    
    return points
}