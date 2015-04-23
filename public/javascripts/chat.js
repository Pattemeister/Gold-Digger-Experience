var chatInfra = io.connect('/chat_infra'),
    chatCom = io.connect('/chat_com');

var gold;
var mineMultiplier;
var topscore;

chatInfra.on('name_set', function (data) {
  chatInfra.on("user_entered", function (user) {
    $('#messages').append('<div class="systemMessage">' + user.name
        + ' has joined the room.' + '</div>');
  });

  chatInfra.on('message', function (message) {
    var message = JSON.parse(message);
    $('#messages').append('<div class="' + message.type + '">'
        + message.message + '</div>');
  });

  chatCom.on('message', function (message) {
    var message = JSON.parse(message);
      $('#messages').append('<div class="' + message.type + '"><span class="name">'
          //+ message.username + ":</span> "
          + message.message + '</div>');
  });
  
  chatInfra.on("gold", function(data){
      var data = JSON.parse(data);
      gold=data;
      document.getElementById("gold").innerHTML = "Gold: "+gold;
  });
  
  chatInfra.on("multiplier", function(data){
    var data = JSON.parse(data);
    mineMultiplier=data;
    document.getElementById("multiplier").innerHTML = "Mining Multiplier: "+mineMultiplier;
  });
  
  chatCom.on("gold", function(data){
      var data = JSON.parse(data);
      gold=data;
      document.getElementById("gold").innerHTML = "Gold: "+gold;
  });
  
  chatCom.on("multiplier", function(data){
    var data = JSON.parse(data);
    mineMultiplier=data;
    document.getElementById("multiplier").innerHTML = "Mining Multiplier: "+mineMultiplier;
    
    var myDiv = document.getElementById("messages");
    myDiv.scrollTop = myDiv.scrollHeight;
  });
  
  chatCom.on("topscore", function(data){
    var data = JSON.parse(data);
    topscore=data;
    document.getElementById("topscore").innerHTML = "Top Score: "+topscore;
  });

  chatCom.on("progress", function(data){
    var data = JSON.parse(data);
    topscore=data;
    document.getElementById("progress").innerHTML = "Turns used: "+topscore;
  });
  
  $('#nameform').hide();
  $('#messages').append('<div class="systemMessage">Hello ' + data.name + '</div>');
  
  $('#send').click(function () {
    var data = {
      message:$('#message').val(),
      type:'userMessage'
    }; 
    chatCom.send(JSON.stringify(data));
    $('#message').val('');
  });

});

$(function () {
  $('#setname').click(function () {
    chatInfra.emit("set_name", {name:$('#nickname').val()});
  });
  
  // When you press enter on the textfield, 
  // it automatically clicks on the button "send"
  $('#message').keypress(function(e){
	if (e.which == 13){ // on enter!
		$( "#send" ).trigger( "click" );
	}
  });

});

