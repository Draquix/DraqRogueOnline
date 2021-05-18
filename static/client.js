//Front End Client to DraqRogueOnline
// thanks to medium.com/@folkertjanvanderpol tutorials on socket.io multiuser server apps
//modified into the game by Daniel Rogahn (Draquix)


//GLOBAL HTML ELEMENT VARIABLES
// declaring constants needed to interact with elements on the HTML document
const chat = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatDump = document.querySelector('.chat-dump');
const scrolltips = document.querySelector('#scrolltips');
const login = document.querySelector('.login-form');
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');

//Basic event handler for submitting the form for the chat as an emit through
//socket.io so the server can send the message to all other connected clients.
chat.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat', chatInput.value);
    chatInput.value = '';
});
//This is event handler for the login form. It emits and triggers the server
//to generate a player object for the username and password.
login.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});

//GOBAL CONTAINER VARIABLES -- Some objects are generated on a local scope through
//the socket transmissions and need global containers to put them in to get them
//from their local scope to a global scope to be used by other functions in 
//the running client.
let character={};
let localId={};

//These boxes hold game data and have a method to return a data object
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
console.log('client is connected to html');
//Data structures now in place, client is ready to run


//Socket.io Connection established and below are event handlers for the emits

const socket = io();
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
    playerStats(data.pc,data.id);
    playerUp(data.pc,data.id);
});
socket.on('NPC Bump', npc => {
    console.log('NPC recieved :',npc);
});

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
        }
        ctx.fillText('P',data.pack[i].xpos*tile,data.pack[i].ypos*tile);
    }
});

//CLIENT FUNCTIONS

//This function is called by the chat emit and prints out the message
//It uses a different class to differentiate between the local user and other
//users connected from elsewhere. 
function render(message, id) {
    const output = document.createElement('p');
    if (id === socket.id) {
        output.classList.add('chat-message-user');
    }
    output.innerText = message;
    chatDump.appendChild(output);
}
//This function prints the player's stats in the window.
function playerStats(player,id){
    let stats = document.querySelector('#char-display');
    console.log('stats: ',stats);
    console.log('player:',player);
    let newP = document.createElement('p');
    statString = `Player Character: ${player.name}<br>HP: ${player.stats.hp}/${player.stats.mHp}<br><br>`;
    statString += `STR: ${player.stats.str} | DEX: ${player.stats.dex} | DEF: ${player.stats.def} <BR><br>`;
    statString += `Digging: ${player.stats.dig} | Forging: ${player.stats.frg} | Fishing: ${player.stats.fsh} <BR><br>`;
    statString += `Harvest: ${player.stats.har} | Cooking: ${player.stats.coo} | Smithing: ${player.stats.smt}<BR><br>`;
    statString += `Coins: ${player.stats.coin} | LoadWeight: ${player.weightLoad} <BR><br>`;
    newP.innerHTML = statString;
    stats.appendChild(newP);
}
function playerUp(player, id) {
    console.log('local id: ',localId.id);
    if (id === localId.id) {
        console.log('player up: ',player);
        character.map = player.map;
        character.name = player.name;
        const stats = document.querySelector('#stats');
        const displayName = document.createElement('li');
        displayName.innerText = player.username;
        stats.appendChild(displayName);
        character.stats = player.stats;
        let displayStat = document.createElement('li');
        displayStat.innerText = 'STR: '+ player.stats.str + ' | DEX: ' + player.stats.dex + ' | DEF ' + player.stats.def;
        stats.appendChild(displayStat);    
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



function converse(){
    let NPC = NPCBox.showNpc(0);
    console.log(NPC);
}


document.onkeydown = function(event){
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