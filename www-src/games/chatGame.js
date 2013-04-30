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
})();

// This line is modified by Mustache
var socket = io.connect("{{{host}}}");

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

socket.on("movemade", function(data){
  $("#chatlog").append("<div class='player" + data.player +
                       "'>" + data.moveData.msg + "</div>");
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
  $("#chat-input").val("");
}

// Does all of the styling and DOM stuff that is through JS
function renderView() {
  var chatlog = $('#chatlog');
  var chatinput = $('#chat-input');

  if (isMobile()) {
    chatlog.css('margin', '10px');
    chatlog.css('height', '100%');
    chatlog.css('width', '100%');
    // hide the chat input form since mobile cannot participate
    $('form[name="' + 'chatForm' + '"]').css('visibility', 'hidden');
  } else {
    // desktop
    chatlog.css('margin', '10px');
    chatlog.css('height', '300px');
    chatinput.css('margin-left', '50px');
  }
}
