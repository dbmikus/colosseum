var iframe = $("<iframe>");
iframe.attr("src","testGame.html?id=3");
iframe.attr("sandbox","allow-same-origin allow-scripts allow-popups allow-forms")
iframe.attr("id","gameIframe");


var socket = io.connect("http://localhost:8888");

socket.on("gameOver",function(data){
  $("#other").append("game has ended<br>");
});



$("#game").append(iframe);

$("#newGame").click(newGame);



function newGame(){
  socket.emit("startNewGame", {});
}