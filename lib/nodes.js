const NPCBox = [];
const obj= require('./objects')
const NPC0 = {
    name: "Balaster",
    x:3,
    y:4,
    conversations: [
        {message:"Ahh, welcome newcomer to DraqRogue!",choice:["Where am I?","What should I do?"],answerI:[1,2],end:false},
        {message:"These are the starting barracks... people begin here to feed the machine.",choice:["...the machine?"],answerI:[3],end:false},
        {message:"In this room is a furnace and an anvil. If you had the materials, you could smelt and forge things.",choice:["Where do I get materials?","Is there anything else to do?"],answer:[4,5],end:false},
        {message:"Draq wages constant war on other realms, so he needs to train people to work and fight to grind them down!",choice:["Who's the wizard in green?","What should I do?"],answerI:[6,2],end:false},
        {message:"Go out the door to the work yard and train on menial tasks so you become a good cog.",end:true},
        {message:"Aside from gathering and crafting, we do need good soldiers... you could train at combat. Also head out the door for that",end:true},
        {message:"Oh, that's wizard Gillar. He can teach you about the inventory storage system.",end:true}
    ],
    questBool:false
}
const NPC1 = {
    name: "Gillar",
    x:6,
    y:7,
    conversations:[
        {message:"Confound it! I can never understand how this singularity point allows you to take and leave things at will with such capacity!",end:true}
    ],
    questBool:true
}
NPCBox.push(NPC0);
NPCBox.push(NPC1);
const copperMine = {
    name:"Copper Mine",
    req:3,
    baseDiff:.25,
    lowest:.2,
    highest:.8,
    xp:3,
    onSuccess: function(){
        let purity = Math.random()*(this.highest-this.lowest)+this.lowest;
        let ore = new obj.Ore("copper ore",purity,1,.5);
        return ore;
    }
}
const tinMine = {
    name:"Tine Mine",
    req:1,
    baseDiff:.3,
    lowest:.2,
    highest:.8,
    xp:2,
    onSuccess: function(){
        let purity = Math.random()*(this.highest-this.lowest)+this.lowest;
        let ore = new obj.Ore("tin ore",purity,1,.5);
        return ore;
    }
}
const firTree = {
    name:"Fir Tree",
    req:1,
    count:3,
    trunk:3,
    baseDiff:.7,
    xp:2,
    onSuccess: function(){
        let log = new obj.Log("fir log",1,1);
        return log;
    }
}
const oakTree = {
    name:"Oak Tree",
    req:1,
    count:5,
    trunk:5,
    baseDiff:.6,
    xp:4,
    onSuccess: function(){
        let log = new obj.Log("oak log",1,1);
        return log;
    }
}
const fishPond = {
    name:"Fish Pond",
    req:1,
    baseDiff:.4,
    list:["pike","trought","bass","catfish"],
    onSuccess: function(numCatch){
        if(numCatch<10){
            let fish = new obj.Fish("pike",1,.4,2,true,.5);
            let cought = {xp:3,fish};
        } else if (numCatch>10&&numCatch<20){
            let fish = new obj.Fish("trought",3,.35,3,true,.5);
            let cought = {xp:3,fish};
        } else if (numCatch>=20&&numCatch<30){
            let fish = new obj.Fish("bass",5,.4,3,true,.5);
            let cought = {xp:4,fish};
        } else if (numCatch>=30&&numCatch<40){
            let fish = new obj.Fish("catfish",5,.3,4,true,1);
            let cought = {xp:5,fish};
        }
        return caught;

    }
}
const fishStream = {
    name:"Fish Stream",
    req:4,
    baseDiff:.45,
    list:["bass","catfish","salmon","crappie"],
    onSuccess: function(numCatch){
        if(numCatch<10){
            let fish = new obj.Fish("bass",5,.4,3,true,.5);
            let cought = {xp:3,fish};
        } else if (numCatch>10&&numCatch<20){
            let fish = new obj.Fish("catfish",5,.3,4,true,1);
            let cought = {xp:3,fish};
        } else if (numCatch>=20&&numCatch<30){
            let fish = new obj.Fish("salmon",6,.4,5,true,1);
            let cought = {xp:4,fish};
        } else if (numCatch>=30&&numCatch<40){
            let fish = new obj.Fish("crappie",6,.35,6,true,1);
            let cought = {xp:5,fish};
        }
        return caught;

    }
}
module.exports = { NPCBox, copperMine, tinMine, firTree, oakTree, fishPond, fishStream};