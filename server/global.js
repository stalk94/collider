Array.prototype.toStrings = function(symbol=",") {
    let rezult = '';
    this.map((elem, i)=> {
        if(i!==0) rezult += symbol + elem;
        else rezult += elem;
    });
    return rezult
}
/** Сводит к уникальным неповторяющимся символам */
globalThis.regUniq =(str)=> str.replace(/(.)\1+/g, '$1');


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

exports.createPoly =(elem)=> {
    let points = elem.hitArea.points.reduce((p, c) => {
        if (p[p.length - 1].length === 2) {
            p.push([]);
        }

        p[p.length - 1].push(c);

        return p;
    }, [[]]);
    
    return points.map((point)=> {
        return new Matter.Vector({x: point[0], y: point[1]})
    });
}