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
let NPCBox = {
    NPCs:[],
    showNPC:function(npcNum){
        return this.NPCs[npcNum]
    }
};



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
        if(data.inputDir==='left'){
            let stepTile = MapBox[player.map][player.ypos-1][player.xpos-1];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.xpos--;
            } else {
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos,player.id);
                player.BumpFlag = true;
            }
        }
        if(data.inputDir==='right'){
            let stepTile = MapBox[player.map][player.ypos-1][player.xpos+1];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.xpos++;
            } else {
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos,player.id);
                player.BumpFlag = true;
            }
        }   
        if(data.inputDir==='up'){
            let stepTile = MapBox[player.map][player.ypos-2][player.xpos];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.ypos--;
            } else {
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos,player.id);
                player.BumpFlag = true;
            }
        }
        if (data.inputDir==='down'){
            let stepTile = MapBox[player.map][player.ypos][player.xpos];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.ypos++;
            } else {
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos,player.id);
                player.BumpFlag = true;
            }
        }
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
                pack.push({
                    stats:player.stats,
                    xpos:player.xpos,
                    ypos:player.ypos,
                    mapDex:player.map,
                    tileTarget:player.tileTarget
                });
                let socket = SOCKET_LIST[i];
                socket.emit('draw player',{pack, id: socket.id});
            }
            let BumpPack = [];
            for (var i in PLAYER_LIST){
                let player = PLAYER_LIST[i]
                if(player.BumpFlag===true){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = false;
                    let socket = SOCKET_LIST[i];
                    socket.emit('Bump Pack',{BumpPack, id: socket.id});
                }
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
    this.tileTarget = " ";
    this.BumpPack = {};
    this.BumpFlag = false;
    console.log("player created by name of:" , this.name);

}

console.log('server dependencies loaded...');
function collision(tile,map,x,y,id){
    if(tile==="P"){
        console.log("gotta P");
        for(var i = 0; i < LegendBox[map].coordNPC.length; i++){
            console.log('NPC coordinates',x,y ,LegendBox[map].coordNPC[i][0],LegendBox[map].coordNPC[i][1]);
            if((LegendBox[map].coordNPC[i][0]===x-1||LegendBox[map].coordNPC[i][0]===x||LegendBox[map].coordNPC[i][0]===x+2)&&(LegendBox[map].coordNPC[i][1]===y-1||LegendBox[map].coordNPC[i][1]===y||LegendBox[map].coordNPC[i][1]===y+1)){
                console.log('got a coordinate hit.');
                return NPCBox.showNPC(i);
            }
        }

    }
}
const port = process.env.PORT || 3000;
const map0 = [
        ['#','#','#','#','#','#','#','#','#','#','#','#','#'],
        ['#','.',',','#','=','#','-','#',',','.','.',',','#'],
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
    coordNPC: [[4,5],[7,8]],
    indexNPC:[0,1],
    Wall: 'grey',
    floorDots: 'gray',
    floorSpots: 'blue',
};

MapBox.push(map0);
LegendBox.push(legend0);
const NPC0 = {
    name: "Balaster",
    conversations: [
        {message:"Ahh, welcome newcomer to DraqRogue!",choice:["Where am I?","What should I do?"],answerI:[1,2],end:false},
        {message:"These are the starting barracks... people begin here to feed the machine.",choice:["...the machine?"],answerI:[3],end:false},
        {message:"In this room is a furnace and an anvil. If you had the materials, you could smelt and forge things.",choice:["Where do I get materials?","Is there anything else to do?"],answerI:[4,5],end:false},
        {message:"Draq wages constant war on other realms, so he needs to train people to work and fight to grind them down!",choice:["Who's the wizard in green?","What should I do?"],answerI:[6,2],end:false},
        {message:"Go out the door to the work yard and train on menial tasks so you become a good cog.",end:true},
        {message:"Aside from gathering and crafting, we do need good soldiers... you could train at combat. Also head out the door for that",end:true},
        {message:"Oh, that's wizard Gillar. He can teach you about the inventory storage system.",end:true}
    ],
    questBool:false
}
const NPC1 = {
    name: "Gillar",
    conversations:[
        {message:"Confound it! I can never understand how this singularity point allows you to take and leave things at will with such capacity!",end:true}
    ],
    questBool:true
}
NPCBox.NPCs.push(NPC0);
NPCBox.NPCs.push(NPC1);
server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
