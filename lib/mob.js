//adding mobs here in a bit

const mobBox = [];

function Mob(name,symb){
    this.symb = symb;
    this.id = Math.random();
    this.name = name;
    this.stats = {hp:5,str:1,agi:1,def:1,xp:2};
}
const rat = new Mob('Giant Rat','r');
const kobold = new Mob('Kobold','k');
    kobold.stats = {hp:6,str:2,agi:1,def:1,xp:4};
const slime = new Mob('Slime','s');
    slime.stats.hp--; slime.stats.agi++; slime.stats.xp++;

mobBox.push(rat,kobold,slime);

module.exports = { mobBox };





