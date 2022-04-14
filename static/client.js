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
var forge = {
    name:"The Forge",
    metal1:{name:"none",purity:0},
    metal2:{name:"none",purity:0},
    inUse:false,
    addOre: function(added){
        console.log(forge);
        if ( (this.metal1.name!="none"&&this.metal1.name!=added.metal) && (this.metal2.name!="none"&&this.metal2.name!=added.metal) ){
            alert("You can't put a third type of metal in the forge!");
            return false;
        }
        if(this.metal1.name==="none"){
            this.metal1.name = added.metal;
            this.metal1.purity += added.purity;
            return true;
        } else if (this.metal2.name==="none"&&this.metal1.name!=added.metal){
            this.metal2.name = added.metal;
            this.metal2.purity += added.purity;
            return true;
        } 
        if (this.metal1.name===added.metal){
            this.metal1.purity += added.purity;
            return true;
        } else if (this.metal2.name===added.metal){
            this.metal2.purity += added.purity;
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
        var send = player.name + ": " + chattext.value;
    socket.emit('chat', {msg:send});
    chattext.value = " ";
});

//Handshaking client server connection
socket.on('handshaking', data => {
    console.log('handed up id: ', data.id,data.tick);
    localTickOn = data.tick;
    localId = data.id;
    maps = data.maps;
    forge.recipes = data.forge.recipes;
    console.log(maps);

});
//popup alerts from server
socket.on('alert', data => {
    console.log('alerting ',data);
    alert(data.msg);
});
//scrolling message window from server
socket.on('msg', data => {
    let post = document.createElement('li');
    post.innerText = data.msg;
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
    ypos:1
}
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
    stats.innerHTML = player.name + " Statistics <BR> ";
    stats.innerHTML += `Hitpoints: ${player.hp} / ${player.mHp}  |  Coins: ${player.coin} <BR>`;
    stats.innerHTML += `Strength: ${player.str} | Dexterity: ${player.agi} | Defense: ${player.def} <BR>`;
    stats.innerHTML += `Mining: ${player.mine} Xp/Tnl: ${player.mineXp} / ${player.mineTnl} | Forging: ${player.forge} Xp/Tnl: ${player.forgeXp} / ${player.forgeTnl} <BR>`;
    stats.innerHTML += `Woodcutting: ${player.chop} Xp/Tnl: ${player.chopXp} / ${player.chopTnl} | Crafting: ${player.craft} Xp/Tnl: ${player.craftXp} / ${player.craftTnl} <BR>`;
    stats.innerHTML += `Fishing: ${player.fish} Xp/Tnl: ${player.fishXp} / ${player.fishTnl} | Cooking: ${player.cook} Xp/Tnl: ${player.cookXp} / ${player.cookTnl} <BR>`;
    stats.innerHTML += `Carrying ${player.kg} kgs out of possible ${player.maxKg}. <BR>`;
    stats.innerHTML += `Player is currently doing ${player.doFlag}. <BR>`;
    if(player.gear.tool.length>0){
        stats.innerHTML += `Currently using ${player.gear.tool[0].name} <br>`
    } else {
        stats.innerHTML += `You are not currently using anything for a tool. <br>`;
    }
    stats.innerHTML += `<a href="javascript:equipDisplay();"> Show Equipment </a> <br>`;
    stats.innerHTML += "Currently carrying in backpack: ";
    character.appendChild(stats);
    item = document.createElement('P');
    if(atChest){
        for(i in player.backpack){
            item.innerHTML += `A ${player.backpack[i].name} - ${player.backpack[i].kg} kgs <a href="javascript:putChest(${i});"> store </a> `;
        }
    } else if (forge.inUse===true){
        for(i in player.backpack){
            item.innerHTML += `A ${player.backpack[i].name}`;
            if(player.backpack[i].type==="ore"){
                item.innerHTML += ` <a href="javascript:putInForge(${i});"> Load Forge </a> ,`;
            } else { item.innerHTML += ", "};
        }
    } else {
        for(i in player.backpack){
            item.innerHTML += `A ${player.backpack[i].name}- ${player.backpack[i].kg} kgs `
            if(player.backpack[i].type==="tool"){
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
}
//inventory handling functions
function equipDisplay(){
    action.innerHTML = "";
    for (const key in player.gear){
        let item = document.createElement('p');
        // console.log(player.gear[key],key);
        if(player.gear[key].length){
            var gear = player.gear[key][0];
            item.innerHTML = `${key}: A ${gear.name} `;
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
            item.innerHTML = `${key}: nothing.`;
        }
        action.appendChild(item);
    }
}
function equip(num){
    let item = player.backpack[num];
    player.backpack.splice(num,1);
    if(item.type==="tool"){
        if(player.gear.tool.length>0){
            let removed = player.gear.tool[0];
            player.gear.tool.pop();
            player.backpack.push(removed);
        }
        player.gear.tool.push(item);
    }
    // console.log('backpack after equip',player.backpack);
    equipDisplay();
    socket.emit('equip',{index:num});
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
    if(player.gear.tool.length>0&&item.name===player.gear.tool[0].name){
        player.gear.tool.pop();
    } else {
        player.backpack.splice(num,1);
    }
    socket.emit('inv to chest',{data:num});
    console.log(player.chest);
    storage();
}
function itemDisplay(item){
    console.log('displaying');
    action.innerHTML = " ";
    console.log('Displaying item: ',item);
    let disp = document.createElement('p');
    disp.innerHTML = item.name;
    disp.innerHTML += `<br> Of type: ${item.type} with a level requirement to use of ${item.req}.`;
    if(item.stackable){
        disp.innerHTML += "<br> These materials can be stacked.";
    } else {
        disp.innerHTML += "<br> This item cannot be stacked.";
    }
    if(item.purity){
        disp.innerHTML += `<br> This ore is ${item.purity*100}% pure.`;
    }
    disp.innerHTML += `<br> Weight: ${item.kg}`;
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
    msg.innerHTML = `You stack together all the ${itemName}'s you have.`;
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
            stack.kg+=pack[i].kg;
            stack.quantity++;
            stack.pack.push(pack[i]);
        }
    }
    // console.log(stack);
    msgs.appendChild(msg);
    itemDisplay(stack);
    socket.emit('stackpack',{stack,del:targetSplice});
}
//forging functions
function putInForge(num){
    let ore = player.backpack[num];
    if(forge.addOre(ore)){
        // console.log('put in forge worked...',forge.metal1,forge.metal2);
        player.backpack.splice(num,1);
        player.PCforge = forge;
        socket.emit('load forge', {num:num});
    }
}
function smelt(lvl,num,all){
    let item = forge.recipes[lvl][num];
    // console.log('smelting forge method: ', item);
    if(item.metal1===forge.metal1.name&&item.metal1!=item.metal2){
        forge.metal1.purity -= .5;
    } else if(item.metal1===forge.metal2.name&&item.metal1!=item.metal2){
        forge.metal2.purity -= .5;
    } else if(item.metal1===forge.metal1.name&&item.metal1===item.metal2){
        forge.metal1.purity -= 1;
    } else if(item.metal===forge.metal2.name&&item.metal1===item.metal2){
        forge.metal2.purity -= 1;
    }
    if(item.metal2===forge.metal1.name&&item.metal1!=item.metal2){
        forge.metal1.purity -= .5;
    } else if(item.metal2===forge.metal2.name&&item.metal1!=item.metal2){
        forge.metal2.purity -= .5;
    }
    socket.emit('smelting attempt',{rec:[lvl,num],forge:[player.PCforge.metal1,player.PCforge.metal2],all});
}
//recieves player x,y coords from server and draws to screen
socket.on('Tick', data =>{
    homeTick++;
    if(homeTick%200===0){
        let post = document.createElement('li');
        post.innerText = "You've been logged on for "+homeTick+" ticks...";
        msgs.appendChild(post);
    }
    draw(maps.mapArr);
    if(data.length>0){
        var syncTick = data[0].tick;
    }
    if(syncTick%40===0){
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
    NPCname.innerText = NPC.name;
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
    msg.innerText = "PoI:: " + poi.poi.msg;
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
    node.innerHTML = data.name;
    node.innerHTML += `<br> Level requirement: ${data.req}`;
    node.innerHTML += `<br> Success rate: ${data.baseDiff*100}% plus 1% per level in this skill. `;
    node.innerHTML += `<br> Xp awarded per success: ${data.xp}`;
    if(data.trunk){
        node.innerHTML += `<br> It takes ${data.trunk} successful swings to harvest a log.`;
    }
    if(data.lowest){
        node.innerHTML += `<br> The quality of the ore ranges from ${data.lowest*100} - ${data.highest*100}%.`
    }
    action.appendChild(node);
});
socket.on('chest' ,()=> {
    storage();
});
socket.on('forge', () => {
    forge.inUse=true;
    charDisplay();
    action.innerHTML = "";
    action.innerHTML += forge.name + "<br>";
    action.innerHTML += `Prime Metal: ${forge.metal1.name} of total Purity: ${forge.metal1.purity}`;
    for(let i = 0; i < player.forge+1;i++){
        for(j in forge.recipes[i]){
            let one = forge.recipes[i][j].metal1; let two = forge.recipes[i][j].metal2;
            console.log('recipe ingredients: ',one,two);
            if(one===two){
                console.log('one is two',one,forge.metal1.name,forge.metal1.purity);
                if( forge.metal1.name===one&&forge.metal1.purity>=1 ){
                action.innerHTML += ` <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> |`;
                action.innerHTML += ` <br> <a href="javascript:smelt(${i},${j},true);"> smelt all </a>`;
                }
            } else if ( one===forge.metal1.name&&two===forge.metal2.name ){
                if(forge.metal1.purity>=.5&&forge.metal2.purity>=.5){
                    action.innerHTML += ` <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> | `;
                    action.innerHTML += `<br> <a href="javascript:smelt(${i},${j},true);"> smelt all </a>`;
                }
            }
        }
    }
    action.innerHTML += `<br> Secondary Metal: ${forge.metal2.name} of total Purity: ${forge.metal2.purity}`;
    for(let i = 0; i < player.forge+1;i++){
        for(j in forge.recipes[i]){
            let one = forge.recipes[i][j].metal1; let two = forge.recipes[i][j].metal2;
            if(one===two){
                console.log('second recipe: ',one,forge.metal2.name );
                if( forge.metal2.name===one&&forge.metal2.purity>=1 ){
                    action.innerHTML += ` <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> |`;
                    action.innerHTML += `<br> <a href="javascript:smelt(${i},${j},true);"> smelt all ${forge.recipes[i][j].name} </a>`;
            }
            } else if (one===forge.metal2.name&&forge.metal2.purity>=1){
                action.innerHTML += ` <a href="javascript:smelt(${i},${j},false);"> smelt 1 ${forge.recipes[i][j].name} </a> |`;
                action.innerHTML += `<br> <a href="javascript:smelt(${i},${j},true);"> smelt all ${forge.recipes[i][j].name} </a>`;
            }
        }
    }
    action.innerHTML += `<br> <a href="javascript:forge.empty(1);"> Empty Primary </a> <br>`;
    action.innerHTML += `<a href="javascript:forge.empty(2);"> Empty Secondary </a> <br>`;   
});
socket.on('reforge', data => {
    console.log('reforging packet: ',data);
});
//server reboot event to tell client to refresh
socket.on('reboot', () => {
    alert('Server has rebooted since you connected, please refresh your browser.');
});
//Keyboard reading controls for player movement
document.onkeydown = function(event){
    player.doing = 'Nothing';
    var map = maps.mapArr;
    let space = map[player.ypos][player.xpos];
    charDisplay();
    if(localId===0){
        return;}else{
            forge.inUse=false;
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


