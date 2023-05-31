const mobBox = [];

function Mob(name,ascii,color,hp,xp,str,agi,def,lH,HH,lg,Hg,attN){
    this.id = Math.random();
    this.alive = true;
    this.name = name; this.ascii = ascii; this.color = color;
    this.hp = hp; this.chp = hp; this.xp = xp;
    this.stats = {str:str,agi:agi,def:def,lH:lH,HH:HH};
    this.attN = attN;
    this.attack = function() {
        let damage = Math.floor(Math.random()(this.HH-this.lH)+this.lH);
        return {msg:`The ${this.name} hits with it's ${this.attN} causing ${damage} points of damage.`,d:damage};
    }
    this.gold = Math.floor(Math.random()*(Hg-lg)+lg);
}

const mobsList = [
    ['Giant Rat','r','grey',4,2,1,1,1,1,2,0,2,'bite'],
    ['Kobold','k','yellow',6,3,2,1,1,1,2,1,3,'punch'],
    ['Slime','s','blue',4,3,1,2,2,1,1,0,3,'ooze spit']
]

function mobMaker(arr){
    let mob = new Mob(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5],arr[6],arr[7],arr[8],arr[9],arr[10],arr[11],arr[12]);
    return mob;
}
module.exports = { Mob, mobsList, mobMaker };
