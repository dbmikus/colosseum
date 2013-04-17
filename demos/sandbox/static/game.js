var idstring = window.location.href.slice(window.location.href.indexOf('=')+1);
var id = parseInt(idstring,10);

var socket = io.connect("http://localhost:8888");

var gameNumber = 0;

$("#gameNumber").html("currently on game #...");


$("#dynamicstuff").html("this room's id is"+ id);



$("#gameOver").click(gameOver);



function gameOver(){
  socket.emit("gameOver",{"roomid": id});
}

socket.on("newGame", function(data){
  gameNumber = data.gameNumber;
  $("#gameNumber").html("currently on game #"+gameNumber);
});