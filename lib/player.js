//Player Object Constructor
const obj = require('./objects');
const mongojs = require('mongojs');
const nod = require('./nodes');
const db = mongojs ('mongodb://localhost:27017/player');
function Player(name,passphrase,id){
    this.id = id;
    this.name = name;
    this.passphrase = passphrase;
    this.using =[];
    this.xpos = 1;
    this.ypos = 1;
    this.hp = 10;
    this.mHp = 10;
    this.coin = 20;
    this.level = 1;
    this.train = 1;
    this.exp = 0;
    this.expTnl = 40*this.level*1.2;
    this.str = 1;
    this.def = 1;
    this.agi = 1;
    this.mine = 1;  this.mineXp = 0; this.mineTnl=40*this.mine*1.2;
    this.chop = 1;  this.chopXp = 0; this.chopTnl=40*this.chop*1.2;
    this.cook = 1;  this.cookXp = 0; this.cookTnl=40*this.cook*1.2;
    this.fish = 1;  this.fishXp = 0; this.fishTnl=40*this.fish*1.2;
    this.forge = 1;  this.forgeXp = 0; this.forgeTnl=40*this.forge*1.2;
    this.craft = 1;  this.craftXp = 0; this.craftTnl=40*this.craft*1.2;
    this.backpack = [];
    this.doFlag = "nothing";
    this.combatStyle = 'basic';
    this.data = {};
    this.kg = 0;
    this.chest = [];
    this.gear = {
        Tool:[],
        Head:[],
        Hands:[],
        Torso:[],
        Back:[],
        Legs:[],
        Boots:[],
        Weapon:[],
        Neck:[],
        Ring1:[],
        Ring2:[]
    }
    this.maxKg = 10+this.str*5;
    this.attack = function(mob){
        let rng = Math.random();
        var pack = {rng:rng,hit:false,msg:'You attack the ' + mob.name + ' with your '};
        if(this.combatStyle!='accurate'){
            pack.chance = .5 + this.agi/10 - mob.stats.def/10;
        } else {
            pack.chance = .5 + this.agi/5 - mob.stats.def/10;
        }
        // pack.mob=mob
        if(rng>pack.chance){
            pack.hit = true;
            pack.damage = Math.floor(Math.random()*this.str+1);
            if(this.gear.Weapon.length>0){
                let wHit = this.gear.Weapon[0].dam;
                pack.msg += this.gear.Weapon[0].name + 'and hit for ';
                pack.damage += Math.floor(Math.random()*(wHit[1]-wHit[0])+wHit[0]);
                pack.msg += pack.damage + 'hit points of damage!';
            } else {
                pack.msg += 'bare hands and hit for' + pack.damage;
            }
        } else {
            pack.msg = 'You attack and you missed!';
        }
         return pack;
    }
    this.levelUp = function(reps){
        for(var i=0;i<reps;i++){
            this.mine++; this.chop++; this.cook++;
            this.fish++; this.forge++; this.craft++;
            this.mineXp = this.mineTnl; this.mineTnl=40*this.mine*1.2;
            this.chopXp = this.chopTnl; this.chopTnl=40*this.chop*1.2;
            this.cookXp = this.cookTnl; this.cookTnl=40*this.cook*1.2;
            this.fishXp = this.fishTnl; this.fishTnl=40*this.fish*1.2;
            this.forgeXp = this.forgeTnl; this.forgeTnl=40*this.forge*1.2;
            this.craftXp = this.craftTnl; this.craftTnl=40*this.craft*1.2;
        }
    }
    this.backpackWeight = function(){
        let weight = 0;
        for(i in this.backpack){
            weight += this.backpack[i].kg;
        }
        this.kg = weight;
    }
    this.liftable = function(item){
        if((this.kg+item.kg) <= this.maxKg)
            return true;
    }
    this.move = function(dir){
        // console.log("in the player.move()!!",dir);
        if(dir==='left')
            this.xpos = this.xpos-1;
        if(dir==='right')
            this.xpos = this.xpos+1;
        if(dir==="up")
            this.ypos = this.ypos-1;
        if(dir==='down')
            this.ypos = this.ypos+1;
    }
    this.init = function(){
        Rpick = new obj.Tool("Rusty Pickaxe","mine",1,1,3.5);
        Raxe = new obj.Tool("Rusty Axe","chop",1,1,3.5);
        this.backpack.push(Rpick);
        this.backpack.push(Raxe);
        for(let i = 0; i < 8; i++){
            chunkC = new obj.Ore("copper ore",'copper',.5,3,.5);
            chunkT = new obj.Ore("tin ore",'tin',.5,1,.5);
            this.chest.push(chunkC);
            this.chest.push(chunkT);
        }
        // console.log(this.chest);
        this.backpackWeight();
        this.PCforge = new nod.Forge();
    }

}

function savePlayer(player){
    db.player.insert(player);
}
function loginPlayer(name){
    db.player.find({name:name}, (err,res) => {
        //console.log(err);
        // console.log(res[0]);
        // player = new Player(res[0].name,res[0].passphrase,res[0].id);
        // player.xpos = res[0].xpos; player.ypos = res[0].ypos;
        // player.hp = res[0].hp; player.mHp = res[0].mHp;
        // player.level = res[0].level; player.exp = res[0].exp;
        // player.expTnl = res[0].expTnl; player.str = res[0].str;
        // player.agi = res[0].agi; player.def = res[0].def;
        // player.mine = res[0].mine; player.mineXp = res[0].mineXp; player.mineTnl = res[0].mineTnl;
        // player.chop = res[0].chop; player.chopXp = res[0].chopXp; player.chopTnl = res[0].chopTnl;
        // player.cook = res[0].cook; player.cookXp = res[0].cookXp; player.cookTnl = res[0].cookTnl;
        // player.fish = res[0].fish; player.fishXp = res[0].fishXp; player.fishTnl = res[0].fishTnl;
        // player.forge = res[0].forge;
        // player.craft = res[0].craft;
        var player = res[0];
        return player;
    });
}
module.exports = {Player, savePlayer, loginPlayer};
