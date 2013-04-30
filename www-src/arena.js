////////////////////////
// Dynamic Formatting //
////////////////////////

// from Andy E
//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values

// Stuff for formatting based on URL parameters
var urlParams;
var players = ["",""];
var userName = prompt("What would you like to go by for this game?");
while (userName=== null){
  userName = prompt("You need a username.");
}

if(userName===null){
  throw "you didn't pick a username ='(";
}

var timer = 0;

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

$(document).ready(function () {
    if (isMobile()) {
        // So chat is not obscured by the banner
        var mobileBannerHeight = $('#banner').height();
        $('#chat').css('padding-top', String(mobileBannerHeight) + 'px');
    }
});

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
                              user: userName,
                            });
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
  });

  socket.on("newGame",function(data){
    $("#player2Vote").css("background-color","#FF635F");
    $("#player1Vote").css("background-color","#FF635F");
    if(data.winner === null){
      $("#notifications").html("Game Over, and we have a tie. Time for round 2!");
    }else{
      $("#notifications").html("Game Over. "+players[data.winner-1]+" wins!")
    }
  });


  socket.on("newPlayers", function(data){
    players[1] = data.p2;
    players[0] = data.p1;
    $("#redUser").html(data.p1);
    $("#blueUser").html(data.p2);
    $("#notifications").html("");
    if(data.p1 === userName
      || data.p2 === userName){
      $("#notifications").html("A new game has started, and you are playing!");      
    }else{
      $("#notifications").html("A new game has started!");            
    }
    beginTimer();
  });


  // Called when client sends a chat
  function sendchat(){
    var msg = $("#chat-input").val();
    if(msg.length<1){
      return;
    }
    socket.emit("sendChat",
                {
                  chat: msg
                });
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
    $('#chat-input').focus(function () {
      $('#spectators').css('height', '100%');
      $('#gameBox').css('height', '0');
      $('#gameBox').css('visibility', 'hidden');
      $('#gameBox').css('display', 'none');
    });

    // chat not selected, show everything again
    $('#chat-input').blur(function () {
      $('#spectators').css('height', '50%');
      $('#gameBox').css('height', '50%');
      $('#gameBox').css('visibility', 'visible');
      $('#gameBox').css('display', '');
    });
  }
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
  iframe.attr("sandbox","allow-same-origin allow-scripts allow-popups allow-forms")
  iframe.attr("id","gameIFrame");
  return iframe;
}



function beginTimer(){
  timer = 30;
}

setInterval(function(){
  if(timer===0){
    $("#timer").html("waiting");
  }else{
    $("#timer").html(timer);    
    timer-=1;
  }
},1000);
