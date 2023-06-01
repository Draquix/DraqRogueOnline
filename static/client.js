//Front End Client
console.log('client script running');
const socket = io();
//Login form and handling
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');
const login = document.querySelector('.login-form');
const entry = document.querySelector('#chatbox');

//elements
const msgs = document.querySelector('#msgs');
const display = document.querySelector('#display');
const action = document.querySelector('#action');
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const love = 42;

// client's local global variables
var localId=0;
var maps =[];
var localTickOn=0;
var homeTick=0;
var Forge = {
    name:"The Forge",
    metal1:{name:"none",purity:0},
    metal2:{name:"none",purity:0},
    inUse:false,
    addOre: function(added){
        // console.log(forge);
        if ( (this.metal1.name!="none"&&this.metal1.name!=added.metal) && (this.metal2.name!="none"&&this.metal2.name!=added.metal) ){
            alert("You can't put a third type of metal in the forge!");
            return false;
        }
        if(this.metal1.name==="none"){
            this.metal1.name = added.metal;
            this.metal1.purity += added.purity;
            this.metal1.purity.toFixed(2);
            return true;
        } else if (this.metal2.name==="none"&&this.metal1.name!=added.metal){
            this.metal2.name = added.metal;
            this.metal2.purity += added.purity;
            this.metal2.purity.toFixed(2);
            return true;
        } 
        if (this.metal1.name===added.metal){
            this.metal1.purity += added.purity;
            this.metal1.purity.toFixed(2);
            return true;
        } else if (this.metal2.name===added.metal){
            this.metal2.purity += added.purity;
            this.metal2.purity.toFixed(2);
            return true;
        }
    },
    empty: function(num){
        if(num===1){
            this.metal1.name="na";
            this.metal1.purity=0;
        }
        if(num===2){
            this.metal2.name="na";
            this.metal2.purity=0;
        }
        socket.emit('empty forge', {num:num});
    }
}

//Event listener for login form submit
login.addEventListener('submit', e => {
    homeTick = 0;
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});

//Message chatting feature handler
entry.addEventListener('submit', e => {
    e.preventDefault();
        var send = "<p style='color:red'>" + player.name + ": <span style='color:yellow'>" + chattext.value + "</span></p>";
    socket.emit('chat', {msg:send});
    chattext.value = " ";
});

//Handshaking client server connection
socket.on('handshaking', data => {
    console.log('handshaking pack: ', data);
    localTickOn = data.tick;
    localId = data.id;
    maps = data.maps;
    Forge.recipes = data.forge.recipes;
    // console.log(maps);
    // console.log(forge);
});
//popup alerts from server
socket.on('alert', data => {
    console.log('alerting ',data);
    alert(data.msg);
});
//scrolling message window from server
socket.on('msg', data => {
    let post = document.createElement('li');
    post.innerHTML = data.msg;
    if(data.color){
        post.style = `color:${data.color}`;
    }
    // console.log('innerhtml: ',post);
    msgs.appendChild(post);
    msgs.scrollTop = msgs.scrollHeight;
});
//recieves character data from server
socket.on('player update', data => {
    player = data.player;
    draw(maps.mapArr);
    if(data.atChest){
        charDisplay(true);
    } else {
        charDisplay();
    }
    if(player.doFlag==='hostile encounter'){
        mobDisplay();
    }
});
//initializes the client
let post = document.createElement('p');
post.innerText = "display loaded";
display.appendChild(post);
let loaded = document.createElement('p');
loaded.innerText = "action loaded";
action.appendChild(loaded);
var player={
    xpos:1,
    ypos:1,
    gear:{Tool:[]}
}
var mob = { alive:false};
//draw map function
function draw(map){
    ctx.clearRect(0,0,600,600)
    let tile = 18;
    let xpos = 1, ypos = 1;
    ctx.font = '18px Helvetica';
    for (let i = 0; i < map.length; i++){
        for (let j = 0; j < map[i].length; j++){
            if (map[i][j]==="#"){
                ctx.fillStyle = 'Grey';
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="."){
                ctx.fillStyle = 'grey';
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="0" || map[i][j]==="1" || map[i][j]==="2" || map[i][j]==="3" || map[i][j]==="4" || map[i][j]==="5" || map[i][j]==="6" || map[i][j]==="7" || map[i][j]==="8"){
                ctx.fillStyle = "yellow";
                ctx.fillText('*',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="m"){
                if(mob.alive){
                    ctx.fillStyle = mob.color;
                    ctx.fillText(mob.ascii,(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillText('m',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
                }
            }
            if (map[i][j]===","){
                ctx.fillStyle = 'white';
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="~"){
                ctx.fillStyle = 'blue';
                ctx.fillText('~',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="P"){
                ctx.fillStyle = 'blue';
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]===";"){
                ctx.fillStyle = 'brown';
                ctx.fillText(';',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="t"){
                ctx.fillStyle = 'grey';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="f"||map[i][j]==="F"){
                ctx.fillStyle = 'blue';
                ctx.fillText('@',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="t"){
                ctx.fillStyle = 'grey';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="O"){
                ctx.fillStyle = 'brown';
                ctx.fillText('T',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="i"){
                ctx.fillStyle = 'red';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="c"){
                ctx.fillStyle = 'brown';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="/"){
                ctx.fillStyle = 'green';
                ctx.fillText('|',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="="){
                ctx.fillStyle = "red";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="-"){
                ctx.fillStyle = "white";
                ctx.fillText('-',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="+"){
                ctx.fillStyle = "brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="&"){
                ctx.fillStyle = "red";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="T"){
                ctx.fillStyle = "green";
                ctx.fillText('T', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="$"){
                ctx.fillStyle = "yellow";
                ctx.fillText('$', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="%"){
                ctx.fillStyle = "brown";
                ctx.fillText('%', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="!"){
                ctx.fillStyle = "brown";
                ctx.fillText('!', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
        }
    }
}
//character display
function charDisplay(atChest){
    let character = document.querySelector('#display');
    character.innerHTML = " ";
    let stats = document.createElement('p');
    stats.innerHTML = spanner(player.name,"violet") + " Statistics <BR> ";
    stats.innerHTML += `Hitpoints: ${spanner(player.hp,"cyan")}/${spanner(player.mHp,"blue")} | Coins: ${spanner(player.coin,"yellow")} <br>`;
    stats.innerHTML += `Strength: ${spanner(player.str,"white")} | Dexterity: ${spanner(player.agi,"white")} | Defense: ${spanner(player.def,"white")} <BR>`;
    stats.innerHTML += `Mining: ${spanner(player.mine,"green")} Xp/Tnl: ${spanner(player.mineXp,"white")} / ${spanner(player.mineTnl,"yellow")} | Forging: ${spanner(player.forge,"green")} Xp/Tnl: ${spanner(player.forgeXp,"white")} / ${spanner(player.forgeTnl,"yellow")} <BR>`;
    stats.innerHTML += `Woodcutting: ${spanner(player.chop,"green")} Xp/Tnl: ${spanner(player.chopXp,"white")} / ${spanner(player.chopTnl,"yellow")} | Crafting: ${spanner(player.craft,"green")} Xp/Tnl: ${spanner(player.craftXp,"white")} / ${spanner(player.craftTnl,"yellow")} <BR>`;
    stats.innerHTML += `Fishing: ${spanner(player.fish,"green")} Xp/Tnl: ${spanner(player.fishXp,"white")} / ${spanner(player.fishTnl,"yellow")} | Cooking: ${spanner(player.cook,"green")} Xp/Tnl: ${spanner(player.cookXp,"white")} / ${spanner(player.cookTnl,"yellow")} <BR>`;
    stats.innerHTML += `Carrying ${spanner(player.kg,"cyan")} kgs out of possible ${spanner(player.maxKg,"blue")}. <BR>`;
    stats.innerHTML += `<span style="color:green"> Player is currently doing: ${spanner(player.doFlag,"orange")}. </span><BR>`;
    // console.log(player);
    if(player.gear.Tool.length>0){
        stats.innerHTML += `Currently using ${spanner(player.gear.Tool[0].name,"orange")} <br>`
    } else {
        stats.innerHTML += `You are not currently using anything for a tool. <br>`;
    }
    stats.innerHTML += `<a href="javascript:equipDisplay();"> Show Equipment </a> <br>`;
    stats.innerHTML += `<span style="color:violet">Currently carrying in backpack: </span>`;
    character.appendChild(stats);
    item = document.createElement('P');
    if(atChest){
        for(i in player.backpack){
            item.innerHTML += `A ${player.backpack[i].name} - ${player.backpack[i].kg} kgs <a href="javascript:putChest(${i});"> store </a> `;
        }
    } else if (player.PCforge.inUse===true){
        for(i in player.backpack){
            item.innerHTML += `A ${player.backpack[i].name}`;
            if(player.backpack[i].type==="ore" || (player.backpack[i].type==="stack" && player.backpack[i].mtype==="ore")){
                item.innerHTML += ` <a href="javascript:putInForge(${i});"> Load Forge </a> ,`;
            } else { item.innerHTML += ", "};
        }
    } else {
        for(i in player.backpack){
            item.innerHTML += `A ${player.backpack[i].name}- ${player.backpack[i].kg} kgs `
            if(player.backpack[i].type==="tool"||player.backpack[i].type==="weapon"){
                item.innerHTML += ` <a href="javascript:equip(${i});"> Equip </a>, `;
            } else if(player.backpack[i].stackable===true){
                item.innerHTML += ` <a href="javascript:stackThis('${player.backpack[i].name}');"> stack </a>,`;
            } else if(player.backpack[i].type==="stack"){
                item.innerHTML += ` <a href="javascript:unstack(${i});"> unstack </a>,`
            } else {
                item.innerHTML += `, `;
            }
        }
    }
    character.appendChild(item);
    character.innerHTML += `<br> <br><a href="javascript:levelAll();"> debug level up to 5 </a>`;
}
//inventory handling functions
function equipDisplay(){
    action.innerHTML = "";
    for (const key in player.gear){
        let item = document.createElement('p');
        // console.log(player.gear[key],key);
        if(player.gear[key].length){
            var gear = player.gear[key][0];
            item.innerHTML = `${key}: A ${spanner(gear.name,"white")} `;
            let btn = document.createElement('button');
            btn.innerText = "info";
            btn.onclick = function () {
                itemDisplay(gear);
            }
            item.appendChild(btn);
            let btn2 = document.createElement('button');
            btn2.innerText = "unequip";
            btn2.onclick = function(){
                unequip(key);
            }
            item.appendChild(btn2);
        } else{
            item.innerHTML = `${key}: <span style="color:grey"> nothing. </span>`;
        }
        action.appendChild(item);
    }
}
function equip(num){
    console.log('equipping: ',num,' \n',player.backpack[num] );
    let item = player.backpack[num];
    player.backpack.splice(num,1);
    if(item.type==="tool"){
        if(player.gear.Tool.length>0){
            let removed = player.gear.Tool[0];
            console.log('tool slot has an item that was removed: ',removed);
            player.gear.Tool.pop();
            player.backpack.push(removed);
        }
        player.gear.Tool.push(item);
    }
    // console.log('backpack after equip',player.backpack);
    equipDisplay();
    socket.emit('equip',{index:num});
    console.log('equipped finished, ',player);
}
function unequip(key){
    console.log(key);
    let item = player.gear[key][0];
    console.log('unequipping:',item);
    player.gear[key].pop();
    player.backpack.push(item);
    socket.emit('unequip',{key:key});
    equipDisplay();
}
function storage(){
    action.innerHTML = "Contents of your Storage Chest: <br>";
    charDisplay(true);
    for(i in player.chest){
        let thing = document.createElement('p');
        thing.innerHTML = player.chest[i].name + `<a href="javascript:takeChest(${i});"> take </a>`
        action.appendChild(thing);
    }
}
function takeChest(num){
    let item = player.chest[num];
    // console.log('pre alert!!!',item);
    if(player.kg+item.kg<=player.maxKg){
        player.chest.splice(num,1);
        player.backpack.push(item);
        socket.emit('chest to inv',{data:num});
    } else {
        alert("You can't hold that, it's too heavy.");
    }
    storage();
}
function putChest(num){
    let item = player.backpack[num];
    player.chest.push(item);
    player.kg -= item.kg;
    // itemDisplay(item);
    if(player.gear.Tool.length>0&&item.name===player.gear.Tool[0].name){
        player.gear.Tool.pop();
    } else {
        player.backpack.splice(num,1);
    }
    socket.emit('inv to chest',{data:num});
    console.log(player.chest);
    storage();
}
function itemDisplay(item){
    // console.log('displaying');
    action.innerHTML = " ";
    // console.log('<span style="color"Displaying item: ',item);
    let disp = document.createElement('p');
    disp.innerHTML = spanner(item.name,"violet");
    disp.innerHTML += `<br> Of type: ${spanner(item.type,"grey")} with a level requirement to use of ${spanner(item.req,"orange")}.`;
    if(item.stackable){
        disp.innerHTML += "<br> These materials can be stacked.";
    } else {
        disp.innerHTML += "<br> This item cannot be stacked.";
    }
    if(item.purity){
        disp.innerHTML += `<br> This ore is ${spanner(item.purity*100,"orange")}% pure.`;
    }
    if(item.dam){
        disp.innerHTML += `<br> This weapon can do between ${spanner(item.dam[0],'orange')} and ${spanner(item.dam[1],'red')}hp of damage.`;
    }
    disp.innerHTML += `<br> Weight: ${spanner(item.kg,"yellow")}`;
    action.appendChild(disp);
}
function unstack(num){
    stack = player.backpack[num];
    socket.emit('unstack',{stack,num:num});
    player.backpack.splice(num,1);
    for(i in stack.pack){
        player.backpack.push(stack.pack[i]);
    }
    action.innerHTML = " ";
}
function stackThis(itemName){
    console.log('stacking item: ',itemName);
    let msg = document.createElement('p');
    msg.innerHTML = `<span style="color:grey"> You stack together all the ${spanner(itemName,"white")}'s you have.`;
    let pack = player.backpack;
    let stack = {
        name:"stacked " + itemName,
        type:"stack",
        pack:[],
        quantity:0,
        kg:0,
    };
    let targetSplice = [];
    for(i in pack){
        // console.log("item i",pack[i]);
        if(pack[i].name===itemName){
            targetSplice.push(i);
            stack.mtype = pack[i].type;
            stack.kg+=pack[i].kg;
            stack.quantity++;
            stack.pack.push(pack[i]);
            stack.req = pack[i].req;
        }
    }
    // console.log(stack);
    msgs.appendChild(msg);
    itemDisplay(stack);
    socket.emit('stackpack',{stack,del:targetSplice});
}
//                         Skills Section
//forging functions
function putInForge(num){
    let ore = player.backpack[num];
    if( ore.type==="stack"){
        for(i in ore.quantity){
            if(Forge.addOre(ore)){
                player.PCforge = Forge;
                socket.emit('load forge', {num:num});
            }
        }
        player.backpack.splice(num,1);
    }
    let forge = player.PCforge;
    if(Forge.addOre(ore)){
        // console.log('put in forge worked...',forge.metal1,forge.metal2);
        player.backpack.splice(num,1);
        player.PCforge = Forge;
        socket.emit('load forge', {num:num});
        // console.log('player pcForge after add: ',player.PCforge);
    }
}
function smelt(lvl,num,all){
    let item = Forge.recipes[lvl][num];
    let allow1 = false; let allow2 = false;
    let forge = player.PCforge;
    // console.log('smelting forge method: ', item);
    // if(item.metal1===forge.metal1.name&&item.metal1!=item.metal2&&forge.metal1.purity>=.5){
    //     forge.metal1.purity -= .5;
    //     allow1 = true;
    // } else if(item.metal1===forge.metal2.name&&item.metal1!=item.metal2&&forge.metal2.purity>=.5){
    //     forge.metal2.purity -= .5;
    //     allow2 = true;
    // } else if(item.metal1===forge.metal1.name&&item.metal1===item.metal2&&forge.metal1.purity>=1){
    //     forge.metal1.purity -= 1;
    //     allow1 = true; allow2 = true;
    // } else if(item.metal1===forge.metal2.name&&item.metal1===item.metal2&&forge.metal2.purity>=1){
    //     forge.metal2.purity -= 1;
    //     allow1 = true; allow2 = true;
    // } 
    // // console.log(item.metal1,item.metal2,forge);
    // if(item.metal2===forge.metal1.name&&item.metal1!=item.metal2&&forge.metal1.purity>=.5){
    //     forge.metal1.purity -= .5;
    //     allow1 = true;
    // } else if(item.metal2===forge.metal2.name&&item.metal1!=item.metal2&&forge.metal2.purity>=.5){
    //     forge.metal2.purity -= .5;
    //     allow2 = true;
    // }
    // if(allow1===true&&allow2===true){
    //     console.log('smelting attempt forge is: ',forge);
    //     socket.emit('smelting attempt',{rec:[lvl,num],forge:[player.PCforge.metal1,player.PCforge.metal2],all});
    // } else {

    //     console.log('cant smelt',allow1,allow2);
    // }
    // socket.emit('smelting attempt',{rec:[lvl,num],forge:[player.PCforge.metal1,player.PCforge.metal2],all});
    socket.emit('smelting attempt',{rec:[lvl,num],all});
    forging();
}
function levelAll(){
    socket.emit('debug lvl', 5);
}
//recieves player x,y coords from server and draws to screen
socket.on('Tick', data =>{
    homeTick++;
    if(homeTick%400===0){
        let post = document.createElement('li');
        post.innerText = "You've been logged on for "+homeTick+" ticks...";
        msgs.appendChild(post);
    }
    draw(maps.mapArr);
    if(data.length>0){
        var syncTick = data[0].tick;
    }
    if(syncTick%200===0){
        console.log("server at ",data[0].tick," ticks...");
    }
    // console.log(localId,data);
    for(i in data){
        if(data[i].id===localId){
            ctx.fillStyle="yellow";
            player.xpos = data[i].xpos;
            player.ypos = data[i].ypos;
            ctx.fillText("C",(player.xpos)*18,(player.ypos+1)*18);
        } else {
            ctx.fillStyle="white";
            ctx.fillText("C",data[i].xpos*18,(data[i].ypos+1)*18);
        }
    }
});
//conversation with NPCs
function converse(NPC,flow){
    action.innerHTML =" ";
    console.log('npc: ', NPC);
    const NPCname = document.createElement('p');
    NPCname.innerHTML = spanner(NPC.name,"violet");
    action.appendChild(NPCname);
    let message = document.createElement('p');
    message.innerText = NPC.conversations[flow].message;
    action.appendChild(message);
    for ( i in NPC.conversations[flow].choice){
        let btn = document.createElement('button');
        btn.innerText = NPC.conversations[flow].choice[i];
        let trigger = NPC.conversations[flow].answerI[i];
        let NPCcopy = NPC;
        btn.onclick = function () {
            converse(NPCcopy,trigger);
        }
        action.appendChild(btn);
    }
}
//Point of Interest display from server
socket.on('poi', poi => {
    // console.log(poi.poi.msg);
    action.innerHTML = " ";
    let post = document.createElement('p');
    post.innerHTML = poi.poi.msg;
    action.appendChild(post);
    let msg = document.createElement('li'); 
    msg.innerHTML = `PoI: ${spanner(poi.poi.msg,"cyan")} `;
    msgs.appendChild(msg);
});
//server reception of objects
socket.on('npc', npc => {
    converse(npc,0);
    console.log(npc);
});
socket.on('node',data => {
    console.log("node displaying",data);
    action.innerHTML = " ";
    let node = document.createElement('p');
    node.innerHTML = spanner(data.name,"violet");
    node.innerHTML += `<br> Level requirement: ${spanner(data.req,"yellow")}`;
    node.innerHTML += `<br> Success rate: ${spanner(data.baseDiff*100,"yellow")}% plus 1% per level in this skill. `;
    node.innerHTML += `<br> Xp awarded per success: ${spanner(data.xp,"yellow")}`;
    if(data.trunk){
        node.innerHTML += `<br> It takes ${spanner(data.trunk,"orange")} successful swings to harvest a log.`;
    }
    if(data.lowest){
        node.innerHTML += `<br> The quality of the ore ranges from ${spanner(data.lowest*100,"white")} - ${spanner(data.highest*100,"white")}%.`
    }
    action.appendChild(node);
});
socket.on('chest' ,()=> {
    storage();
});
//  Combat!!!
//mobs
socket.on('mob', data => {
    mob = data;
    combat();
    console.log('mob collision with this: ',data);
});
function mobDisplay(){
    action.innerHTML = " ";
    console.log('combat is displaying this mob: ',mob);
    let stats = mob.stats
    action.innerHTML += `Enemy Encounter: ${spanner(mob.name,mob.color)}<br>`;
    action.innerHTML += `Hp: ${spanner(mob.chp,'cyan')}/${spanner(mob.hp,'blue')} -=- XP: ${spanner(mob.xp,'magenta')} -=- GP: ${spanner(mob.gold,'yellow')} <br>`;
    action.innerHTML += `Str: ${spanner(stats.str,'blue')} || Def: ${spanner(stats.def,'blue')} || Agi: ${spanner(stats.agi,'blue')}<br>`;
}
//combat controls
function combatStyle(style){
    player.combatStyle = style;
    socket.emit('combat style', style);
}
function combat(){
    if(mob.alive===true){
        mobDisplay();
    }
    action.innerHTML += `Combat Style: ${spanner(player.combatStyle,'red')} `;
    action.innerHTML += `<a href="javascript:combatStyle('basic');"> Basic </a> | <a href="javascript:combatStyle('aggressive');"> Aggressive </a> | <a href="javascript:combatStyle('accurate');"> Accurate </a> | <a href="javascript:combatStyle('defensive');"> Defensive </a>`;
    action.innerHTML += spanner('Flee!!','magenta') + "<a href='javascript:fleeCombat();'> Run Away </a>"
}
function fleeCombat(){
    socket.emit('flee combat',mob.stats.agi);
}
//Forging Functions
function forging(){
    player.PCforge.inUse=true;
    forge = player.PCforge;
    charDisplay();
    action.innerHTML = "";
    action.innerHTML += spanner(Forge.name,"orange") + "<br>";
    action.innerHTML += `Prime Metal: ${spanner(forge.metal1.name,"cyan")}, Total Purity: ${spanner(forge.metal1.purity,"blue")}`;
    for(let i = 0; i < player.forge+1;i++){
        for(j in forge.recipes[i]){
            // console.log(i,j,forge.recipes[i][j]);
            let one = forge.recipes[i][j].metal1; let two = forge.recipes[i][j].metal2;
            // console.log('recipe ingredients: ',one,two);
            if(one===two){
                // console.log('one is two',one,forge.metal1.name,forge.metal1.purity);
                if( forge.metal1.name===one&&forge.metal1.purity>=1 ){
                action.innerHTML += ` <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> |`;
                action.innerHTML += ` <br> <a href="javascript:smelt(${i},${j},true);"> smelt all </a>`;
                }
            } 
        }
    }
    action.innerHTML += `<br> Secondary Metal: ${spanner(forge.metal2.name,"cyan")}, Total Purity: ${spanner(forge.metal2.purity,"blue")}`;
    for(let i = 0; i < player.forge+1;i++){
        for(j in forge.recipes[i]){
            let one = forge.recipes[i][j].metal1; let two = forge.recipes[i][j].metal2;
            if(one===two){
                // console.log('second recipe: ',one,forge.metal2.name );
                if( forge.metal2.name===one&&forge.metal2.purity>=1 ){
                    action.innerHTML += `<br>*-- <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> |`;
                    action.innerHTML += ` <a href="javascript:smelt(${i},${j},true);"> smelt all ${forge.recipes[i][j].name} </a>`;
                }
            }
        }
    }
    // action.innerHTML += `<br> <span style="color:violet"> Making Alloys </span> <br>`;
    for(let i = 0; i < player.forge+1; i++){
        for(j in forge.recipes[i]){
            let one = forge.recipes[i][j].metal1; let two = forge.recipes[i][j].metal2;
            if ( (one===forge.metal1.name&&two===forge.metal2.name) || (one===forge.metal2.name&&two===forge.metal1.name) ){
                if(forge.metal1.purity>=0.5&&forge.metal2.purity>=0.5){
                    action.innerHTML += `<br> Making Alloys <br>`;
                    action.innerHTML += ` <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> | `;
                    action.innerHTML += ` <a href="javascript:smelt(${i},${j},true);"> smelt all </a>`;
                }
            }
        }
    }
    action.innerHTML += `${spanner("<br>-----------","violet")}`
    action.innerHTML += `<br> <a href="javascript:emptyF(1);"> Empty Primary </a> <br>`;
    action.innerHTML += `<a href="javascript:emptyF(2);"> Empty Secondary </a> <br>`;   
}
socket.on('forge', forging);
function emptyF(num){
    // console.log("Emptying forge... ",player.PCforge);
    if(num==1){
        player.PCforge.metal1={name:"none",purity:0};
    } else if (num==2){
        player.PCforge.metal2={name:"none",purity:0};
    }
    socket.emit('empty forge',num);
}
socket.on('reforge', data => {
    // console.log('reforging packet: ',data);
    // console.log('reforge data.all',data.data.all);
    forging();
    smelt(data.data.all[0],data.data.all[1],true);

});
//Crafting Table Functions
socket.on('craft', book => {
    action.innerHTML = " ";
    action.innerHTML += `${spanner("Crafting Table","orange")} <br>`;
    player.data = book;
    for ( lvl in book ){
        if(lvl>0&&lvl <= player.craft){
            action.innerHTML += ` Skill Level: ${spanner(lvl ,'cyan')} <br> `;
            let count = 0;
            book[lvl].map( item => {
                // console.log('recipe : ',item);
                action.innerHTML += `Name: ${spanner(item.name,"white")} Xp: ${spanner(item.xp,"cyan")} <a href="javascript:craft(${lvl},${count});"> Make </a> <br> `;
                action.innerHTML += `* *Ingredients: `;
                for ( i in item.ingredients){
                    // console.log(item.ingredients[i], "consoling ",book,i);
                    action.innerHTML += `${spanner(item.ingredients[i],"grey")} : `;
                }
                count++;
                action.innerHTML += "<br>";
            });
        }
    }
    console.log('crafting: ',book);
});
function craft(lvl,num){
    console.log(`crafting level: ${lvl}, item number: ${num}`);
    let craft = player.data[lvl][num];
    let post = document.createElement('li');
    post.innerHTML += `Crafting Attempt: ${spanner(craft.name,'white')} will take ${spanner(craft.time,"cyan")} ticks to complete... `;
    msgs.appendChild(post);
    socket.emit('crafting attempt',{craft,l:lvl,n:num});
    // console.log(craft);
}
//server reboot event to tell client to refresh
socket.on('reboot', () => {
    alert('Server has rebooted since you connected, please refresh your browser.');
});
//Keyboard reading controls for player movement
document.onkeydown = function(event){
    // console.log('keypress');
    player.doing = 'Nothing';
    var map = maps.mapArr;
    let space = map[player.ypos][player.xpos];
    charDisplay(false);
    if(localId===0){
        return;
    } else {
        // console.log(localId, "running keydown");
        player.PCforge.inUse=false;
    if(event.keyCode === 68){  //d
        space = map[player.ypos][player.xpos+1];
        socket.emit('key press',{inputDir:'right', target:space, state:true, id:localId});
    }if (event.keyCode === 83){ //s
        space = map[player.ypos+1][player.xpos];
        player.doing = "Walking";
        socket.emit('key press', {inputDir:'down', target:space, state:true, id:localId});
    } if (event.keyCode === 65) { //a
        player.doing = "Walking";
        space = map[player.ypos][player.xpos-1];
        socket.emit('key press', {inputDir:'left', target:space, state:true, id:localId});
    } if (event.keyCode === 87){ //w
        player.doing = "Walking";
        space = map[player.ypos-1][player.xpos];
        socket.emit('key press', {inputDir:'up', target:space, state:true, id:localId});
    }
    }
}
function spanner(input,color){
    return `<span style="color:${color}"> ${input} </span>`;
}

console.log(' client script loaded');