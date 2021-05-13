//Front End Client to DraqRogueOnline
// thanks to medium.com/@folkertjanvanderpol tutorials on socket.io multiuser server apps
//modified into the game by Daniel Rogahn (Draquix)

console.log('client is connected to html');
const socket = io();

const chat = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatDump = document.querySelector('.chat-dump');

chat.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat', chatInput.value);
    chatInput.value = '';
});

const login = document.querySelector('.login-form');
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');

login.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});
let character={};
let atlas={};
function draw(mapObj){
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    let tile = 12;
    let xpos = 1, ypos = 1;
    let countP = 0;
    console.log('mapObj: ',mapObj);
    for (let i = 0; i < mapObj.map.length; i++){
        for (let j = 0; j < mapObj.map[i].length; j++){
            if (mapObj.map[i][j]==="#"){
                ctx.fillStyle = mapObj.wallColor1;
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]==="."){
                ctx.fillStyle = mapObj.floorDots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]===","){
                ctx.fillStyle = mapObj.floorSpots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]==="P"){
                ctx.fillStyle = mapObj.NPC[countP];
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
                countP++;
            }
            if (mapObj.map[i][j]==="+"){
                ctx.fillStyle = "light brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*j*tile)+1);
            }
            if (mapObj.map[i][j]==="&"){
                ctx.fillStyle = "brown";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*j*tile)+1);
            }
            if (mapObj.map[i][j]==="T"){
                ctx.fillStyle = "green";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*j*tile)+1);
            }
            if (mapObj.map[i][j]==="$"){
                ctx.fillStyle = "yellow";
                ctx.fillText('$', (xpos*j*tile)+1,(ypos*j*tile)+1);
            }
            if (mapObj.map[i][j]==="%"){
                ctx.fillStyle = "black";
                ctx.fillText('%', (xpos*j*tile)+1,(ypos*j*tile)+1);
            }
            if (mapObj.map[i][j]==="Q"){
                ctx.fillStyle = "dark grey";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*j*tile)+1);
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
    console.log('player up',player);
    console.log('player id: ', id);
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
    }
}

socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    render(data.message,data.id);
});
socket.on('handshaking',data => {
    localId.id = data.id;
    atlas.maps = data.maps;
    console.log('handed up id: ', localId.id);
});
socket.on('player create',data => {
    playerUp(data.pc,data.id);
})
socket.on('draw player', data => {
    console.log('player pack emitted from server',data.pack.pc[0]);
    console.log('map for him: ', data.pack.pc[0].map);
    console.log('this is digging for map: ',data.pack.map);
    draw(atlas.maps[character.map]);
});
