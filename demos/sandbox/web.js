var express = require("express"); // imports express
var app = express();        // create a new instance of express


// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});






function initServer() {
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(process.env.PORT || 3000);




//socket server

var io = require('socket.io').listen(8888);

var gameNumber =0;


io.sockets.on("connection",function(socket){
  socket.emit("newGame",{"gameNumber": gameNumber});
  socket.on("gameOver",function(data){
    io.sockets.emit("gameOver", data);
  });
  socket.on("startNewGame",function(data){
    gameNumber++;
    io.sockets.emit("newGame",{"gameNumber": gameNumber});
  })
});