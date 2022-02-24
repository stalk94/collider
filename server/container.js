const chalk = require("chalk");
const { createPoly } = require("./global");
const Matter = require("matter-js");


const Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner, Bodies = Matter.Bodies, Composite = Matter.Composite, Events = Matter.Events;
const color = {
    static: "#fbe565",
    stop: "#fafafa",
    triger: "#b47ed9",
    zone: "#5bf3f5",
    user: "#6bf55b",
    bullet: "#f5705b",
    item: "#a172f3",
    null: "#4d4d4d"
}



class Container {
    constructor(locationData) {
        this.locId = locationData.name;
        this.engine = Engine.create();
        this.engine.gravity.scale = 0;
        this.createState();

        locationData.children.map((elem)=> this.addChild(elem));

        Events.on(this.engine, 'collisionStart', (event)=> {
            let pairs = event.pairs;
            for(let i = 0; i < pairs.length; i++){
                let pair = pairs[i];
                console.log(chalk.gray('collisionStart'));
                console.log(chalk.redBright(`
                    bodyA: ${JSON.stringify(pair.bodyA)}
                    bodyB: ${JSON.stringify(pair.bodyB)}
                `));

                pair.bodyA.render.fillStyle = '#333';
                pair.bodyB.render.fillStyle = '#333';
                this.state.set((state)=> {
                    pair.event = 'collisionStart';
                    state[event.timestamp] = pair;
                    return state;
                });
            }
        });
        Events.on(this.engine, 'collisionEnd', (event)=> {
            let pairs = event.pairs;
            for(let i = 0; i < pairs.length; i++){
                let pair = pairs[i];
                console.log(chalk.bgGrey('collisionEnd'));
                console.log(chalk.bgGreen(`
                    bodyA: ${JSON.stringify(pair.bodyA)}
                    bodyB: ${JSON.stringify(pair.bodyB)}
                `));
    
                pair.bodyA.render.fillStyle = color[pair.bodyA.type];
                pair.bodyB.render.fillStyle = color[pair.bodyB.type];
                this.state.set((state)=> {
                    pair.event = 'collisionEnd';
                    state[event.timestamp] = pair;
                    return state;
                });
            }
        });
    }
    createState() {
        if(!store.get()[this.locId]) store.set((state)=> {
            state[this.locId] = {}
            return state;
        });
        this.state = store[this.locId];
    }
    addChild(elem) {
        if(elem.hitArea){
            let obj = Bodies.polygon(0, 0, elem.hitArea.points.length/2, 0, {
                vertices: createPoly(elem),
                position: {
                    x: elem.x + (elem.width/2), 
                    y: elem.y - (elem.height/2)
                }
            });
            if(elem.type && (elem.type==='static'||elem.type==='stop')){
                obj.isStatic = true;
            }
            else if(elem.type && (elem.type==='triger'||elem.type==='zone')){
                obj.isSensor = true
            }
            
            obj.type = elem.type;
            obj.label = elem.name;
            obj.color = color[elem.type];
            Composite.add(this.engine.world, [obj]);
        }
    }
    getChildName(name) {
        let find = this.engine.world.bodies.find((body)=> body.label===name && body);

        return find;
    }
    run(dt) {
        Engine.update(this.engine, dt);
    }
}


module.exports = Container