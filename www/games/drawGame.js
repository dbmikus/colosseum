
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

// This line is modified by Mustache
var socket = io.connect("http://198.199.82.58:3000");

reset();

socket.emit("setUp", {
  roomid: urlParams.id,
  secretKey: urlParams.s
});

socket.on("selectedAsPlayer", function(data){

});

socket.on("newGame", function(data){
  reset();
});


socket.on("movemade",function(data){
  var l= data.moveData.drawing.length;
  ctx.linewidth = 5;
  if (data.player === 1){
    ctx.strokeStyle = "red";
  }else{
    ctx.strokeStyle = "blue";
  }
  ctx.beginPath();
  moveTo(data.moveData.drawing[0][0],data.moveData.drawing[0][1]);
  for (var i = 1; i<l; i++){
    ctx.lineTo(data.moveData.drawing[i][0],data.moveData.drawing[i][1]);
  }
  ctx.stroke();
});


if (getPlatform==="Android" ||
    getPlatform==="iOS"){
  canvas.addEventListener("touchstart", canvasTouchDown, false);
  canvas.addEventListener("touchmove", canvasTouchMove, false);
  canvas.addEventListener("touchend", canvasTouchUp, false);
}else{
  canvas.addEventListener("mousedown", canvasMouseDown, false);
  canvas.addEventListener("mousemove", canvasMouseMove, false);
  canvas.addEventListener("mouseup", canvasMouseUp, false);
}

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

function canvasTouchDown(event){
  isDrawing = true;
  currentDrawing = [];
  currentDrawing.push([event.changedTouches[0].pageX,
    event.changedTouches[0].pageY]);
}

function canvasTouchMove(event){
  if(isDrawing){
    currentDrawing.push([event.targetTouches[0].pageX,
      event.targetTouches[0].pageY]);
  }
}

function canvasTouchUp(event){
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
    ctx.fillStyle="black";
    ctx.fillText("draw on me!",0,0);
}



function getPlatform(){
  if (navigator.userAgent.indexOf("Android") !== -1){
    return "Android";
  }
  else if (!!(navigator.userAgent.match(/iPhone/i) ||
           navigator.userAgent.match(/iPod/i) ||
           navigator.userAgent.match(/iPad/i))){
    return "iOS";
  }
  else if(navigator.platform.indexOf("Linux") !== -1 ){
    return "Linux";
  }
  else if(navigator.platform.indexOf("Win") !== -1){
    return "Windows";
  }
  return "Other";
}
