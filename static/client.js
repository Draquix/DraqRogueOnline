//Front End Client to DraqRogueOnline
// thanks to medium.com/@folkertjanvanderpol tutorials on socket.io multiuser server apps
//modified into the game by Daniel Rogahn (Draquix)

console.log('client is connected to html');
const socket = io();

const chat = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatDump = document.querySelector('.chat-dump');
const scrolltips = document.querySelector('#scrolltips');

chat.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat', chatInput.value);
    chatInput.value = '';
});

const login = document.querySelector('.login-form');
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');
const MapBox = {
    maps:[],
    showMap: function(mapNum){
        return this.maps[mapNum];
    }
}
const LegendBox = {
    legends:[],
    showLegend: function(legNum){
        return this.legends[legNum];
    }
}
const NPCBox = {
    NPCs:[],
    showNpc: function(npcNum){
        return this.NPCs[npcNum];
    }
}
login.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});
let character={};

function draw(){
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,360,360)
    let tile = 12;
    let xpos = 1, ypos = 1;
    let countP = 0, countC = 0;
    let map = MapBox.maps[character.map];
    let legend = LegendBox.legends[character.map]
    ctx.font = '12px Helvetica';
    for (let i = 0; i < map.length; i++){
        for (let j = 0; j < map[i].length; j++){
            if (map[i][j]==="#"){
                ctx.fillStyle = legend.Wall;
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="."){
                ctx.fillStyle = legend.floorDots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="*"){
                ctx.fillStyle = "yellow";
                ctx.fillText('*',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]===","){
                ctx.fillStyle = legend.floorSpots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="P"){
                ctx.fillStyle = legend.NPC[countP];
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
                countP++;
            }
            if (map[i][j]==="="){
                ctx.fillStyle = "red";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="-"){
                ctx.fillStyle = "white";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="1"||map[i][j]==="2"){
                ctx.fillStyle = "brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="&"){
                ctx.fillStyle = "red";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="T"){
                ctx.fillStyle = "green";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="$"){
                ctx.fillStyle = "yellow";
                ctx.fillText('$', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="%"){
                ctx.fillStyle = "brown";
                ctx.fillText('%', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="Q"){
                ctx.fillStyle = "dark grey";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
        }
    ctx.fillStyle = "white";
    ctx.fillText(",",25*tile,29*tile);
    ctx.fillText(character.xpos+1,24*tile,29*tile);
    ctx.fillText(character.ypos,26*tile,29*tile);
    ctx.fillStyle = "blue";
    ctx.fillText(character.tileTarget,4*tile,29*tile);
    }
    
}
function display(text,id) {
    const display = document.querySelector('#interactions');
    let message = document.createElement('p');
    message.innerText = text.message[0];
    display.appendChild(message);
}
function clearDisplay(){
    const display = document.querySelector('#interactions');
    display.innerHTML = " ";
}

function render(message, id) {
    const output = document.createElement('p');
    if (id === socket.id) {
        output.classList.add('chat-message-user');
    }
    output.innerText = message;
    chatDump.appendChild(output);
}
let localId={};

function playerUp(player, id) {
    console.log('local id: ',localId.id);
    if (id === localId.id) {
        console.log('player up: ',player);
        character.map = player.map;
        character.name = player.name;
        console.log(player);
        const stats = document.querySelector('#char-display');
        stats.innerHTML =  " ";
        const displayName = document.createElement('p');
        displayName.innerText = player.name;
        stats.appendChild(displayName);
        character.stats = player.stats;
        character.backpack = player.backpack;
        let displayHealth = document.createElement('li');
        displayHealth.innerText = 'Hp: ' + player.stats.hp + '/' + player.stats.mHp;
        stats.appendChild(displayHealth);
        let displayStat = document.createElement('li');
        displayStat.innerText = 'STR: '+ player.stats.str + ' | DEX: ' + player.stats.dex + ' | DEF ' + player.stats.def;
        stats.appendChild(displayStat);    
        let displayStat1 = document.createElement('li');
        displayStat1.innerText = 'Mining: ' + player.stats.mine + ' | Forging: ' + player.stats.forge + ' | Gather: ' + player.stats.gather;
        stats.appendChild(displayStat1);
        let displayStat2 = document.createElement('li');
        displayStat2.innerText = 'Fishing: ' + player.stats.fish + ' | Cooking: ' + player.stats.cook + ' | Woodcutting: ' + player.stats.chop;
        stats.appendChild(displayStat2);
        let displayMats = document.createElement('li');
        displayMats.innerText = 'Coins: ' + player.stats.coin;
        stats.appendChild(displayMats);
        let displayWeight = document.createElement('li');
        let weightLimit = 20 + 10*player.stats.str;
        displayWeight.innerText = character.weightLoad + 'kg of max ' + weightLimit + ' kgs carrying.';
        stats.appendChild(displayWeight);
        let scroll = document.createElement('li');
        scroll.innerText = "Welcome, logged in as " + character.name + ".";
        scrolltips.appendChild(scroll);
        if(character.map===0){
            let scroll = document.createElement('li');
            scroll.innerText = "You see a man in red greeting newcomers, and a wizard in green robes by the chest.";
            scrolltips.appendChild(scroll);
            let scroll1 = document.createElement('li');
            scroll1.innerText = "A bank chest has a black lid on it nearby.";
            scrolltips.appendChild(scroll1);
        }
    }
}
let CONVO = 0;
function converse(NPC,flow){
    console.log('npc: ', NPC);
    clearDisplay();
    const display = document.querySelector('#interactions');
    const NPCname = document.createElement('p');
    NPCname.innerText = NPC.name;
    display.appendChild(NPCname);
    let message = document.createElement('p');
    message.innerText = NPC.conversations[flow].message;
    display.appendChild(message);
    for ( i in NPC.conversations[flow].choice){
        let btn = document.createElement('button');
        btn.innerText = NPC.conversations[flow].choice[i];
        let trigger = NPC.conversations[flow].answerI[i];
        let NPCcopy = NPC;
        btn.onclick = function () {
            converse(NPCcopy,trigger);
        }
        display.appendChild(btn);
    }
}
function chestDisplay(){
    const display = document.querySelector('#char-display');
    const inventory = document.createElement('ul');
    let title = document.createElement('li');
    title.innerText = "Items in the Chest:";
    inventory.appendChild(title);
    for(i in character.chest){
        let item = document.createElement('li');
        item.innerHTML = character.chest[i].name + ' .. wt: ' + character.chest[i].weight + `<a href="javascript:getPack(${i})"> Take </a>`;
        inventory.appendChild(item);
    }
    display.innerHTML = ' ';
    display.appendChild(inventory);
}
function playerInventory(){
    const display = document.querySelector('#interactions');
    clearDisplay();
    const inventory = document.createElement("ul");
    let title = document.createElement("li");
    title.innerText = 'Backpack Contents:';
    inventory.appendChild(title);
    for(i in character.backpack){
        let item = document.createElement('li');
        item.innerHTML = character.backpack[i].name + ' .. wt: ' + character.backpack[i].weight + `<a href="javascript:putPack(${i})"> Take </a>`;
        inventory.appendChild(item);
    }
    let weightLimit = document.createElement('li');
    weightLimit.innerText = character.weightLoad + 'kgs of total allowed load of ' + character.weightLimit;
    inventory.appendChild(weightLimit);
    display.appendChild(inventory);
}
function getPack(itemNum){
    socket.emit('chest to pack', {num:itemNum});
}
function putPack(itemNum){
    socket.emit('pack to chest', {num:itemNum});
}
socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    render(data.message,data.id);
});
socket.on('handshaking',(data,maps,legends) => {
    localId.id = data.id;
    MapBox.maps = maps;
    LegendBox.legends = legends;
    console.log('handed up id: ', localId.id);
});
socket.on('player create',data => {
    playerUp(data.pc,data.id);
});
socket.on('NPC Bump', npc => {
    console.log('NPC recieved :',npc);
    converse(npc.BumpPack[0],0)
});
socket.on('POI Bump', (poi,id) => {
    console.log('POI recieved: ', poi, "id: ", id);
    clearDisplay();
    display(poi.BumpPack[0],id);
});
socket.on('Chest Bump', inv => {
    console.log('Chest Data Received: ', inv);
    character.chest = inv.BumpPack[0].chest;
    character.backpack = inv.BumpPack[0].pack;
    chestDisplay();
    playerInventory();
})
socket.on('draw player', data => {
    draw();
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    let tile =12;
    for(var i=0; i < data.pack.length; i++){
        ctx.font = "12pt Monospace";
        if (!(data.id===localId.id)){
            ctx.fillStyle = "white";
        } else {
            ctx.fillStyle = "yellow";
            character.xpos = data.pack[i].xpos;
            character.ypos = data.pack[i].ypos;
            character.tileTarget = data.pack[i].tileTarget;
            character.stats = data.pack[i].stats;
            if(data.pack[i].NPCFlag===true){
                NPCBox.NPCs = data.pack[i].NPCBox;
                converse();
            }
            character.weightLoad = data.pack[i].weight;
        }
        ctx.fillText('P',data.pack[i].xpos*tile,data.pack[i].ypos*tile);
    }
});
document.onkeydown = function(event){
    playerUp(character, localId.id);
    if(event.keyCode === 68)  //d
        socket.emit('key press',{inputDir:'right', state:true, id:localId});
    else if(event.keyCode === 83) //s
        socket.emit('key press', {inputDir:'down', state:true, id:localId});
    else if(event.keyCode === 65)  //a
        socket.emit('key press', {inputDir:'left',state:true, id:localId});
    else if(event.keyCode === 87) //w
        socket.emit('key press', {inputDir:'up',state:true, id:localId});

}


// const map0 = {
//     map0:[
//         ['#','#','#','#','#','#','#','#','#','#','#','#','#'],
//         ['#','.',',','.','.',',','.','.',',','.','.',',','#'],
//         ['#','.',',','.','.',',','.','.',',','.','.',',','#'],
//         ['#','.','.','.','.','.','.','.','.','.','.','.','#'],
//         ['#','.','.','P','.','.','.','.','.','#','+','#','#'],
//         ['#',',','.','.',',','.','P',',','.','#'],
//         ['#',',','.','.',',','.','%',',','.','#'],
//         ['#','#','#','#','#','#','#','#','#','#'],
//         ],
//     NPC: ["red","green"],
//     Wall: 'brown',
//     floorDots: 'grey',
//     floorSpots: 'blue'
// };
// const map1 = {
//     map:[
//         ['#','#','#','#','#','#','_','_','_','_','_','_','#','#','#','#','#','#','#','#','#'],
//         ['#','.','.','.','.','#','#','#','#','#','#','#','#','.','.','.','.','&','P','T','#'],
//         ['#','.',',','.','.','#','.','.',',','.','.','Q','#','.','.',',','T','.',',','.','#'],
//         ['#','.',',','.','.','#','.','.',',','.','.','P','#','.','.',',','.','.',',','.','#'],
//         ['#','.',',','.','.','#','.','.',',','.','%','#','#','.','.',',','.','.',',','.','#'],
//         ['#','.',',','.','.','.','.','.','#','#','#','#','.','.',',',',',',',',','T',',','+'],
//         ['#','.',',','.','.','.','.','.','.',',','.','.','.','.','.','.',',','.','.','.','#'],
//         ['#','.',',','.','.','.','.','.','.',',','.','.','.','.',',','.',',','.','.','.','#'],
//         ['#','.',',','.','.','.','.','.','.',',','.','.','.','$','.','.',',','.','.','.','#'],
//         ['#','$','P','.','.','.','.','.','.',',','.','.','.','P','.','.',',','.',',','.','#'],
//         ['#','.',',','.','.','.','.','.','.',',','.','.','.','.','.','.',',','.','#','#','#','#','#','#','#','#','#'],
//         ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
//     ],
//     NPC: ["light green","black","dark blue","purple"],
//     Wall: 'dark green',
//     floorDots: 'lime green',
//     floorSpots: 'dark brown'
// };
// MapBox.maps.push(map0);
// MapBox.maps.push(map1);
console.log('end of the code reached');