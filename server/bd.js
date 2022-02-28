const chalk = require("chalk");
const bd = require("quick.db");
const { createState } = require("@hookstate/core");
const { EventEmmitter } = require("./global");


global.EVENT = new EventEmmitter();
function WatchPlugin() {
    return ({
        id: Symbol('WatchPlugin'),
        init:(s)=> {
            return({
                onSet: (data)=> {
                    bd.set("STATE", data.state);
                    let name = data.path.toStrings(".");
                    EVENT.emit(name, data.value);
                    if(name!=='_time') console.log(chalk.blueBright(name));
                },
                onDestroy: (data)=> {
                    delete EVENT.events[data.path.toStrings(".")];
                    console.log('state detroyed', data.state);
                }
            });
        }
    });
}

if(!bd.has("STATE")) bd.set("STATE", {_time:0});
const globalState = createState(bd.get("STATE"));
globalState.attach(WatchPlugin);
setInterval(()=> globalState._time.set(Date.now()), 1000);


global.store = globalState;