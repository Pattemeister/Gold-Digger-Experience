var io = require('socket.io');

var States = {
    START: 0,
    END: 1,
    TUNNEL: 2,
    ENDOFTUNNEL: 3
};

exports.initialize = function (server) {
  io = io.listen(server);
  
  var gold=100;
  var mineMultiplier= 1;
  var miningTools = [];
  var state=States.START;
  var turn=0;
  var maxTurns=21;
  var topscore=0;
  
  var chatInfra = io.of("/chat_infra")
      .on("connection", function(socket){ 
        socket.on("set_name", function (data) {
          socket.set('nickname', data.name, function () {
            socket.emit('name_set', data);
            socket.send(JSON.stringify({type:'serverMessage',
              message:'Welcome to A nifty gold digger experience!'}));
            socket.send(JSON.stringify({type:'serverMessage',
              message:'Get ready to mine some gold!'}));
            socket.broadcast.emit('user_entered', data);
            socket.emit('gold', gold);
            socket.emit('multiplier', mineMultiplier);
            socket.emit('topscore', topscore);
          });
        });
      });

  var chatCom = io.of("/chat_com")
      .on("connection", function (socket) {
        socket.on('message', function (message) {
          message = JSON.parse(message);
          if (message.type == "userMessage") {
            socket.get('nickname', function (err, nickname) {
              message.username = nickname;
              
              message.type ='myMessage';
              socket.send(JSON.stringify(message));
              
              turn++;
              
                switch(state){
                    case States.START: {
                        if (message.message.indexOf("help") !=-1){
                            socket.send(JSON.stringify({type:'helpMessage',
                            message:'There is a maximum of ' + (maxTurns-1) + ' turns in each game, and every command, except "help", will cost 1 turn. Spend them wise! Try to earn as much gold as possible. Hints will be given in messages on commands to use to explore the game'}));
                            socket.send(JSON.stringify({type:'helpMessage',
                            message:'You can always go ahead and try to "explore" the mountain, or restart the game by typing "restart"'}));
                            turn--;
                        }
                        else if(turn==maxTurns){
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'The season is over, and your oportunity to earn gold has expired. Come again next year!'}));
                            if(topscore<gold){
                                topscore=gold;
                                socket.emit('topscore', topscore);
                            }
                            state=States.END;
                        }
                        else if((message.message.indexOf("axe") !=-1||message.message.indexOf("pick up") !=-1)&&miningTools.length<1){
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'you have picked up your axe and drastically improved your outcome when mining!'}));
                            mineMultiplier = 10;
                            miningTools.push(1);
                        }
                        else if(message.message.indexOf("mine") !=-1){
                            var goldEarned = getRandomInt(1, 6)*mineMultiplier;
                            
                            if(miningTools.length<1){
                                socket.send(JSON.stringify({type:'userMessage', message:'you try to mine without a tool, providing poor results! ' + goldEarned + ' gold earned'}));
                            }
                            else{
                                socket.send(JSON.stringify({type:'userMessage', message:'swinging your tool reveals the treasures of the mountain. ' + goldEarned + ' gold earned'}));
                            }
                        
                            gold=gold+goldEarned;
                        }
                        else if(message.message.indexOf("explore") !=-1){
                            if(miningTools<1)
                                socket.send(JSON.stringify({type:'userMessage', message:'There is a pickaxe on the ground and it seems that there is a small tunnel in the rockwall 10 feet about your head'}));    
                            else 
                                socket.send(JSON.stringify({type:'userMessage', message:'hmmm, its seems that there is a small tunnel i the rockwall 10 feet about your head'}));
                        }
                        else if(message.message.indexOf("tunnel") !=-1||message.message.indexOf("climb") !=-1||message.message.indexOf("enter") !=-1||message.message.indexOf("wall") !=-1){
                            if(miningTools.length<1){
                                 socket.send(JSON.stringify({type:'userMessage', message:'You get some bruises but you are now ready to walk down the tunnel'}));
                                 state=States.TUNNEL;                                 
                            }
                            else
                                socket.send(JSON.stringify({type:'userMessage', message:'hmpfr, you try climb to and enter the tunnel, but its simply impossible without dropping your mining tool'}));
                        }
                        else if(miningTools>0&&(message.message.indexOf("drop") !=-1||message.message.indexOf("unyield") !=-1||message.message.indexOf("down") !=-1)){
                            miningTools=[];
                            mineMultiplier=1;
                            socket.send(JSON.stringify({type:'userMessage', message:'You have dropped you axe on the ground'}));
                        }
                        else if(message.message.indexOf("restart") !=-1){
                            turn=0;
                            state=States.START;
                            gold=100;
                            mineMultiplier=1;
                            miningTools=[];
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'The game has been restarted!'}));
                        }
                        else{
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'Command unclear, perhaps you should ask for help?'})); 
                            turn--;
                        }
                    
                    } break;
                    
                    case States.TUNNEL:{
                        if (message.message.indexOf("help") !=-1){
                            socket.send(JSON.stringify({type:'helpMessage',
                            message:'There is a maximum of ' + maxTurns + ' turns in each game, and every command, except "help", will cost 1 turn. Spend them wise! Try to earn as much gold as possible. Hints will be given in messages on commands to use to explore the game'}));
                            socket.send(JSON.stringify({type:'helpMessage',
                            message:'You can always go ahead and try to "explore" the mountain, or restart the game by typing "restart"'}));
                            turn--;
                        }
                        else if(turn==maxTurns){
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'The season is over, and your oportunity to earn gold has expired. Come again next year!'}));
                            if(topscore<gold){
                                topscore=gold;
                                socket.emit('topscore', topscore);
                            }
                            state=States.END;
                        }
                        else if(message.message.indexOf("mine") !=-1){
                            var goldEarned = getRandomInt(80, 120)*mineMultiplier;
                            socket.send(JSON.stringify({type:'userMessage', message:'The ore is so rich, that great treasures are obtained despite using your bare hands. ' + goldEarned + ' gold earned'}));
                            gold=gold+goldEarned;
                        }
                        else if(message.message.indexOf("explore") !=-1){
                            socket.send(JSON.stringify({type:'userMessage', message:'Its very dark ahead, but seems walkable. The walls of the tunnel glitters and sparks. The riches must be imense!'}));
                        }
                        else if(message.message.indexOf("out") !=-1||message.message.indexOf("climb") !=-1||message.message.indexOf("exit") !=-1||message.message.indexOf("back") !=-1){
                            socket.send(JSON.stringify({type:'userMessage', message:'You exits the tunnel return to your starting point'}));
                            state=States.START;                                 
                        }
                        else if(message.message.indexOf("walk") !=-1||message.message.indexOf("proceed") !=-1||message.message.indexOf("continue") !=-1||message.message.indexOf("forward") !=-1){
                            if(Math.random()<0.55){
                                socket.send(JSON.stringify({type:'userMessage', message:'As you walk down the tunnel, you see that the ore is so valuable, that your mining multiplier increases'}));
                                mineMultiplier=mineMultiplier+0.5;
                            }
                            else{
                                socket.send(JSON.stringify({type:'userMessage', message:'As you walk you stumble and almost fall into an abrubt hole in the floor. Sadly you loose all your gold into the hole. Your greed took you  too far'}));
                                gold=0;
                            }                                 
                        }
                        else if(message.message.indexOf("restart") !=-1){
                            turn=0;
                            state=States.START;
                            gold=100;
                            mineMultiplier=1;
                            miningTools=[];
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'The game has been restarted!'}));
                        }
                        else{
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'Command unclear, perhaps you should ask for help?'})); 
                            turn--;
                        }
                        
                    }break;
                        
                    case States.END: {
                        
                        if(message.message.indexOf("restart") !=-1){
                            turn=0;
                            state=States.START;
                            gold=100;
                            mineMultiplier=1;
                            miningTools=[];
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'The game has been restarted!'}));
                        }
                        else if (message.message.indexOf("help") !=-1){
                            socket.send(JSON.stringify({type:'helpMessage',
                            message:'There is a maximum of ' + maxTurns + ' turns in each game, and every command, except "help", will cost 1 turn. Spend them wise! Try to earn as much gold as possible. Hints on commands will be given in responses from server'}));
                            socket.send(JSON.stringify({type:'helpMessage',
                            message:'You can always go ahead and try to "explore" the mountain, or restart the game by typing "restart"'}));
                        }
                        else{
                            socket.send(JSON.stringify({type:'userMessage',
                            message:'I told you, the season is over! There is no more for you to do here. Better luck next time!'}));
                        }
                    } break;                   
            
                }
                
                socket.emit('progress', turn)
                socket.emit('multiplier', mineMultiplier);
                socket.emit('gold', gold);
              //socket.broadcast.send(JSON.stringify(message));
              //message.type = "myMessage";
              //socket.send(JSON.stringify(message));
            });
          }
        });
      });
      
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
