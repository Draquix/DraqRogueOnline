let PL = require('../server');

function skilling() {
    
    for(i in PL.PLAYER_LIST){
        var socket = PL.SOCKET_LIST[PL.PLAYER_LIST[i].id]
        if(!(PL.PLAYER_LIST[i].doFlag==="nothing")){
            if(PL.PLAYER_LIST[i].doFlag==="mining"){
                if(PL.PLAYER_LIST[i].gear.tool.length>0 && PL.PLAYER_LIST[i].gear.tool[0].skill==="mine"){
                    if(PL.PLAYER_LIST[i].mine>=PL.PLAYER_LIST[i].data.req){
                        let rng = Math.random();
                        let skill = (PL.PLAYER_LIST[i].mine/100)+PLAYER_LIST[i].data.baseDiff+(PLAYER_LIST[i].gear.tool[0].bonus/100);
                        console.log("mining away with ",rng," as rng and ",skill," as modified success...");
                        if(rng<skill){
                            let success = PL.PLAYER_LIST[i].data.onSuccess();
                            success[0].purity=parseFloat(success[0].purity);
                            PLAYER_LIST[i].mineXp += success[1];
                            console.log('got a chunk of ore: ',success[0]);
                            if(PLAYER_LIST[i].liftable(success[0])){
                                PLAYER_LIST[i].backpack.push(success[0]);
                                PLAYER_LIST[i].kg+= success[0].kg;
                                socket.emit('msg',{msg:`You successfully mine a chunk of ${success[0].name} with a purity of ${success[0].purity}, weighing ${success[0].kg} and gain${success[1]} xp.`});
                                if(PLAYER_LIST[i].mineXp>=PLAYER_LIST[i].mineTnl){
                                    PLAYER_LIST[i].mine++;
                                    PLAYER_LIST[i].mineTnl =40*PLAYER_LIST[i].mine*1.2;
                                    socket.emit('msg',{msg:`Your mining level has increased to ${PLAYER_LIST[i].mine}!`});
                                }
                                socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});
                            } else {
                                PLAYER_LIST[i].doFlag="nothing";
                                PLAYER_LIST[i].data = {};
                                socket.emit('msg',{msg:"You cannot hold any more items."});
                            }                        }
                    }else{
                        PLAYER_LIST[i].doFlag="nothing";
                        PLAYER_LIST[i].data = {};
                        socket.emit('msg',{msg:"You do not have the appropriate skill level to mine here."});
                    }
                } else {
                    PLAYER_LIST[i].doFlag="nothing";
                    PLAYER_LIST[i].data = {};
                    socket.emit('msg',{msg:"You do not have a pickaxe equipped for mining."});
                }
            }
            if(PLAYER_LIST[i].doFlag==='smelting'){
                PLAYER_LIST[i].data.tick--;
                if(PLAYER_LIST[i].data.tick===0){
                    let rng = Math.random();
                    let skill = (PLAYER_LIST[i].forge/100)+(PLAYER_LIST[i].data.baseDiff);
                    console.log('smelting attempt with rng: '+ rng +' and skill: '+skill);
                    if(rng<skill){
                        let bar = PLAYER_LIST[i].data.onSuccess();
                        console.log(bar);
                        PLAYER_LIST[i].forgeXp += bar[1];
                        let result = `You successfully made a ${bar.name} and gained ${PLAYER_LIST[i].data.xp} xp!`;
                        if(PLAYER_LIST[i].forgeXp>=PLAYER_LIST[i].forgeTnl){
                            PLAYER_LIST[i].forge++;
                            PLAYER_LIST[i].forgeTnl =40*PLAYER_LIST[i].forge*1.2;
                            socket.emit('msg',{msg:`Your forging level has increased to ${PLAYER_LIST[i].forge}!`});
                        }
                        // console.log('smelting weight bug',bar.kg,PLAYER_LIST[i].kg,PLAYER_LIST[i].maxKg);
                        if(bar[0].kg+PLAYER_LIST[i].kg<=PLAYER_LIST[i].maxKg){
                            PLAYER_LIST[i].kg+=bar[0].kg;
                            PLAYER_LIST[i].backpack.push(bar[0]);
                            socket.emit('msg',{msg:result});
                            socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});
                        } else {
                            result += ` but you can't carry that much so it sizzles away...`;
                            socket.emit('msg',{msg:result});
                            socket.emit('player update', {player:PLAYER_LIST[i],atChest:false});
                        }
                    } else {
                        socket.emit('msg',{msg:"You failed at the smelting attempt."});
                    }
                    socket.emit('forge');    
                    PLAYER_LIST[i].doFlag="nothing";
                    PLAYER_LIST[i].data = {};
                }
            }
        }
    }
}