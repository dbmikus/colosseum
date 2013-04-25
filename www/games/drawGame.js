
var canvas = document.getElementById("drawCanvas");
var ctx = canvas.getContext("2d");


(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

//change this to change between local and digital ocean
//var socket = io.connect("http://localhost:3000");
var socket = io.connect("http://198.199.82.58:3000");

socket.emit("setUp", {
  roomid: urlParams.id,
  secretKey: urlParams.s
});

socket.on("selectedAsPlayer", function(data){
  console.log("selected");
  drawCircle(ctx,[20,20],"green",50);
});

socket.on("newGame", function(data){
  reset();
});


socket.on("movemade",function(data){
  var l= data.moveData.drawing.length;
  ctx.linewidth = 3;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  moveTo(data.moveData.drawing[0][0],data.moveData.drawing[0][1]);
  for (var i = 1; i<l; i++){
    ctx.lineTo(data.moveData.drawing[i][0],data.moveData.drawing[i][1]);
  }
  ctx.stroke();
});

canvas.addEventListener("mousedown", canvasMouseDown, false);
canvas.addEventListener("mousemove", canvasMouseMove, false);
canvas.addEventListener("mouseup", canvasMouseUp, false);

var currentDrawing = [];
var isDrawing= false;

function canvasMouseDown(event){
  isDrawing = true;
  currentDrawing = [];
  currentDrawing.push([event.x,event.y]);
}

function canvasMouseMove(event){
  if(isDrawing){
    currentDrawing.push([event.x,event.y]);
  }
}

function canvasMouseUp(event){
  if(isDrawing){
    socket.emit("move",{
      moveData:{
        drawing: currentDrawing
      },
      roomid: urlParams.id,
      secretKey: urlParams.s
    });
    isDrawing = false;
  }
}

function drawCircle(ctx, location, color, dimensions) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(location[0], location[1], dimensions, 0, 2 * Math.PI, false);
  ctx.fill();
}

function reset(){
    ctx.fillStyle= "white";
    ctx.fillRect(0,0, canvas.width, canvas.height);
}




