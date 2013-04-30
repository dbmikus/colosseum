////////////////////////
// Dynamic Formatting //
////////////////////////

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

// Position the wrapper below the bar at the top
$(document).ready(function () {
    if (isMobile()) {
      resizeUnderbar();
    }
});

function resizeUnderbar() {
  // So chat is not obscured by the banner
  var underbar = $('#underbar');
  var barheight = $('#banner').outerHeight();
  underbar.css('top', barheight);
  underbar.css('height', String($(window).height() - barheight) + 'px');
}

////////////////////////////////////////////////////////////
//                     Socket stuff                       //
////////////////////////////////////////////////////////////

if(urlParams.id){
    // This line is modified by Mustache
    var socket = io.connect("{{{host}}}");

  // When asked what arena the client is a part of, the client responds with the
  // room id and with username
  socket.on("whatArena",function(data){
    socket.emit("thisArena", {roomid: urlParams.id,
                              user: "somename"});
  });

  // Sent by server when a chat is received. Should be displayed by clients
  socket.on("newChat", function(data){
    var c = $("<div>").html(data.user + ": " + data.chat);
    c.attr('class', 'specChatMsg');
    $("#chat").append(c);
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
  });

  socket.on("arenaInfo",function(data){
    arenaInfo = data.roomSpecs;
    var iframe = renderIFrame(arenaInfo);
    $("#game").append(iframe);

    socket.on("newGame",function(data){
      $("#player2Vote").css("background-color","#FF635F");
      $("#player1Vote").css("background-color","#FF635F");

    });
  });

  // Called when client sends a chat
  function sendchat() {
    var username = $("#username-field").val();
    var msg = $("#chat-input").val();
    if(username.length < 3){
      alert("make a better username");
      return;
    }
    if(msg.length<1){
      return;
    }
    socket.emit("sendChat",
                {chat: msg,
                 user: username});
    $("#chat-input").val("");

    // re-select the text field
    $('#chat-input').focus();
  }


  function sendvote(choice){
    socket.emit("sendVote",{vote:choice});
  }


  $("#player1Vote").click(function(){
    sendvote(1);
    $("#player1Vote").css("background-color","#A6110D");
    $("#player2Vote").css("background-color","#FF635F");
  });
  $("#player2Vote").click(function(){
    sendvote(2);
    $("#player2Vote").css("background-color","#A6110D");
    $("#player1Vote").css("background-color","#FF635F");

  });

  // On mobile, if text input is focused, hide the competitor part since the
  // user will be chatting and will only have space to view chat
  if (isMobile()) {
    $('#chat-input').focus(verticalCollapse);
    $('#username-field').focus(verticalCollapse);

    // chat not selected, show everything again
    $('#chat-input').blur(verticalExpand);
    $('#username-field').blur(verticalExpand);
  }
}

function verticalCollapse() {
  console.log('collapse');
  resizeUnderbar();
  $('#gameBox').css('height', '0');
  $('#spectators').css('height', '100%');
  $('#gameBox').css('visibility', 'hidden');
  $('#gameBox').css('display', 'none');
}

function verticalExpand() {
  console.log('expand');
  resizeUnderbar();
  $('#spectators').css('height', '50%');
  $('#gameBox').css('height', '50%');
  $('#gameBox').css('visibility', 'visible');
  $('#gameBox').css('display', '');
}

function renderIFrame(arenaInfo){
  var iframe = $("<iframe>");

  if(arenaInfo.type === "chat"){
    iframe.attr("src","games/chatGame.html?id="+arenaInfo.id+"&s="+
                socket.socket.sessionid);
  }
  if(arenaInfo.type === "draw"){
    iframe.attr("src","games/drawGame.html?id="+arenaInfo.id+"&s="+
                socket.socket.sessionid);
  }

  iframe.attr("sandbox","allow-same-origin allow-scripts allow-popups allow-forms");
  iframe.attr("id", "gameIFrame");

  return iframe;
}
