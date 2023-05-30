const mobBox = [];

function Mob(name,ascii,color,hp,xp,str,agi,def,lH,HH,lg,Hg,attN){
    this.id = Math.random();
    this.alive = true;
    this.name = name; this.ascii = ascii; this.color = color;
    this.hp = hp; this.chp = hp; this.xp = xp;
    this.stats = {str:str,agi:agi,def:def,lH:lH,HH:HH};
    this.attN = attN;
    this.attack = function() {
        let damage = Math.floor(Math.random()*(this.stats.HH-this.stats.lH)+this.stats.lH+this.stats.str);
        return {msg:`The ${this.name} hits with it's ${this.attN} causing ${damage} points of damage.`,d:damage};
    }
    this.gold = Math.floor(Math.random()*(Hg-lg)+lg);
}

const rat = ['Giant Rat','r','grey',4,2,1,1,1,1,2,0,2,'bite'];
const kobold = ['Kobold','k','yellow',6,3,2,1,1,1,2,1,3,'punch'];
const slime = ['Slime','s','blue',4,3,1,2,2,1,1,0,3,'ooze spit'];

function assemble(m){
    let mob = new Mob(m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8],m[9],m[10],m[11],m[12]);
    return mob;
}

mobBox.push(rat,kobold,slime);

module.exports = { mobBox , assemble };
