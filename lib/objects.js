const { handle } = require("express/lib/application");


const recipeBook = [" ", 
[//level 1 crafts:        Rpick = new Tool("Rusty Pickaxe","mine",1,1,3.5);
    { name:"Fishing Pole",
    xp:8,
    time:5,
    ingredients:["fir log"],
    makeObj: function(){
        let pole = new Tool("Fishing Pole","fish",1,1,1);
        return pole;
    },
}, { name:"Wooden Club",
    xp:8,
    time:5,
    ingredients:["fir log"],
    makeObj: function(){
        let club = new Weapon("Club","str",1,[1,4],1);
        return club;
    }
}, { name:"Wooden Handles",
    xp:12,
    time:5,
    ingredients:["fir log","fir log"],
    makeObj: function(){
        let stack = {
            name:"stacked wooden handles",
            type:"stack",
            pack:[],
            quantity:0,
            kg:0,
        };
        for(let i = 0;i<3;i++){
            let handle = new Part("wooden handle",1,.5);
            stack.pack.push(handle);
            stack.quantity++;
            stack.kg+=handle.kg;
        }
        return stack;
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
function Part(name,req,kg){
    this.name=name;
    this.req=req;
    this.kg=kg;
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
module.exports = { recipeBook, Tool, Weapon, Ore, Log, Bar };


