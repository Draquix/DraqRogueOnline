const mapArr = [
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ['#','S',',','#','=','#','-','#',',','.','.',',','#','#','c','#','#','.','#'],
    ['#','.',',','.','.','1','.','.',',','.','.',',','#',';',';','4',';',';','#','#'],
    ['#','.','.','.','.','.','.','.','.','.','.','.','#','.',';','.','.',',','/','#'],
    ['#','.','.','P','.','.','.','.','.','#','+','#','#','.','.','.','.',',','/','#','#'],
    ['#',',','.','.',',','.','.',',','.','#',',','.','.','.','.','.','.','/',',','O','#'],
    ['#',',','.','.',',','.','.',',','.','#','#','.','.','.','.','/','T','.',',','/','#'],
    ['#',',','.','.',',','.','P',',','.','!','#','.','.','.','.','3','/','.',',',';','#'],
    ['#',',','.','.',',','.','%',',','.','2','#','.','.','.','.','.','.','.',',','#','#'],
    ['#',',','.','.',',','.','.',',','.','&','#','.','.','.','.','.','.','.',';','.','#'],
    ['#','#','#','#','#','#','#','#','#','#','#','.','.','.','.','.','.','.',';','t','#','#','#','#','#','#'],
    ['#','m','.','.','.','.','.',';','.',',','.','.','.','.',';','.',',','.','.','.','.',';',';',',',';','#'],
    ['#','~','.','.',';','.','.',',',',',',','.','.',';','.',';','P',',','.','.','.','.','.','.',',','i','#'],
    ['#','~','~','.','.','.','.',';','.',',','.','.','.','.',',','.',',','.','.','.','.',';','.',';','#','#'],
    ['#','~','~','f','.','.','5','.','.',',','.','.','.','.',';','.',',',',','.','.','.','.','.','#','#'],
    ['#','~','~','~','~','~','~','~','~','F','~','.','.','.','.','.',',','.','.','.','.',';','.','#'],
    ['#','#','#','#','#','#','#','#','#','#','~','#','#','#','#','#','#','#','#','#','#','#','#','#'],

];
function PoIcheck(num){
    if(num==="1"){
        return {msg:"Here is the forge '=' where you can smelt ores into bars for smithing at the anvil represented by'-'"};
    }
    if(num==="2"){
        return {msg:"Here at the fire, shown as red '&', you can cook the raw foods you have. At the crafting table, shown as a brown '!', you can make items from various materials or check the recipe list of possible crafts."};
    }
    if(num==="3"){
        return {msg:"Trees are a good source of wood for chopping. You need to use your axe at the 'T'.  It takes several good swings to fell a tree and get a log."};
    }
    if(num==="4"){
        return {msg:"You can mine ores at deposits shown as '^' on the map.  You'll need to use a pickaxe."};
    }
    if(num==="5"){
        return {msg:"Fishing is a good source of food.  You will need a fishing pole, which can be made from a fir log at the crafting table.  The pond has easier fish to catch than up the steam."};
    }
}

module.exports = { mapArr, PoIcheck };