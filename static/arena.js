

// from Andy E
//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values

var urlParams;
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


  function sendchat(){
    socket.emit("sendChat",{chat:$("#chat-input").val(), user:"anybody"});
    $("#chat-input").val("");
  }
}

