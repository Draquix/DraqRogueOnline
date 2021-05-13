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
let PLAYER_LIST = {};
let MapBox = [];


io.on('connection', socket => {
    console.log('Some client connected...');

    socket.on('login', user => {
        console.log('player login: ', user);
        player = new Player(user.username, user.passphrase, socket.id);
        PLAYER_LIST[socket.id] = player;
    });
    socket.on('chat', message => {
        console.log('message from client: ', message);
        io.emit('chat', {message, id: socket.id});
    });
});

setInterval(function() {
    let pack = [];
    for (var i in MAP_LIST){
        pack.push(MapBox[i]);
        for()
        for (var i in SOCKET_LIST){
            let socket = SOCKET_LIST[i];
            socket.emit('draw map', pack);
        };
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
