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


var socket = io.connect("http://localhost:8889");

socket.emit("setUp", {
  roomid: urlParams.id,
  secretKey: urlParams.s
});

socket.on("newGame",function(data){
  console.log("selected");
  $("#chat-input").css("display","inline");
})

socket.on("msg", function(data){
  $("#chatlog").append("<div>"+ data.msg +"</div>");
});


function sendchat(){
  socket.emit("move",
  {
  roomid: urlParams.id,
  msg: $("#chat-input").val(),
  secretKey: urlParams.s
  });
}

