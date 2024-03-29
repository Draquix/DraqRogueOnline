
const blackBook = [" ",
[//level 1 Smithing
    level1 = { name:"Tin Pan",
    index:0,
    xp:5,
    time:4,cc:0,
    ingredients:["tin bar"],
    makeObj: function(){
        let kettle = new Tool('Tin Pan','cook',1,1,1);
        return kettle;
    }
    }

],[//level 2 Smithing
    level2 = { name:"Tin Shank",
    index:1,
    xp:10,
    time:5,cc:0,
    ingredients:["tin bar",'knife handle'],
    makeObj: function(){
        let shank = new Weapon('Tin Shank','agi',2,[2,3],3);
        return shank;
    }
    }
],[//level 3 Smithing
    level3 = { name :"Copper Blade",
    index:2,
    xp:12, time:8,cc:0,
    ingredients:['copper bar','tin bar'],
    makeObj: function(){
        let blade = new Mat('copper blade',3,2)
    }
    }
]

];
const recipeBook = [" ", 
[//level 1 crafts:        Rpick = new Tool("Rusty Pickaxe","mine",1,1,3.5);
    level1 = { name:"Fishing Pole",
    index:0,
    xp:8,
    time:5,cc:0,
    ingredients:["fir log"],
    makeObj: function(){
        let pole = new Tool("Fishing Pole","fish",1,1,1);
        return pole;
    },
},  { name:"Wooden Club",
    index:1,
    xp:8,
    time:5,cc:0,
    ingredients:["fir log"],
    makeObj: function(){
        let club = new Weapon("Club","str",1,[1,4],1);
        return club;
    }
},{ name:"Knife Handle",
    index:2,
    xp:12,
    time:8,cc:0,
    ingredients:["fir log","tin bar"],
    makeObj: function(){
        let handle = new Mat("knife handle",1,2);
        return handle;
    }
}]
];
function Tool(name,skill,req,bonus,kg){
    this.type="tool";
    this.name=name;
    this.skill=skill;
    this.req=req;
    this.bonus=bonus;
    this.kg=kg;
    this.stackable=false;
    this.id=Math.random();
}
function Weapon(name,skill,req,dam,kg){
    this.type="weapon";
    this.name=name;
    this.skill=skill;
    this.req=req;
    this.dam=dam;
    this.kg=kg;
    this.stackable=false;
    this.id=Math.random();
}
function Ore(name,metal,purity,req,kg){
    this.type="ore";
    this.metal=metal
    this.name=name;
    this.purity=purity;
    this.req=req;
    this.kg=kg;
    this.stackable=true;
    this.id=Math.random();
}
function Mat(name,req,kg){
    this.type="mat";
    this.name=name;
    this.req=req;
    this.kg=kg;
    this.id=Math.random();
}
function Log(name,req,kg){
    this.type="log";
    this.name=name;
    this.req=req;
    this.kg=kg;
    this.stackable=true;
    this.id=Math.random();
}
function Bar(name,metal){
    this.name=name;
    this.metal=metal;
    this.type="bar";
    this.kg=1;
    this.stackable=true;
    this.id=Math.random();
}
function Fish(name,req,diff,hp,raw,kg){
    this.name=name;
    this.req=req;
    this.diff=diff;
    this.hp=hp;
    this.raw=true;
    this.kg=kg;
}
module.exports = { recipeBook, blackBook, Tool, Weapon, Ore, Log, Bar, Mat };


