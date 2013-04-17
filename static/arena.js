// from Andy E
//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values

var urlParams;

var arenaInfo={};
var secretKey="";
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

if(urlParams.id){
  var socket =  io.connect("http://localhost:8888")

  socket.on("whatArena",function(data){
    socket.emit("thisArena", {roomid:urlParams.id})
  });

  socket.on("newChat", function(data){
    var c = $("<div>").html(data.user+": " +data.chat);
    $("#chat").append(c);
  });

  socket.on("arenaInfo",function(data){
    arenaInfo = data.roomSpecs;
    var iframe = $("<iframe>");
    iframe.attr("src","games/chatGame.html?id="+urlParams.id+"&s="+
      socket.socket.sessionid);
    iframe.attr("sandbox","allow-same-origin allow-scripts allow-popups allow-forms")
    iframe.attr("id","gameIFrame");

    $("#game").append(iframe);

  });

  function sendchat(){
    socket.emit("sendChat",{chat:$("#chat-input").val(), user:"anybody"});
    $("#chat-input").val("");
  }
}



socket.on("gameOver",function(data){
  $("#other").append("game has ended<br>");
});



