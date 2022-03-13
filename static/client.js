//Front End Client
console.log('client script running');
const socket = io();
//Login form and handling
const username = document.querySelector('#name');
const passphrase = document.querySelector('#passphrase');
const login = document.querySelector('.login-form');

//Event listener for login form submit
login.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', {name: username.value, phrase: passphrase.value} );
});

//elements
const msgs = document.querySelector('#msgs');
const display = document.querySelector('#display');
const action = document.querySelector('#action');
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const love = 42;

//global variables
var localId;
var maps =[];

//Handshaking client server connection
socket.on('handshaking', data => {
    console.log('handed up id: ', data.id);
    localId = data.id;
    maps = data.maps;
});
socket.on('alert', data => {
    alert(data.msg);
});
socket.on('msg', data => {
    let post = document.createElement('p');
    post.innerHTML = data.msg;
    msgs.appendChild(post);
});
socket.on('player update', data => {
    player = data;
    console.log(data);
    draw(maps[0]);
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
                countP++;
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
    let character = document.querySelector('#char-display');
    let stats = document.createElement('p');
    stats.innerHTML = player.name + " Statistics <BR> ";
    stats.innerHTML += `Hitpoints: ${player.hp.lvl} / ${player.mHp}  |  Coins: ${player.coin} <BR>`;
    stats.innerHTML += `Strength: ${player.str} | Dexterity: ${player.agi} | Defense: ${player.def} <BR>`;
    stats.innerHTML += `Mining: ${player.mine} Xp/Tnl: ${player.mineXp} / ${player.mineTnl} | Forging: ${player.forge} Xp/Tnl: ${player.forgeXp} / ${player.forgeTnl} <BR>`;
    stats.innerHTML += `Woodcutting: ${player.chop} Xp/Tnl: ${player.chopXp} / ${chopTnl} | Crafting: ${player.craft} Xp/Tnl: ${player.craftXp} / ${player.craftTnl} <BR>`;
    stats.innerHTML += `Fishing: ${player.fish} Xp/Tnl: ${player.fishXp} / ${player.fishTnl} | Cooking: ${player.cook} Xp/Tnl: ${player.cookXp} / ${player.cookTnl} <BR>`;
    stats.innerHTML += `Carrying ${player.kg} kgs out of possible ${player.maxKg}. <BR>`;
    stats.innerHTML += `Player is currently ${player.doing}. <BR>`;
    stats.innerHTML += `<a href="javascript:invDisplay();"> Show Inventory </a><BR>`;
    stats.innerHTML += `<a href="javascript:equipDisplay();"> Show Equipment </a>`;
    character.appendChild(stats);
}
