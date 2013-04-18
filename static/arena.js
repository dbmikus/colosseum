// from Andy E
//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values

// Stuff for formatting based on URL parameters
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
    while (match = search.exec(query)) {
       urlParams[decode(match[1])] = decode(match[2]);
    }

    console.log(urlParams);
})();

////////////////////////////////////////////////////////////

if(urlParams.id){
  var socket =  io.connect("http://calm-ocean-1220.herokuapp.com/");

  // When asked what arena the client is a part of, the client responds with the
  // room id and with username
  socket.on("whatArena",function(data){
    socket.emit("thisArena", {roomid: urlParams.id,
                              user: getLocal('usercookie').username});
  });

  // Sent by server when a chat is received. Should be displayed by clients
  socket.on("newChat", function(data){
    var c = $("<div>").html(data.user + ": " + data.chat);
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

  // Called when client sends a chat
  function sendchat(){
    socket.emit("sendChat",
                {chat: $("#chat-input").val(),
                 user: getLocal('usercookie').username});
    $("#chat-input").val("");
  }
  function sendvote(choice){
    socket.emit("sendVote",{vote:choice});
  }
  $("#player1Vote").click(function(){
    sendvote(1);
  });
  $("#player2Vote").click(function(){
    sendvote(2);
  });



}
