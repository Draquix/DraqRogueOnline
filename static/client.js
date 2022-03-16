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
    console.log(maps);

});
socket.on('alert', data => {
    console.log('alerting ',data);
    alert(data.msg);
});
socket.on('msg', data => {
    console.log('message coming, ',data);
    let post = document.createElement('li');
    post.innerText = data.msg;
    console.log('innerhtml: ',post);
    msgs.appendChild(post);
});
socket.on('player update', data => {
    player = data;
    draw(maps.mapArr);
    charDisplay();
});


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
function charDisplay(){
    let character = document.querySelector('#display');
    character.innerHTML = " ";
    let stats = document.createElement('p');
    stats.innerHTML = player.name + " Statistics <BR> ";
    stats.innerHTML += `Hitpoints: ${player.hp.lvl} / ${player.mHp}  |  Coins: ${player.coin} <BR>`;
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
    for(i in player.backpack){
        item.innerHTML += `A ${player.backpack[i].name} weighing ${player.backpack[i].kg} kgs `
        if(player.backpack[i].type==="tool"){
            item.innerHTML += ` <a href="javascript:equip(${i});"> Equip </a>, `;
        } else if(player.backpack[i].stackable===true){
            item.innerHTML += ` <a href="javascript:stack(${i});"> Stack </a>,`;
        } else {
            item.innerHTML += `, `;
        }
    }
    character.appendChild(item);
}
function equip(num){
    let item = player.backpack[num];
    player.backpack.slice(num,1);
    player.gear.tool.push(item);
    socket.emit('equip',{index:num});
}

function equipDisplay(){
    action.innerHTML = "";
    for (const key in player.gear){
        let item = document.createElement('p');
        if(player.gear[key].length)
            item.innerHTML = `${key}: A ${player.gear[key]}`;
        else
            item.innerHTML = `${key}: nothing.`;
        action.appendChild(item);
    }
}
socket.on('Tick', data =>{
    homeTick++;
    if(homeTick%200===0){
        let post = document.createElement('li');
        post.innerText = "You've been logged on for "+homeTick+" ticks...";
        msgs.appendChild(post);
    }
    draw(maps.mapArr);
    let syncTick = data[0].tick;
    if(syncTick%40===0){
        console.log("server at ",data[0].tick," ticks...");
    }
    player.xpos = data[0].xpos;
    player.ypos = data[0].ypos;
    // console.log('tick data',data);
    var map = maps.mapArr;
    var space=map[player.ypos][player.xpos];
    //  console.log(space, player.xpos, player.ypos);
    ctx.fillStyle="white";
    ctx.fillText("C",(player.xpos)*18,(player.ypos+1)*18);
});
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
function itemDisplay(item){
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
function storage(){
    action.innerHTML = "Contents of your Storage Chest: <br>";
    charDisplay();
    for(i in player.chest){
        let thing = document.createElement('p');
        thing.innerHTML = player.chest[i].name + `<a href="javascript:takeChest(${i});"> take </a>`
        action.appendChild(thing);
    }
}
function takeChest(num){
    let item = player.chest[num];
    itemDisplay(item);
    player.chest.splice(num,1);
    socket.emit('chest to inv',{data:num});
    console.log("trying get this item: ",item);
    storage();
}
function putChest(num){
    let item = player.backpack[num];
    player.chest.push(item);
    itemDisplay(item);
    if(player.gear.tool.length>0&&item.name===player.gear.tool[0].name){
        player.gear.tool.pop();
    } else {
        player.backpack.splice(num,1);
    }
    socket.emit('inv to chest',{data:num});
    // console.log(player.chest);
    storage();
}
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
socket.on('npc', npc => {
    converse(npc,0);
    console.log(npc);
});
socket.on('node', node => {
    console.log(node);
});
socket.on('chest' ,()=> {
    storage();
});

document.onkeydown = function(event){
    player.doing = 'Nothing';
    var map = maps.mapArr;
    let space = map[player.ypos][player.xpos];
    if(localId===0){
        return;}else{
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

