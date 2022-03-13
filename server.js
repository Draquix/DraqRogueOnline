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
let PLAYER_LIST = {};

//Socket.io handling for client/server communications
io.on('connection', socket => {
    console.log('a client has connected');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking', {id:socket.id,maps});

    socket.on('login', user => {
        console.log('attempting login of: ',user);
        var player = {};
        db.player.find({name:user.name}, (err,res) =>{
            //console.log(err);
            if(res.length>0){
               if(res[0].passphrase==user.phrase){
                    console.log('successfull login');
                    player = pc.loginPlayer(user.name);
               } else {
                   console.log('wrong password');
                   socket.emit('alert',{msg:"That name is taken but you have the wrong passphrase."});
               }
            }
            console.log('new user');
            player = new pc.Player(user.name,user.phrase,socket.id);
            player.init();
            pc.savePlayer(player);
            //console.log(player);
            console.log(player);
            socket.emit('player update',player);

        });
    });
});

//With all the files loaded, the below statement causes the server to boot up and listen for client connect

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');


