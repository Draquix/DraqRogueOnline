//Server Engine for DraqRogueOnline - from tutorial on medium.com/
// articles by folkerjanvanderpol on using socket.io for multiplayer online games.
// Customizations and modifications into DraqRogueOnline done by Daniel Rogahn
// aka Draquix 05/12/2021

require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, '/static')));

let SOCKET_LIST = {};
let PLAYER_LIST = [];
let MapBox = [];
let LegendBox = [];




io.on('connection', socket => {
    console.log('Some client connected...');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking',{id: socket.id},MapBox,LegendBox);
    socket.on('login', user => {
        console.log('player login: ', user);
        let name = user.name;
        let pass = user.phrase;
        player = new Player(name, pass, socket.id);
        PLAYER_LIST[socket.id] = player;
        console.log(PLAYER_LIST);
        socket.emit('player create',{pc:player,id: socket.id});
    });
    socket.on('key press', data => {
        player = PLAYER_LIST[socket.id];
        if(data.inputDir==='left')
            player.xpos--;
        if(data.inputDir==='right')
            player.xpos++;
        if(data.inputDir==='up')
            player.ypos--;
        if (data.inputDir==='down')
            player.ypos++;  
    });
    socket.on('chat', message => {
        console.log('message from client: ', message);
        io.emit('chat', {message, id: socket.id});
    });
});
let timer = 0;
setInterval(function() {
            let pack = [];
            for (var i in PLAYER_LIST){
                let player = PLAYER_LIST[i];
                player.updatePos();
                pack.push({
                    xpos:player.xpos,
                    ypos:player.ypos,
                    mapDex:player.map
                });
                let socket = SOCKET_LIST[i];
                socket.emit('draw player',{pack, id: socket.id});
            }
    timer++;
    if ((timer%50)===0){
        console.log(timer, 'ticks elapsed');
    }
}, 100);

function Player (name, passphrase, id){
    this.username = name;
    this.passphrase = passphrase;
    this.id = id;
    this.xpos = 2;
    this.ypos = 2;
    this.stats = {
        str:1,dex:1,def:1,mHp:10,hp:10,coin:100
    };
    this.map = 0;
    this.pressRight = false;
    this.pressLeft = false;
    this.pressUp = false;
    this.pressDown = false;
    console.log("player created by name of:" , this.name);

this.updatePos = function(){
    if(this.pressRight===true)
        this.xpos++;
    if(this.pressLeft===true)
        this.xpos--;
    if(this.pressUp===true)
        this.ypos--;
    if(this.pressDown===true)
        this.ypos++;
    }
}

console.log('server dependencies loaded...');

const port = process.env.PORT || 3000;
const map0 = [
        ['#','#','#','#','#','#','#','#','#','#','#','#','#'],
        ['#','.',',','#','=','#','=','#',',','.','.',',','#'],
        ['#','.',',','.','.','*','.','.',',','.','.',',','#'],
        ['#','.','.','.','.','.','.','.','.','.','.','.','#'],
        ['#','.','.','P','.','.','.','.','.','#','1','#','#'],
        ['#',',','.','.',',','.','.',',','.','#'],
        ['#',',','.','.',',','.','.',',','.','#'],
        ['#',',','.','.',',','.','P',',','.','#','#'],
        ['#',',','.','.',',','.','%',',','.','&','#'],
        ['#',',','.','.',',','.','.',',','.','*','#'],
        ['#','#','#','#','#','#','#','#','#','#','#']
];
const legend0 ={
    NPC: ['red','green'],
    Craft: ['dark red','grey'],
    Wall: 'dark grey',
    floorDots: 'grey',
    floorSpots: 'blue',
};
MapBox.push(map0);
LegendBox.push(legend0);

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
