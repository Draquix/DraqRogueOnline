//Server Engine for DraqRogueOnline - from tutorial on medium.com/
// articles by folkerjanvanderpol on using socket.io for multiplayer online games.
// Customizations and modifications into DraqRogueOnline done by Daniel Rogahn
// aka Draquix 05/12/2021


//This portion loads the modules that create a basic server that accepts client connections and
//socket.io to send game data back and forth as a multiplayer game. The modules do most of that
//work for me... it's just the game logic and content that I design.
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, '/static')));

//GLOBAL VARIABLES - these are mostly containers so allow functions to manipulate objects at a
//local level and then put back in the container to reflect changes on a global scope.
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
let POIBox = {
    POIs:[],
    showPOI:function(poiNum){
        return this.POIs[poiNum]
    }
}
//This portion runs on a client connecting to a socket as an input/output handler to receive 
//data from client interaction such as logging in, or keypresses, or changes to the player's
//character such as gaining money, losing health, or winning a battle.
//It also handles the very simple chat feature.
io.on('connection', socket => {
    //on connect it assigns a random id to the socket and does a handshake with the client to
    //sync up player data.
    console.log('Some client connected...');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking',{id: socket.id},MapBox,LegendBox);
    //when a user logs in, a player is created on the server and a copy of it is sent to
    //the client for display and and local processes upon it over game events.
    socket.on('login', user => {
        console.log('player login: ', user);
        let name = user.name;
        let pass = user.phrase;
        player = new Player(name, pass, socket.id);
        genInventory(player);
        PLAYER_LIST[socket.id] = player;
        console.log(PLAYER_LIST);
        socket.emit('player create',{pc:player,id: socket.id});
    });
    //When the client emits that a key has been pressed, it checks for what the direction of movement
    //is and then the server locally calls functions that determine whether the player is to move
    //or if is colliding with another game element indicating an interaction to trigger and prepare
    //the data the client needs to converse with an NPC, or use the storage chest, or cook something
    //at the fire, or begin working at the anvil... and puts the object retured into an array on
    //the player object that is a container for interaction data to be emmitted on next tick
    socket.on('key press', data => {
        player = PLAYER_LIST[socket.id];
        if(data.inputDir==='left'){
            let stepTile = MapBox[player.map][player.ypos-1][player.xpos-1];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.xpos--;
            } else {
                player.BumpFlag = flagChecker(stepTile);
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos);
            }
        }
        if(data.inputDir==='right'){
            let stepTile = MapBox[player.map][player.ypos-1][player.xpos+1];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.xpos++;
            } else {
                player.BumpFlag = flagChecker(stepTile);
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos);
            }
        }   
        if(data.inputDir==='up'){
            let stepTile = MapBox[player.map][player.ypos-2][player.xpos];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.ypos--;
            } else {
                player.BumpFlag = flagChecker(stepTile);
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos);
            }
        }
        //a change
        if (data.inputDir==='down'){
            let stepTile = MapBox[player.map][player.ypos][player.xpos];
            player.tileTarget = stepTile;
            if(stepTile==="."||stepTile===","){
                player.ypos++;
            } else {
                player.BumpFlag = flagChecker(stepTile);
                player.BumpPack = collision(stepTile,player.map,player.xpos,player.ypos,player.id);
            }
        }
    });
    socket.on('firing forge', id => {
        player = PLAYER_LIST[socket.id];
        if(player.forge.mats.length>0)
            player.smelting = true;
    })
    socket.on('pack to chest', num => {
        player = PLAYER_LIST[socket.id];
        let item = player.backpack.splice(num.num,1);
        player.weightLoad -= item[0].weight;
        player.chest.push(item[0]);
        player.BumpFlag = 'Chest Bump';
    });
    socket.on('chest to pack', num => {
        player = PLAYER_LIST[socket.id];
        let item = player.chest.splice(num.num,1);
        player.backpack.push(item[0]);
        player.weightLoad += item[0].weight;
        console.log(player.backpack);
        player.BumpFlag = 'Chest Bump';
    });
    socket.on('load ore', num => {
        player = PLAYER_LIST[socket.id];
        console.log('load ore triggered : ', player.backpack[num.num]);
        let ore = player.backpack[num.num];
        console.log(player.backpack);
        player.backpack.splice(num.num,1);
        console.log(player.backpack);
        player.forge.mats.push(ore);
        // delete player.backpack[num.num];
        player.forgeBypass = true;
        player.BumpFlag = 'Chest Bump';
    });
    socket.on('remove ore', num => {
        player = PLAYER_LIST[socket.id];
        let ore = player.forge.mats[num.num];
        player.forge.mats.splice(num.num,1);
        player.backpack.push(ore);
        // delete player.forge.mats[num.num];
        player.forgeBypass = true;
        player.BumpFlag = 'Chest Bump';
    });
    socket.on('get bar', num => {
        player = PLAYER_LIST[socket.id];
        let bar = player.forge.product[num.num];
        player.forge.product.splice(num.num,1);
        player.backpack.push(bar);
        player.forgeBypass = true;
        player.BumpFlag = 'Chest Bump';
    });
    socket.on('food on fire', num => {
        player = PLAYER_LIST[socket.id];
        let food = player.backpack[num.num];
        console.log(food);
        if(player.stats.cook>=food.base){
            let skillcheck = Math.random() - player.stats.cook*.01;
            console.log('skill checks: ', skillcheck, food.difficulty);
            if(skillcheck<food.difficulty){
                food.raw=false;
                player.BumpPack.message = "You cooked it successfully!";
                socket.emit('cook success');
            } else {
                delete player.backpack[num.num];
                player.BumpPack.message = "You burned the shit out of it!";
                socket.emit('cook failure',);
            }
            player.fireBypass = true;
            player.BumpFlag = 'Chest Bump';
        }
    });
    //this recieves input data from on a client's form and emits the message to all clients
    //connected to have a live chat system.
    socket.on('chat', message => {
        console.log('message from client: ', message);
        io.emit('chat', {message, id: socket.id});
    });
});
//This is the runtime engine. It runs every 100ms (or would if the system could do it) and has a
//timer variable to count the ticks from when the last time the server booted up. It checks 
//against certain flags to have distinct socket.emits for different types of interactions so both
//the server and the client know what the player is doing and what it's last action led it to 
//encounter. It also transmits player's positions for all the players logged in at one time, so 
//the multiplayer presence can be maintained.

let timer = 0;
//This is the craft/combat ticker for ongoing actions.
setInterval(function() {
    let pack = [];
    for (var i in PLAYER_LIST){
        let player = PLAYER_LIST[i];
        if(player.smelting===true){
            let ore = player.forge.mats[player.forge.mats.length-1];
            var msg = 'Burning one chunk of ' + ore.name + ' with a purity of ' + ore.purity;
            console.log('levels:',player.stats.forge, ore.base);
            if(player.stats.forge>=ore.base){
                console.log('smelting the recipe');
                let skillcheck = Math.random() - player.stats.forge*.01;
                if(skillcheck<ore.difficulty){
                    player.forge.pureNum += ore.purity;
                    player.forge.type = ore.metal;
                    msg += ' ...it was a successful smelt...'
                    player.forge.mats.pop();
                    if(player.forge.mats.length===0){
                        player.smelting=false;
                    }
                    if(player.forge.pureNum>1){
                        player.forge.pureNum--;
                        bar = new Bar(player.forge.type,3);
                        console.log(bar);
                        player.forge.product.push(bar);
                        msg += " And you got a pure bar back!";
                    }
                } else {
                    player.forge.mats.pop();
                    if(player.forge.mats.length===0){
                        player.smelting=false;
                    }
                    msg += "But the ore burned up in the furnace to no gain.";
                }
            }
            pack.push({forge:player.forge,smelting:player.smelting,message:msg});
            let socket = SOCKET_LIST[i];
            socket.emit('forging',{pack,id:socket.id});
            }
    }
},1200)
setInterval(function() {
            let pack = [];
            //this loop sends updated player data for each connection to every client to track
            //movement in multiplayer and show interactions
            for (var i in PLAYER_LIST){
                let player = PLAYER_LIST[i];
                pack.push({
                    name:player.name,
                    stats:player.stats,
                    weight:player.weightLoad,
                    xpos:player.xpos,
                    ypos:player.ypos,
                    mapDex:player.map,
                    tileTarget:player.tileTarget
                });
                let socket = SOCKET_LIST[i];
                socket.emit('draw player',{pack, id: socket.id});
            }
            //this loop sends data about a collision if a player has triggered an interaction
            //with some game element so the client can handle display and local processing of
            //success/fail chances in harvesting or combat. This is to take some of the workload
            //off the server as to support more connections without latency.
            let BumpPack = [];
            for (var i in PLAYER_LIST){
                let player = PLAYER_LIST[i]
                //to modularize the client, the data emitted for different interactions is
                //seperated by type. Later this will help with concurrent interactions like
                //being hit while mining.
                if(player.BumpFlag==='NPC Bump'){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('NPC Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='Chest Bump'){
                    BumpPack.push({chest: player.chest, pack: player.backpack,forge:player.forge, forgeFlag:player.forgeBypass, fireFlag:player.fireBypass});
                    player.BumpFlag = '';
                    player.forgeBypass = false;
                    player.fireBypass = false;
                    let socket = SOCKET_LIST[i];
                    socket.emit('Chest Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='Wall Bump'){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('Wall Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='Cookfire Bump'){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('Cookfire Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='POI Bump'){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('POI Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='Door Bump'){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('Door Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='Forge Bump'){
                    BumpPack.push(player.forge);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('Forge Bump',{BumpPack, id: socket.id});
                }
                if(player.BumpFlag==='Anvil Bump'){
                    BumpPack.push(player.BumpPack);
                    player.BumpFlag = '';
                    let socket = SOCKET_LIST[i];
                    socket.emit('Anvil Bump',{BumpPack, id: socket.id});
                }
            }
            
    //The timer counts ticks and logs every 50 ticks just to have a measure of speed and time
    //the server has been running and processing.
    timer++;
    if ((timer%50)===0){
        console.log(timer, 'ticks elapsed');
    }
}, 100);
// This is the player object constructor function. I try to keep as much local as possible so
// as not to hack the client and jump to level 10 instantly.
// --i do realize this means more attempts to hack the server instead, and i'm not looking forward to it.
function Player (name, passphrase, id){
    this.username = name;
    this.passphrase = passphrase;
    this.id = id;
    this.tool = [];
    this.xpos = 2;
    this.chest = [];
    this.backpack = [];
    this.ypos = 2;
    this.stats = {
        str:1,dex:1,def:1,mHp:10,hp:10,coin:100,
        mine:1,forge:1,gather:1,fish:1,cook:1,chop:1
    };
    this.weightLimit = 20 + 10*this.stats.str;
    this.weightLoad = 0;
    this.map = 0;
    this.pressRight = false;
    this.pressLeft = false;
    this.pressUp = false;
    this.pressDown = false;
    this.tileTarget = " ";
    this.BumpPack = {};
    this.BumpFlag = false;
    this.forgeBypass = false;
    this.smelting = false;
    console.log("player created by name of:" , this.name);
}
function Tool (name, type, level, weight){
    this.name = name;
    this.tool = true;
    this.type = type;
    this.weight = weight;
    this.level = level;
}
function Ore (metal, purity, weight, base, difficulty){
    this.tool = false;
    this.name = metal + ' ore';
    this.metal = metal;
    this.purity = purity;
    this.weight = weight;
    this.base = base;
    this.difficulty = difficulty;
}
function Bar(type,weight,base, difficulty){
    this.tool = false;
    this.name = type + ' bar';
    this.type = type;
    this.weight = weight;
    this.base = base;
    this.difficulty = difficulty;
}
function Food( name, raw, health, weight, base, difficulty){
    this.tool = false;
    this.name = name;
    this.raw = raw;
    this.health = health;
    this.weight = weight;
    this.base = base;
    this.difficulty = difficulty;
}

console.log('server dependencies loaded...');
function genInventory(player){
    let startingHammer = new Tool('Rusty Iron Hammer','hammer',5,5);
    player.chest.push(startingHammer);
    let startingPick = new Tool('Copper Pickaxe','pick',1,5);
    player.chest.push(startingPick);
    for(var i = 0; i < 6; i++){
        let copperore = new Ore('copper',.34,3,1,.8);
        player.chest.push(copperore);
    }
    for(var i = 0; i < 3; i++){
        let sardine = new Food("sardine",true,4,2,1,.7);
        player.chest.push(sardine);
    }
    let startingAxe = new Tool('Stone Hatchet','axe',1,5);
    player.weightLoad += startingAxe.weight;
    player.backpack.push(startingAxe);
    player.forge = {
        pureNum: 0,
        type: null,
        mats:[],
        product:[],
        smeltCopper: function(ore){
            for(var i = 0; i < ore; i++){
                let copperbar = new Bar('copper', 3);
                this.product.push(copperbar);
            }
        }
    }
}

//Collision Handling -- This just returns a value to set the player's flag that will alert
//the runtime engine what type of data it's sending.
function flagChecker(tile){
    if(tile==="P")
        return 'NPC Bump';
    if(tile==="#")
        return 'Wall Bump';
    if(tile==="%")
        return 'Chest Bump';
    if(tile==="&")
        return 'Cookfire Bump';
    if(tile==="*")
        return 'POI Bump';
    if(tile==="0"||tile==="1"||tile==="2"||tile==="3")
        return 'Door Bump';
    if(tile==="=")
        return 'Forge Bump';
    if(tile==="-")
        return 'Anvil Bump';
}
//Collision Handling -- Checks the tile that the player has encountered and determines what unique map
//element it is that the player is interacting with using the player's x,y coordinates and calls
//the appropriate function to return the data packet that handles that element's interactions.
function collision(tile,map,x,y,id){
    //NPC collision handler
    if(tile==="P"){   
        console.log("gotta P");
        for(var i = 0; i < LegendBox[map].coordNPC.length; i++){
            console.log('NPC coordinates',x,y ,LegendBox[map].coordNPC[i][0],LegendBox[map].coordNPC[i][1]);
            if((LegendBox[map].coordNPC[i][0]===x-1||LegendBox[map].coordNPC[i][0]===x||LegendBox[map].coordNPC[i][0]===x+2||LegendBox[map].coordNPC[i]===x+1)&&(LegendBox[map].coordNPC[i][1]===y-1||LegendBox[map].coordNPC[i][1]===y||LegendBox[map].coordNPC[i][1]===y+1||LegendBox[map].coordNPC[i][1][y+2])){
                console.log('got a coordinate hit.');
                return NPCBox.showNPC(i);
            }
        }
    }
    //Chest collision handler
    if(tile==="%"){
        console.log("%");
        for(var i = 0; i < LegendBox[map].coordNPC.length; i++){
            console.log('NPC coordinates',x,y ,LegendBox[map].coordNPC[i][0],LegendBox[map].coordNPC[i][1]);
            if((LegendBox[map].coordNPC[i][0]===x-1||LegendBox[map].coordNPC[i][0]===x||LegendBox[map].coordNPC[i][0]===x+2||LegendBox[map].coordNPC[i][0]===x+1)&&(LegendBox[map].coordNPC[i][1]===y-1||LegendBox[map].coordNPC[i][1]===y||LegendBox[map].coordNPC[i][1]===y+1||LegendBox[map].coordNPC[i][1][y+2])){
                console.log('got a coordinate hit.');
            }
        }
    }
    if(tile==="*"){
        console.log("*");
        for(var i = 0; i < LegendBox[map].coordPOI.length; i++){
            if((LegendBox[map].coordPOI[i][0]===x-1||LegendBox[map].coordPOI[i][0]===x||LegendBox[map].coordPOI[i][0]==x+2||LegendBox[map].coordPOI[i][0]===x+1)&&(LegendBox[map].coordPOI[i][1]===y-1||LegendBox[map].coordPOI[i][1]===y||LegendBox[map].coordPOI[i][1]===y+1||LegendBox[map].coordPOI[i][1][y+2])){
                console.log('encountered point of interest.');
                return POIBox.showPOI(i);
            }
        }
    }
    if(tile==="="){
        return {forge: true};
    }
    if(tile==="&"){
        return {fire: true};
    }
}
// ***GAME CONTENT DATA BELOW***

//MAPS: an array of characters define the map's layout. 
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
//LEGENDS: each map has a corresponding legend to work out unique interactions, so as to differentiate
// between the P that is one NPC and the P that is another, as well as monster data, and the reference
// of what map a door goes to.  There is also some color differentiation being used for flavor.
const legend0 ={
    NPC: ['red','green'],
    coordNPC: [[4,5],[7,8]],
    indexNPC:[0,1],
    coordPOI: [[6,3],[10,10]],
    indexPOI:[0,1],
    Wall: 'grey',
    floorDots: 'gray',
    floorSpots: 'blue',
};
 
//NPCs: NPC characters are represented as having a name, and a conversation tree, potentially quests and
//items for trade or sale.
const NPC0 = {
    name: "Balaster",
    conversations: [
        {message:"Ahh, welcome newcomer to DraqRogue!",choice:["Where am I?","What should I do?"],answerI:[1,2],end:false},
        {message:"These are the starting barracks... people begin here to feed the machine.",choice:["...the machine?"],answerI:[3],end:false},
        {message:"In this room is a furnace and an anvil. If you had the materials, you could smelt and forge things.",choice:["Where do I get materials?","Is there anything else to do?"],answer:[4,5],end:false},
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
//POIs:  Points of Interest are like signposts, when the character runs into them it displays a message
// about the contents of the nearby game world.
const POI0 = {message:['Here is the barracks forge and anvil.  The red "=" forge can be used to refine metal ores into ingots to be made into gear.  The "-" anvil along with a hammer can process those ingots into items']};
const POI1 = {message:['The red "&" fire is where you can cook basic meats into edible food to heal with.']};

//Game data is pushed to Global Variables that were established as containers to keep the game world
//static as the players interact with it and change their own unique experience.
MapBox.push(map0);
LegendBox.push(legend0);
NPCBox.NPCs.push(NPC0);
NPCBox.NPCs.push(NPC1);
POIBox.POIs.push(POI0);
POIBox.POIs.push(POI1)




//With all the files loaded, the below statement causes the server to boot up and listen for client connections.
server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
