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
  var socket = io.connect("http://198.199.82.58:3000");

  console.log("JIEJFOIJWOFJEIO");

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
    $("#player2Vote").css("box-shadow", "none");
    $("#player1Vote").css("box-shadow", "none");
    if(data.winner === null){
      $("#notifications").html("Game Over, and we have a tie. Time for round 2!");
    }else{
      $("#notifications").html("Game Over. "+players[data.winner-1]+" wins!"+
        "Check out the votes pie graph below.")
    }
    showVotingStats(players[0],data.p1Votes, players[1],data.p2Votes);
  });


  socket.on("newPlayers", function(data){
    $("#stats").html("");
    $("#gameIFrame").show();
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




  //voting bindings

  $("#player1Vote").click(function(){
    sendvote(1);
    $("#player1Vote").css("box-shadow", "0 0px 5px 5px #660000");
    $("#player2Vote").css("box-shadow", "none");
  });
  $("#player2Vote").click(function(){
    sendvote(2);
    $("#player2Vote").css("box-shadow", "0 0px 5px 5px #000099");
    $("#player1Vote").css("box-shadow", "none");
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

//creates an iframe from the given arena info
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
  if(arenaInfo.type!=="draw" && arenaInfo.type !=="chat"){

    iframe.attr("src",""+arenaInfo.type+"?id="+arenaInfo.id+"&s="+
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


// inspired by https://gist.github.com/enjalot/1203641
function showVotingStats(p1,votes1,p2,votes2){
    if (votes1 +votes2 ===0){
      return;
    }
    $("#gameIFrame").hide();
    var w = 500;                        
    var h = 500;                            
    var r = 150;


    data = [{"label":p1, "value":votes1}, 
            {"label":p2, "value":votes2}];
    
    var vis = d3.select("#stats")
        .append("svg:svg")              
        .data([data])                   
            .attr("width", w)           
            .attr("height", h)
        .append("svg:g")      
            .attr("transform", "translate(" + r + "," + r + ")")   

    var arc = d3.svg.arc() 
        .outerRadius(r)
        .innerRadius(80);

    var pie = d3.layout.pie()
        .value(function(d) { return d.value; });

    var arcs = vis.selectAll("g.slice")     
        .data(pie)                           
        .enter()                            
            .append("svg:g")                
                .attr("class", "slice");    

        arcs.append("svg:path")
                .attr("fill", function(d, i) {
                  if(data[i].label===p1){
                    return "red";
                  }
                  return "blue";
                 } ) 
                .attr("d", arc);  

        arcs.append("svg:text")
                .attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d, i) { return data[i].label; });
}

