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
const mob = require('./lib/mobs');
const e = require('express');

//Global Variablies
let SOCKET_LIST = {};
var PLAYER_LIST = {};
let forge = new nod.Forge();

//Socket.io handling for client/server communications
io.on('connection', socket => {
    console.log('a client has connected');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('handshaking', {id:socket.id,maps,tick:ticker,forge});
    socket.on('chat', data => {
        console.log(data);
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
            let tell = "<p style='color:red'>---"+user.name+"--- "+"<span style='color:white'>has just logged in!</span></p>";
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
            if(PLAYER_LIST[socket.id].gear.Tool.length>0){
                let removed = PLAYER_LIST[socket.id].gear.Tool[0];
                PLAYER_LIST[socket.id].gear.Tool.pop();
                PLAYER_LIST[socket.id].backpack.push(removed);
            }
            PLAYER_LIST[socket.id].gear.Tool.push(item);
            socket.emit('msg',{msg:`You equipped the ${item.name} as your tool.`,color:'light gray'});
            PLAYER_LIST[socket.id].backpack.splice(data.index,1);
            let player = PLAYER_LIST[socket.id];
            socket.emit('player update', {player,atChest:false});
        }
        console.log(item,PLAYER_LIST[socket.id].gear,'after equip...');
        if(item.type==='weapon'){    
            console.log('weapon equip...')

            if(PLAYER_LIST[socket.id].gear.Weapon.length>0){
                let removed = PLAYER_LIST[socket.id].gear.Weapon[0];
                PLAYER_LIST[socket.id].gear.Weapon.pop();
                PLAYER_LIST[socket.id].backpack.push(removed);
            }
            PLAYER_LIST[socket.id].gear.Weapon.push(item);
            socket.emit('msg',{msg:`You equipped the ${item.name} as your weapon.`,color:'pink'});
            PLAYER_LIST[socket.id].backpack.splice(data.index,1);
            let player = PLAYER_LIST[socket.id];
            socket.emit('player update', {player,atChest:false});
        }
    });
    socket.on('unequip', data => {
        let item = PLAYER_LIST[socket.id].gear[data.key][0];
        // console.log(item);
        PLAYER_LIST[socket.id].gear[data.key].pop();
        PLAYER_LIST[socket.id].backpack.push(item);
        let player = PLAYER_LIST[socket.id];
        socket.emit('msg',{msg:`You stopped using the ${item.name} and put it in your backpack.`,color:'dark gray'});
        socket.emit('player update', {player,atChest:false});
    });
    socket.on('chest to inv', data => {
        // console.log('data',data.data);
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
        // console.log('stacked pack from above: ',data);
        let player = PLAYER_LIST[socket.id];
        for(var i = data.del.length;i>0;i--){
            player.backpack.splice(data.del[i-1],1);
        }
        player.backpack.push(data.stack);
        // console.log(player.backpack);
        socket.emit('player update',{player,atChest:false});
    });
    socket.on('unstack', data =>{
        // console.log('unstacking: ',data.stack)
        PLAYER_LIST[socket.id].backpack.splice(data.num,1);
        for(i in data.stack.pack){
            PLAYER_LIST[socket.id].backpack.push(data.stack.pack[i]);
        }
        let player = PLAYER_LIST[socket.id];
        // console.log('after unstack',player);
        socket.emit('player update',{player,atChest:false});
    });
    socket.on('load forge', data => {
        let ore = PLAYER_LIST[socket.id].backpack[data.num];
        console.log('loadforge ore: ',ore);
        if(ore.type === "stack"){
            for(i in ore.pack){
                console.log('loading ore stack',ore,i);
                PLAYER_LIST[socket.id].PCforge.addOre(ore.pack[i]);
                console.log('forge obj: ',PLAYER_LIST[socket.id].PCforge);
            }
        } else {
            PLAYER_LIST[socket.id].PCforge.addOre(ore);
        }
        PLAYER_LIST[socket.id].backpack.splice(data.num,1);
        let player = PLAYER_LIST[socket.id];
        // console.log('loaded into forge: ',player.PCforge);
        player.kg -= ore.kg;
        socket.emit('player update', {player,atChest:false});
        socket.emit('forge');
    });
    socket.on('empty forge', data => {
        // console.log('empty forge',data);
        if(data==1){
            PLAYER_LIST[socket.id].PCforge.metal1={name:"none",purity:0};
        } else if (data==2){
            PLAYER_LIST[socket.id].PCforge.metal2={name:"none",purity:0};
        }
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:false});
        socket.emit('forge');
    });
    socket.on('smelting attempt', data => {
        let recipe = forge.recipes[data.rec[0]][data.rec[1]];
        // console.log('trying to smelt',recipe);
        console.log('smelting data',data);
             console.log('the forge before smelt: ',PLAYER_LIST[socket.id].PCforge);
        if(PLAYER_LIST[socket.id].PCforge.smelt(data.rec[0],data.rec[1])){
            console.log('post smelt method: ',PLAYER_LIST[socket.id].PCforge);
            PLAYER_LIST[socket.id].data=recipe;
            PLAYER_LIST[socket.id].doFlag='smelting';
            if(data.all){
                PLAYER_LIST[socket.id].doFlag+=' all';
                PLAYER_LIST[socket.id].data.all = data.rec;
            }
            socket.emit('msg',{msg:`You begin smelting a ${recipe.name} at the forge.`});
            socket.emit('forge');
        } else {
            socket.emit('msg',{msg:"You do not have enough ore to continue your smelting...",color:'pink'});
            PLAYER_LIST[socket.id].doFlag = 'nothing';
            PLAYER_LIST[socket.id].data = {};
            let player = PLAYER_LIST[socket.id];
            socket.emit('player update', {player,atChest:false});
            socket.emit('forge');
        }
    });
    socket.on('key press', data => {
        // console.log('Key fired: ',data);
        var player = PLAYER_LIST[data.id];
        if (PLAYER_LIST[socket.id].doFlag!='hostile encounter'){
            PLAYER_LIST[socket.id].doFlag = "nothing"; PLAYER_LIST[socket.id].data = {};
            if(data.target===","||data.target==="."||data.target==="+"||data.target===";"){
            player.move(data.inputDir);
            } else {
            collision(data.id,player.xpos,player.ypos,data.target);
            }
        } else {
            socket.emit('msg',{msg:"You are already in combat!"});
        }
        
    });
    socket.on('crafting attempt', data => {
        console.log('craft attempt : ',data);
        let attempt = false;
        data.craft.ingredients.forEach(element => {
            console.log(element,attempt);
            for (i in PLAYER_LIST[socket.id].backpack){
                if(element==PLAYER_LIST[socket.id].backpack[i].name){
                    PLAYER_LIST[socket.id].backpack.splice(i,1);
                    attempt = true;
                }
            }
        });
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update',{player,atChest:"false"});
        if(attempt === true) {
            PLAYER_LIST[socket.id].doFlag = "crafting at table";
            PLAYER_LIST[socket.id].data = data;
            PLAYER_LIST[socket.id].data.craft.cc++;
        } else {
            socket.emit('msg',{msg:"An attempt at crafting was rejected for not having all needed materials.",color:'red'});
        }
      
    });
    socket.on('debug lvl',data => {
        PLAYER_LIST[socket.id].levelUp(data);
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:false});
    });
    socket.on('combat style', data => {
        PLAYER_LIST[socket.id].combatStyle = data;
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update', {player,atChest:false});
    });
    socket.on('flee combat', data => {
        let chance = .5 - (data/10) + (PLAYER_LIST[socket.id].agi/10)
        let numb = Math.random();
        console.log('fleeing combat with ',chance,numb);
        if(chance>numb){
            PLAYER_LIST[socket.id].doFlag="nothing";
            let player = PLAYER_LIST[socket.id];
            socket.emit('player update',{player,atChest:false});
            socket.emit('msg',{msg:"You ran away from combat!"});
        } else {
            socket.emit('msg',{msg:"You try to bravely run away, and failed..."});
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
        socket.emit('craft',obj.recipeBook);
        PLAYER_LIST[id].data=obj.recipeBook;
        // console.log('not implemented yet.');
    } else if (targ==="="){
        socket.emit('forge');
    } else if (targ==="m"){
        if(PLAYER_LIST[id].data){
            console.log(PLAYER_LIST[id].data, 'data chunk on player');
            if(PLAYER_LIST[id].data.alive!=true){
                PLAYER_LIST[id].doFlag='hostile encounter';
                let s = Math.floor(Math.random()*mob.mobsList.length);
                PLAYER_LIST[id].data=mob.mobMaker(mob.mobsList[s]);
                socket.emit('mob', PLAYER_LIST[id].data);
            } else {
                console.log('player already has a target');
                PLAYER_LIST[id].doFlag='hostile encounter';
            }
    }}
    console.log('collision target: ',x,y,targ);
}
//Async runtime for live gameplay -- first for update screen and draw player
let ticker = 0;
setInterval( function () {
    ticker++;
    if(ticker % 200===0){
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
},100);
let seconds = 0;
let minutes = 0;
setInterval( function () {
    
    for(i in PLAYER_LIST){
        seconds += 3;
        if(seconds%60===0){
            minutes++;
            console.log('game running for ', minutes,' minutes.');
            PLAYER_LIST[i].hp++;
            if(PLAYER_LIST[i].hp>PLAYER_LIST[i].mHp){
                PLAYER_LIST[i].hp = PLAYER_LIST[i].mHp;
            }
        }
        var socket = SOCKET_LIST[PLAYER_LIST[i].id]
        if(!(PLAYER_LIST[i].doFlag==="nothing")){
            if(PLAYER_LIST[i].doFlag==="mining"){
                if(PLAYER_LIST[i].gear.Tool.length>0 && PLAYER_LIST[i].gear.Tool[0].skill==="mine"){
                    if(PLAYER_LIST[i].mine>=PLAYER_LIST[i].data.req){
                        let rng = Math.random();
                        let skill = (PLAYER_LIST[i].mine/100)+PLAYER_LIST[i].data.baseDiff+(PLAYER_LIST[i].gear.Tool[0].bonus/100);
                        // console.log("mining away with ",rng," as rng and ",skill," as modified success...");
                        if(rng<skill){
                            let success = PLAYER_LIST[i].data.onSuccess();
                            success[0].purity=parseFloat(success[0].purity);
                            PLAYER_LIST[i].mineXp += success[1];
                            // console.log('got a chunk of ore: ',success[0]);
                            if(PLAYER_LIST[i].liftable(success[0])){
                                PLAYER_LIST[i].backpack.push(success[0]);
                                PLAYER_LIST[i].kg+= success[0].kg;
                                socket.emit('msg',{msg:`You successfully mine a chunk of ${success[0].name} with a purity of ${success[0].purity}, weighing ${success[0].kg} and gain${success[1]} xp.`,color:'yellow'});
                                if(PLAYER_LIST[i].mineXp>=PLAYER_LIST[i].mineTnl){
                                    PLAYER_LIST[i].mine++;
                                    PLAYER_LIST[i].mineTnl =40*PLAYER_LIST[i].mine*1.2;
                                    socket.emit('msg',{msg:`Your mining level has increased to ${PLAYER_LIST[i].mine}!`,color:'cyan'});
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
            if(PLAYER_LIST[i].doFlag==='smelting'||PLAYER_LIST[i].doFlag==='smelting all'){
                // console.log('currently smelting :',PLAYER_LIST[i].data);
                PLAYER_LIST[i].PCforge.ticker--;
                if(PLAYER_LIST[i].PCforge.ticker===0){
                    let rng = Math.random();
                    let skill = (PLAYER_LIST[i].forge/100)+(PLAYER_LIST[i].data.baseDiff);
                    console.log('smelting attempt with rng: '+ rng +' and skill: '+skill);
                    if(rng<skill){
                        let bar = PLAYER_LIST[i].data.onSuccess();
                        console.log(bar);
                        PLAYER_LIST[i].forgeXp += bar[1];
                        let result = `You successfully made a ${bar[0].name} and gained ${PLAYER_LIST[i].data.xp} xp!`;
                        if(PLAYER_LIST[i].forgeXp>=PLAYER_LIST[i].forgeTnl){
                            PLAYER_LIST[i].forge++;
                            PLAYER_LIST[i].forgeTnl =40*PLAYER_LIST[i].forge*1.2;
                            socket.emit('msg',{msg:`Your forging level has increased to ${PLAYER_LIST[i].forge}!`,color:'cyan'});
                        }
                        // console.log('the forge after smelting: ',PLAYER_LIST[i].PCforge);
                        // console.log('smelting weight bug',bar.kg,PLAYER_LIST[i].kg,PLAYER_LIST[i].maxKg);
                        if(bar[0].kg+PLAYER_LIST[i].kg<=PLAYER_LIST[i].maxKg){
                            PLAYER_LIST[i].kg+=bar[0].kg;
                            PLAYER_LIST[i].backpack.push(bar[0]);
                            socket.emit('msg',{msg:result,color:'yellow'});
                            socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});
                        } else {
                            result += ` but you can't carry that much so it sizzles away...`;
                            socket.emit('msg',{msg:result,color:'gray'});
                            socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});
                        }
                    } else {
                        socket.emit('msg',{msg:"You failed at the smelting attempt.",color:'gray'});
                    }
                    socket.emit('forge');    
                    if(PLAYER_LIST[i].doFlag==='smelting all'){
                        let data = PLAYER_LIST[i].data;
                        socket.emit('reforge',{data});
                    }
                    PLAYER_LIST[i].doFlag="nothing";
                    PLAYER_LIST[i].data = {};
                }
            }
            if(PLAYER_LIST[i].doFlag==='crafting at table'){
                console.log('currently crafting',PLAYER_LIST[i].data);
                if(PLAYER_LIST[i].data.craft.cc===PLAYER_LIST[i].data.craft.time){
                    let craft = PLAYER_LIST[i].data;
                    console.log('successful craft: ',craft);
                    let result = `You successfully crafted a ${craft.craft.name} and gained ${craft.craft.xp} XP points.`;
                    // console.log(obj.recipeBook[1]);
                    let item = obj.recipeBook[craft.l][craft.n].makeObj();
                    console.log('this is the finished item ',item);
                    if(PLAYER_LIST[i].liftable(item)){
                        PLAYER_LIST[i].kg += item.kg;
                        PLAYER_LIST[i].backpack.push(item);
                    }
                    console.log('player backpack',PLAYER_LIST[i].backpack);
                    PLAYER_LIST[i].craftXp += craft.craft.xp;
                    let player = PLAYER_LIST[i];
                    socket.emit('player update',{player,atChest:false});
                    PLAYER_LIST[i].doFlag = 'nothing'; PLAYER_LIST[i].data = {};
                    if(PLAYER_LIST[i].craftXp>=PLAYER_LIST[i].craftTnl){
                        PLAYER_LIST[i].craft++; PLAYER_LIST[i].craftTnl = 40*PLAYER_LIST[i].craft*1.2;
                        socket.emit('msg',{msg:"Your crafting has leveled up!"});
                    }
                    socket.emit('msg',{msg:result,color:'blue'});
                }
                if(PLAYER_LIST[i].data.craft){
                    PLAYER_LIST[i].data.craft.cc++;
                }
            }
            if(PLAYER_LIST[i].doFlag==="woodchopping"){
                if(PLAYER_LIST[i].gear.Tool.length>0 && PLAYER_LIST[i].gear.Tool[0].skill==="chop"){
                    if(PLAYER_LIST[i].chop>=PLAYER_LIST[i].data.req){
                        var result = `You swing your axe at the ${PLAYER_LIST[i].data.name}... `;
                        let rng = Math.random();
                        let skill = (PLAYER_LIST[i].chop/100+PLAYER_LIST[i].gear.Tool[0].bonus/100+PLAYER_LIST[i].data.baseDiff);
                        console.log("skill attempting choppy chopp chop ",rng,skill);
                        if(rng<=skill){
                            PLAYER_LIST[i].data.count--;
                            result += ` and hit the trunk!`;
                        } else {
                            result += ` and miss the trunk with a wild spin! `;
                        }
                        if(PLAYER_LIST[i].data.count===0){
                            let log = PLAYER_LIST[i].data.onSuccess();
                            PLAYER_LIST[i].data.count = PLAYER_LIST[i].data.trunk;
                            PLAYER_LIST[i].chopXp += log[1];
                            if(PLAYER_LIST[i].liftable(log[0])){
                                PLAYER_LIST[i].backpack.push(log[0]);
                                PLAYER_LIST[i].kg += log[0].kg;
                            }
                            if(PLAYER_LIST[i].chopXp>=PLAYER_LIST[i].chopTnl){
                                PLAYER_LIST[i].chop++;
                                PLAYER_LIST[i].chopTnl = 40 * PLAYER_LIST[i].chop *1.2;
                                socket.emit('msg',{msg:"Your woodcutting skill leveled up."});
                            }
                            result += `You get ${log[1]} Xp points and a ${log[0].name}. `;
                        }
                        socket.emit('msg',{msg:result,color:'yellow'});
                        socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});     
                        } else {
                            PLAYER_LIST[i].doFlag="nothing";
                            PLAYER_LIST[i].data = {};
                            socket.emit('msg',{msg:"You need to be using an axe to chop at trees.",color:'red'});
                            }
                } else {
                    PLAYER_LIST[i].doFlag="nothing";
                    PLAYER_LIST[i].data = {};
                    socket.emit('msg',{msg:"You need to be using an axe to chop at trees.",color:'red'});
                }
            }
            if(PLAYER_LIST[i].doFlag==='hostile encounter'){
                let mob = PLAYER_LIST[i].data;
                if (PLAYER_LIST[i].gear.Weapon.length>0){
                    console.log(PLAYER_LIST[i].gear.Weapon[0]);
                }
                let pack = PLAYER_LIST[i].attack(mob);
                console.log(pack);
                let attack = mob.attack(PLAYER_LIST[i]);
                console.log(attack);
            }
        }
    }
},5000);


//With all the files loaded, the below statement causes the server to boot up and listen for client connect

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');

io.emit('reboot');
