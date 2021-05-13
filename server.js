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


io.on('connection', socket => {
    console.log('Some client connected...');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking',{id: socket.id,maps:MapBox});
    
    socket.on('login', user => {
        console.log('player login: ', user);
        let name = user.name;
        let pass = user.phrase;
        player = new Player(name, pass, socket.id);
        PLAYER_LIST[socket.id] = player;
        console.log(PLAYER_LIST);
        socket.emit('player create',{pc:player,id: socket.id});
    });
    
    socket.on('chat', message => {
        console.log('message from client: ', message);
        io.emit('chat', {message, id: socket.id});
    });
});
let timer = 0;
setInterval(function() {
            let pack = {pc:[],map:MapBox};
            for (var j in PLAYER_LIST){
                let player = PLAYER_LIST[j];
                pack.pc.push(player);
                let socket = SOCKET_LIST[j];
                socket.emit('draw player',{pack, id: socket.id});
            }
    timer++;
    if ((timer%50)===0){
        console.log(timer, 'ticks elapsed');
    }
}, 256);

function Player (name, passphrase, id){
    this.username = name;
    this.passphrase = passphrase;
    this.id = id;
    this.stats = {
        str:1,dex:1,def:1,mHp:10,hp:10,coin:100
    };
    this.map = 0;
    console.log("player created by name of:" , this.name);
}
const map0 = {
    map:[
        ['#','#','#','#','#','#','#','#','#','#','#','#','#'],
        ['#','.',',','.','.',',','.','.',',','.','.',',','#'],
        ['#','.',',','.','.',',','.','.',',','.','.',',','#'],
        ['#','.','.','.','.','.','.','.','.','.','.','.','#'],
        ['#','.','.','P','.','.','.','.','.','#','+','#','#'],
        ['#',',','.','.',',','.','P',',','.','#'],
        ['#',',','.','.',',','.','%',',','.','#'],
        ['#','#','#','#','#','#','#','#','#','#'],
        ],
    NPC: ["red","green"],
    Wall: 'brown',
    floorDots: 'grey',
    floorSpots: 'blue'
};
const map1 = {
    map:[
        ['#','#','#','#','#','#','_','_','_','_','_','_','#','#','#','#','#','#','#','#','#'],
        ['#','.','.','.','.','#','#','#','#','#','#','#','#','.','.','.','.','&','P','T','#'],
        ['#','.',',','.','.','#','.','.',',','.','.','Q','#','.','.',',','T','.',',','.','#'],
        ['#','.',',','.','.','#','.','.',',','.','.','P','#','.','.',',','.','.',',','.','#'],
        ['#','.',',','.','.','#','.','.',',','.','%','#','#','.','.',',','.','.',',','.','#'],
        ['#','.',',','.','.','.','.','.','#','#','#','#','.','.',',',',',',',',','T',',','+'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','.','.','.',',','.','.','.','#'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','.',',','.',',','.','.','.','#'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','$','.','.',',','.','.','.','#'],
        ['#','$','P','.','.','.','.','.','.',',','.','.','.','P','.','.',',','.',',','.','#'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','.','.','.',',','.','#','#','#','#','#','#','#','#','#'],
        ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ],
    NPC: ["light green","black","dark blue","purple"],
    Wall: 'dark green',
    floorDots: 'lime green',
    floorSpots: 'dark brown'
};
MapBox.push(map0);
MapBox.push(map1);

console.log('server dependencies loaded...');

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
