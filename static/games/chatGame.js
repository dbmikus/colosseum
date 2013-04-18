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


var socket = io.connect("http://calm-ocean-1220.herokuapp.com/");

socket.emit("setUp", {
  roomid: urlParams.id,
  secretKey: urlParams.s
});


socket.on("newGame", function(data){
  $("#chatlog").html("");
  $("#chatlog").append("<div>Player "+data.winner+ " won the last game!</div>");
  $("#chat-input").hide();
});

socket.on("selectedAsPlayer",function(data){
  $("#chat-input").show();
})

socket.on("msg", function(data){
  $("#chatlog").append("<div> player "
    +data.player+": "+ data.moveData.msg +"</div>");
});


function sendchat(){
  socket.emit("move",
  {
    moveData:{
      msg: $("#chat-input").val()
    },
  roomid: urlParams.id,
  secretKey: urlParams.s
  });
}

