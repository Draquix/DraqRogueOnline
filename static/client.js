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
    socket.emit('login', {name: username, phrase: passphrase} );
});

function draw(mapObj){
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    let tile = 32;
    let xpos = 1, ypos = 1;
    let countP = 0;
    for (let i = 0; i < map.length; i++){
        for (let j = 0; j < map.length; j++){
            if (mapObj.map[i][j]==="#"){
                ctx.fillStyle = mapObj.wallColor1;
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]==="."){
                ctx.fillStyle = map.floorDots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]===","){
                ctx.fillStyle = map.floorSpots;
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]==="P"){
                ctx.fillStyle = map.NPC[countP];
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(j)*tile)+1);
            }
            if (mapObj.map[i][j]==="+"){
                ctx.fillStyle = "light brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*j*tile)+1);
            }
            if (mapObj.map[i][j]==="&"){
                ctx.fillStyle = "yellow";
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

socket.on('chat', data => {
    console.log('chat emitted from server',data.message);
    render(data.message,data.id);
});
