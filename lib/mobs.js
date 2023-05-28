const mobBox = [];

function Mob(name,ascii,color,hp,xp,str,agi,def,lH,HH,lg,Hg,attN){
    this.id = Math.random();
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

const rat = new Mob('Giant Rat','r','grey',4,2,1,1,1,1,2,0,2,'bite');
const kobold = new Mob('Kobold','k','yellow',6,3,2,1,1,1,2,1,3,'punch');
const slime = new Mob('Slime','s','blue',4,3,1,2,2,1,1,0,3,'ooze spit');

mobBox.push(rat,kobold,slime);

module.exports = { mobBox };
