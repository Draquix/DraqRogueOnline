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
    let countP = 0;
    let mapObj = MapBox.showMap(character.map);
    ctx.font = '12px Helvetica';
    for (let i = 0; i < mapObj.map.length; i++){
        for (let j = 0; j < mapObj.map[i].length; j++){
            if (mapObj.map[i][j]==="#"){
                ctx.fillStyle = mapObj.Wall;
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="."){
                ctx.fillStyle = mapObj.floorDots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]===","){
                ctx.fillStyle = mapObj.floorSpots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="P"){
                ctx.fillStyle = mapObj.NPC[countP];
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
                countP++;
            }
            if (mapObj.map[i][j]==="+"){
                ctx.fillStyle = "light brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="&"){
                ctx.fillStyle = "brown";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="T"){
                ctx.fillStyle = "green";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="$"){
                ctx.fillStyle = "yellow";
                ctx.fillText('$', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="%"){
                ctx.fillStyle = "black";
                ctx.fillText('%', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (mapObj.map[i][j]==="Q"){
                ctx.fillStyle = "dark grey";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
        }
    }
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

socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    render(data.message,data.id);
});
socket.on('handshaking',data => {
    localId.id = data.id;
    console.log('handed up id: ', localId.id);
});
socket.on('player create',data => {
    playerUp(data.pc,data.id);
});
socket.on('draw player', data => {
    draw();
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    let tile =12;
    for(var i=0; i < data.pack.length; i++){
        ctx.font = "12pt Monospace";
        ctx.fillStyle = "black";
        if (!(data.id===localId.id)){
            ctx.fillStyle = "grey";
        }
        ctx.fillText('P',data.pack[i].xpos*tile,data.pack[i].ypos*tile)
    }
});
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


const map0 = {
    map0:[
        ['#','#','#','#','#','#','#','#','#','#','#','#','#'],
        ['#','.',',','.','.',',','.','.',',','.','.',',','#'],
        ['#','.',',','.','.',',','.','.',',','.','.',',','#'],
        ['#','.','.','.','.','.','.','.','.','.','.','.','#'],
        ['#','.','.','P','.','.','.','.','.','#','+','#','#'],
        ['#',',','.','.',',','.','P',',','.','#'],
        ['#',',','.','.',',','.','%',',','.','#'],
        ['#','#','#','#','#','#','#','#','#','#'],
        ],
    NPC: ["red","green"],
    Wall: 'brown',
    floorDots: 'grey',
    floorSpots: 'blue'
};
const map1 = {
    map:[
        ['#','#','#','#','#','#','_','_','_','_','_','_','#','#','#','#','#','#','#','#','#'],
        ['#','.','.','.','.','#','#','#','#','#','#','#','#','.','.','.','.','&','P','T','#'],
        ['#','.',',','.','.','#','.','.',',','.','.','Q','#','.','.',',','T','.',',','.','#'],
        ['#','.',',','.','.','#','.','.',',','.','.','P','#','.','.',',','.','.',',','.','#'],
        ['#','.',',','.','.','#','.','.',',','.','%','#','#','.','.',',','.','.',',','.','#'],
        ['#','.',',','.','.','.','.','.','#','#','#','#','.','.',',',',',',',',','T',',','+'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','.','.','.',',','.','.','.','#'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','.',',','.',',','.','.','.','#'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','$','.','.',',','.','.','.','#'],
        ['#','$','P','.','.','.','.','.','.',',','.','.','.','P','.','.',',','.',',','.','#'],
        ['#','.',',','.','.','.','.','.','.',',','.','.','.','.','.','.',',','.','#','#','#','#','#','#','#','#','#'],
        ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ],
    NPC: ["light green","black","dark blue","purple"],
    Wall: 'dark green',
    floorDots: 'lime green',
    floorSpots: 'dark brown'
};
MapBox.maps.push(map0);
MapBox.maps.push(map1);
console.log('end of the code reached');