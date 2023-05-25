const mobBox = [];

function Mob(name,lvl,location){
    this.name = name;
    this.lvl = lvl;
    this.location = location;
    this.stats = {
        hp:5, xp:2, str:1, agi:1, def:1
    }
}

const rat = new Mob('Giant Rat',1,1);

mobBox.push(rat);

module.exports = { mobBox };
