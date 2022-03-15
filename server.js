//Server file running socket.io from simple http express server
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '/static')));
const mongojs = require('mongojs');
const db = mongojs ('mongodb://localhost:27017/player');
//loading modular libraries
const obj = require('./lib/objects');
const nod = require('./lib/nodes');
const pc = require('./lib/player');
const maps = require('./lib/maps');

//Global Variablies
let SOCKET_LIST = {};
var PLAYER_LIST = {};

//Socket.io handling for client/server communications
io.on('connection', socket => {
    console.log('a client has connected');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking', {id:socket.id,maps});
    socket.on('chat', data => {
        io.emit('msg', data);
    });

    socket.on('login', user => {
        console.log('attempting login of: ',user);

        var player = {};
        // db.player.find({name:user.name}, (err,res) =>{
            //console.log(err);
            // if(res.length>0){
            //    if(res[0].passphrase==user.phrase){
            //         console.log('successfull login');
            //         player = pc.loginPlayer(user.name);
            //    } else if (res[0].passphrase!=user.phrase) {
            //        console.log('wrong password');
            //        socket.emit('alert',{msg:"That name is taken but you have the wrong passphrase."});
            //    }
            // } else {
            console.log('new user');
            let tell = "---<"+user.name+">-- "+"has just logged in!";
            socket.emit('msg',{msg:tell});
            player = new pc.Player(user.name,user.phrase,socket.id);
            player.init();
           // pc.savePlayer(player);
            //console.log(player);
            // }
            // console.log(player);

            PLAYER_LIST[socket.id] = player;
            socket.emit('player update',player);
            // console.log('Player list obj:',PLAYER_LIST[socket.id].backpack);
        });
    socket.on('equip', data => {
        var item = PLAYER_LIST[socket.id].backpack[data.index];
        console.log('trying to equip: ',item);
        if(item.type==="tool"){
            PLAYER_LIST[socket.id].gear.tool.push(item);
        }
        PLAYER_LIST[socket.id].backpack.slice(data.index);

        socket.emit('player update', PLAYER_LIST[socket.id]);
    });
    socket.on('key press', data => {
        console.log('Key fired: ',data);
        var player = PLAYER_LIST[data.id];
        if(data.target===","||data.target==="."||data.target==="+"||data.target===";"){
            player.move(data.inputDir);
        } else {
            collision(data.id,player.xpos,player.ypos,data.target);
        }
    });

});
//Collision for map interaction
function collision(id,x,y,targ){
    if(targ==="1"||targ==="2"||targ==="3"||targ==="4"||targ==="5"||targ==="6"){
        let poi = maps.PoIcheck(targ);
        socket = SOCKET_LIST[id];
        socket.emit('poi',{str:poi});
    }
    console.log('collision target: ',targ);
}
//Async runtime for live gameplay
let ticker = 0;
setInterval( function () {
    ticker++;
    if(ticker % 20===0){
        console.log(`Running steady for ${ticker} game ticks.`);
    }
    let pack = [];
    for(i in PLAYER_LIST){
        pack.push({
            xpos:PLAYER_LIST[i].xpos,
            ypos:PLAYER_LIST[i].ypos,
            id:PLAYER_LIST[i].id       
         });
        let socket = SOCKET_LIST[i];
        socket.emit('Tick',pack);
    }
},200);


//With all the files loaded, the below statement causes the server to boot up and listen for client connect

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');


