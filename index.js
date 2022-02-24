require("./server/bd");     // store .set, .get || EVENT
const cors = require("cors");
const path = require("path");
const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});


app.get('/', (req, res)=> {
    res.sendFile(__dirname+'/src/index.html');
});



io.on("connection", (socket)=> {
    console.log(socket.id);

    socket.on("set", (req)=> {
        store.set((state)=> {
            state[req.key] = req.value;
            return state;
        });
    });
    socket.on("get", (req)=> {
        if(store.get()[req.key]){
            socket.emit("responce", store.get()[req.key]);
        }
    });
    socket.on("watch", (req)=> {
        EVENT.on(req.key, (value)=> {
            socket.emit("onWatch", value);
        });
    });
});



app.use(cors());
app.use('/', express.static(path.join(__dirname, '/src')));
app.use('/', express.static(path.join(__dirname, '/node_modules')));
httpServer.listen(3000);