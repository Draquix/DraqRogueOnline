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
    let forge = nod.forge;
    socket.emit('handshaking', {id:socket.id,maps,tick:ticker,forge});
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
            socket.emit('player update',{player:player});
            // console.log('Player list obj:',PLAYER_LIST[socket.id].backpack);
        });
    socket.on('equip', data => {
        var item = PLAYER_LIST[socket.id].backpack[data.index];
        console.log('trying to equip: ',item);
        if(item.type==="tool"){
            if(PLAYER_LIST[socket.id].gear.tool.length>0){
                let removed = PLAYER_LIST[socket.id].gear.tool[0];
                PLAYER_LIST[socket.id].gear.tool.pop();
                PLAYER_LIST[socket.id].backpack.push(removed);
            }
            PLAYER_LIST[socket.id].gear.tool.push(item);
        }
        PLAYER_LIST[socket.id].backpack.splice(data.index,1);
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:false});
    });
    socket.on('unequip', data => {
        let item = PLAYER_LIST[socket.id].gear[data.key][0];
        console.log(item);
        PLAYER_LIST[socket.id].gear[data.key].pop();
        PLAYER_LIST[socket.id].backpack.push(item);
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:false});
    });
    socket.on('chest to inv', data => {
        console.log('data',data.data);
        let item = PLAYER_LIST[socket.id].chest[data.data];
        if(PLAYER_LIST[socket.id].liftable(item)){
            PLAYER_LIST[socket.id].kg += item.kg;
            PLAYER_LIST[socket.id].backpack.push(item);
            PLAYER_LIST[socket.id].chest.splice(data.data,1);
        }
        socket.emit('player update', {player:PLAYER_LIST[socket.id],atChest:true});
    });
    socket.on('inv to chest', data => {
        let item = PLAYER_LIST[socket.id].backpack[data.data];
        PLAYER_LIST[socket.id].kg -= item.kg;
        PLAYER_LIST[socket.id].chest.push(item);
        PLAYER_LIST[socket.id].backpack.splice(data.data,1);
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:true});
    });
    socket.on('stackpack', data=> {
        console.log('stacked pack from above: ',data);
        let player = PLAYER_LIST[socket.id];
        for(var i = data.del.length;i>0;i--){
            player.backpack.splice(data.del[i-1],1);
        }
        player.backpack.push(data.stack);
        // console.log(player.backpack);
        socket.emit('player update',{player,atChest:false});
    });
    socket.on('unstack', data =>{
        console.log('unstacking: ',data.stack)
        PLAYER_LIST[socket.id].backpack.splice(data.num,1);
        for(i in data.stack.pack){
            PLAYER_LIST[socket.id].backpack.push(data.stack.pack[i]);
        }
        let player = PLAYER_LIST[socket.id];
        console.log('after unstack',player);
        socket.emit('player update',{player,atChest:false});
    });
    socket.on('load forge', data => {
        let ore = PLAYER_LIST[socket.id].backpack[data.num];
        PLAYER_LIST[socket.id].backpack.splice(data.num,1);
        PLAYER_LIST[socket.id].forgeContents.push(ore);
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:false});
        socket.emit('forge');
    });
    socket.on('key press', data => {
        // console.log('Key fired: ',data);
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
    socket = SOCKET_LIST[id];
    if(targ==="1"||targ==="2"||targ==="3"||targ==="4"||targ==="5"||targ==="6"){
        let poi = maps.PoIcheck(targ);
        socket.emit('poi',{poi});
    } else if (targ==="P"){
            if(x==3||y==4){
                var npc = nod.NPCBox[0];
            } else if (x==6||y==7){
                var npc = nod.NPCBox[1];
            }
            // next to bracket above ->// else if (x>12||y>10){
            //     let npc = nod.NPCBox[2];
            // }
        socket.emit('npc',npc);
    } else if (targ==="%"){
        socket.emit('chest');
    } else if (targ==="c"||targ==="t"||targ==="i"){
        let node = nod.getNode(targ);
        PLAYER_LIST[id].doFlag="mining";
        PLAYER_LIST[id].data = node;
        socket.emit("node",node);
    } else if (targ==="T"||targ==="O"){
        let node = nod.getNode(targ);
        PLAYER_LIST[id].doFlag="woodchopping";
        PLAYER_LIST[id].data=node;      
        socket.emit("node",node);
    } else if (targ==="!"){
        console.log('not implemented yet.');
    } else if (targ==="="){
        socket.emit('forge');
    }
    
    
    console.log('collision target: ',x,y,targ);
}
//Async runtime for live gameplay -- first for update screen and draw player
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
            id:PLAYER_LIST[i].id,
            tick:ticker 
         });
    }
    io.emit('Tick',pack);
},200);

setInterval( function () {
    
    for(i in PLAYER_LIST){
        var socket = SOCKET_LIST[PLAYER_LIST[i].id]
        if(!(PLAYER_LIST[i].doFlag==="nothing")){
            if(PLAYER_LIST[i].doFlag==="mining"){
                if(PLAYER_LIST[i].gear.tool.length>0 && PLAYER_LIST[i].gear.tool[0].skill==="mine"){
                    if(PLAYER_LIST[i].mine>=PLAYER_LIST[i].data.req){
                        let rng = Math.random();
                        let skill = (PLAYER_LIST[i].mine/100)+PLAYER_LIST[i].data.baseDiff+(PLAYER_LIST[i].gear.tool[0].bonus/100);
                        console.log("mining away with ",rng," as rng and ",skill," as modified success...");
                        if(rng<skill){
                            let success = PLAYER_LIST[i].data.onSuccess();
                            PLAYER_LIST[i].mineXp += success[1];
                            if(PLAYER_LIST[i].liftable(success[0])){
                                PLAYER_LIST[i].backpack.push(success[0]);
                                PLAYER_LIST[i].kg+= success[0].kg;
                                socket.emit('msg',{msg:`You successfully mine a chunk of ${success[0].name} with a purity of ${success[0].purity}, weighing ${success[0].kg} and gain${success[1]} xp.`});
                                if(PLAYER_LIST[i].mineXp>=PLAYER_LIST[i].mineTnl){
                                    PLAYER_LIST[i].mine++;
                                    PLAYER_LIST[i].mineTnl =40*PLAYER_LIST[i].mine*1.2;
                                    socket.emit('msg',{msg:`Your mining level has increased to ${PLAYER_LIST[i].mine}!`});
                                }
                                socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});
                            } else {
                                PLAYER_LIST[i].doFlag="nothing";
                                PLAYER_LIST[i].data = {};
                                socket.emit('msg',{msg:"You cannot hold any more items."});
                            }                        }
                    }else{
                        PLAYER_LIST[i].doFlag="nothing";
                        PLAYER_LIST[i].data = {};
                        socket.emit('msg',{msg:"You do not have the appropriate skill level to mine here."});
                    }
                } else {
                    PLAYER_LIST[i].doFlag="nothing";
                    PLAYER_LIST[i].data = {};
                    socket.emit('msg',{msg:"You do not have a pickaxe equipped for mining."});
                }
            }
        }
    }
},3000);


//With all the files loaded, the below statement causes the server to boot up and listen for client connect

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');


