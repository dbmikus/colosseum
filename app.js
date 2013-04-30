// 15-237 Term Project - Colosseum
// nhamal
// dmikus
// zim

/////////////////////////////////////////////////////////////
// Building static source directory using source templates //
/////////////////////////////////////////////////////////////
var build = require('./build.js');
build.renderTemplates('./www-src', './www');

//================
// File includes
//================
var pd = require('./platformDetection.js');

var express = require("express");
var app = express();

//REPLACE THE REQUIRE WITH "require('mongo-express-auth');" if installed as a node module
var mongoExpressAuth = require('./mongo-express-auth/lib/mongoExpressAuth.js');

// list containing all the rooms, used for displaying rooms in the browse
// rooms view
var arenalist = {};

// number of milliseconds for a game
var gamelength = 30000;


var gameData  = {};
var chat

//gameData[id]=
// {
    // name: name,
    // desc: desc,
    // started: if it started or not
    // player1: player secretKey,
    // player2: player secretKey,
    // audience: audience sockets
    // games: game sockets,
    // votes: votes
// }

var nextId = 0;

//===========================
//  init
//===========================

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'racial slurs degrade society, white boy!' }));

//===========================
//  routes
//===========================
//app.listen(process.env.PORT || 3000);

app.get('/', function(req, res){
    if(pd.isMobile(req)) {
        // the mobile page
        res.sendfile('www/index.html');
    } else {
        // The desktop page
        res.sendfile('www/desktop-index.html');
    }
});

app.get('/findarena', function(req, res){
    if (pd.isMobile(req)) {
        res.sendfile('www/mobile-findarena.html');
    } else {
        res.sendfile('www/desktop-findarena.html');
    }
});

app.get('/create', function(req, res){
    if (pd.isMobile(req)) {
        res.sendfile('www/mobile-create.html');
    } else {
        res.sendfile('www/desktop-create.html');
    }
});

app.get('/arena',function(req, res){
    if (pd.isMobile(req)) {
        res.sendfile('www/mobile-arena.html');
    } else {
        res.sendfile("www/desktop-arena.html");
    }
});

app.get('/register',function(req, res){
    if (pd.isMobile(req)) {
        res.sendfile('www/mobile-register.html');
    } else {
        res.sendfile("www/desktop-register.html");
    }
});





app.get('/arenalist', function(req, res){
    res.send(arenalist);
});

app.post('/arena', function(req, res){
    var name = req.body["name"];
    var desc = req.body["desc"];
    var type = req.body["type"];
    if(name && desc){
        arenalist[nextId] =
            {
                id:nextId,
                name: name,
                desc: desc,
                type: type,
                population:0,
                p1: null,
                p2: null
            };
        gameData[nextId] =
        {
            name: name,
            desc: desc,
            started: false,
            inPlay: false,
            player1:  null,
            player2:  null,
            audience: {},
            games: {},
            votes: {}
        }
        nextId += 1;

        res.send({success:true, arenalist:arenalist});
    }else{
        res.send({success: false});
    }
});




app.use(express.static(__dirname + '/www/'));


//gameData[id]=
// {
    // name: name,
    // desc: desc,
    // started: if it started or not,
    // player1: player secretKey,
    // player2: player secretKey,
    // audience: audience sockets
    // games: game sockets,
    // votes: votes
// }


// we have to keep track of which sockets are in which rooms
// not just the other way around

var gameSockets = {};
var audienceSockets = {};


//socket server for audience
var http = require("http");
var server = http.createServer(app);

var IO = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);


IO.sockets.on("connection",function(socket){
    // Receives message from client detailing what arena client is in.
    // This occurs when a client first connects to a room
    // Receives object:
    // { roomid : int,
    //   user   : string }
    socket.on("thisArena",function(data){
        // If the room already exists in gameData...
        if(gameData[data.roomid]){
            // create a key-value pair mapping socket identifier to the room the
            // socket exists in
            audienceSockets[socket.id] = data.roomid;
            // add the socket to the server's knowledge of the audience for the
            // given room id the socket sent over
            gameData[data.roomid]["audience"][socket.id] = socket;


            socket.username = data.user;
            socket.imgURL = data.URL;
            arenalist[roomid].population+=1;


            // sends metadata about the room the client connected to back over
            // to the client
            socket.emit("arenaInfo", {
                roomSpecs: arenalist[data.roomid]
            });

            // Set up handler for when the client sends a chat message to the
            // room.
            // This just sends the message back to all clients in the room so
            // they can update their chat display
            socket.on("sendChat",function(chatData){
                for(var s in gameData[data.roomid]["audience"]){
                    gameData[data.roomid]["audience"][s].emit("newChat",{
                            chat:chatData.chat,
                            user: socket.username
                        });
                }
            });

            // simply updates the vote count for the room
            socket.on("sendVote",function(voteData){
                gameData[data.roomid]["votes"][socket.id] = voteData.vote;
            });
        }

        // We do nothing if the client says it is part of a room that does not
        // exist
    });

    // Sent when a client leaves a room
    socket.on("disconnect", function(data){
        arenalist[gameSockets[socket.id]]-=1;
        // try to delete the client from being listed as a game participant.
        // Not all clients in a room are game participants, but try anyways
        try{
            delete gameData[gameSockets[socket.id]]["games"][socket.id];
            delete gameSockets[socket.id]
        }
        catch(e){
        }
        // Try to delete the client socket from being an audience member
        try{
            delete gameData[audienceSockets[socket.id]]["audience"][socket.id];
            delete audienceSockets[socket.id]
        }
        catch(e){
        }
    });

    // game socket stuff
    socket.on("setUp",function(data){
        if(gameData[data.roomid]){
            gameSockets[data.secretKey]= data.roomid;
            gameData[data.roomid]["games"][data.secretKey]=socket;
            socket.username = gameData[data.roomid]["audience"][data.secretKey].username;
            if(Object.keys(gameData[data.roomid]["games"]).length>3
                &&gameData[data.roomid]["started"]===false){
                startGame(data.roomid);
            }
        }else
        console.log("wat");
    });

    socket.on("move",function(data){
        if(gameData[data.roomid]["inPlay"]===true){
            if(gameData[data.roomid]["player1"]===data.secretKey){
                emitToAll(gameData[data.roomid]["games"],"movemade",
                    {
                        moveData:data.moveData,
                        player: 1
                    });
            }
            if(gameData[data.roomid]["player2"]===data.secretKey){
                emitToAll(gameData[data.roomid]["games"],"movemade",
                    {
                        moveData:data.moveData,
                        player: 2
                    });
            }
        }
    });


    // Ask the client socket what arena it belongs to.
    // The client will respond with "thisArena" with the following object:
    // { roomid: int,
    //   user: string }
    socket.emit("whatArena", {});
});

function startGame(roomid){
    var arena = gameData[roomid];
    if(Object.keys(arena["games"]).length<4){
        arena["started"]= false;
        return;
    }
    if (!arena.player1 || arena["games"][arena.player1] ===undefined){
        arena.player1 = randomSocket(arena.games);
        while(arena.player1===arena.player2){
            arena.player1= randomSocket(arena.games);
        }
    }
    if (!arena.player2 || arena["games"][arena.player2]=== undefined ){
        arena.player2 = randomSocket(arena.games);
        while(arena.player1===arena.player2){
            arena.player2= randomSocket(arena.games);
        }
    }
    arena["votes"]= {};
    arena["games"][arena.player1].emit("selectedAsPlayer",{});
    arena["games"][arena.player2].emit("selectedAsPlayer",{});
    emitToAll(arena["audience"],"newPlayers",{
        p1: arena["audience"][arena.player1].username,
        p1URL: arena["audience"][arena.player1].imgURL,
        p2: arena["audience"][arena.player2].username,
        p2URL: arena["audience"][arena.player2].imgURL
    });
    arenalist[roomid].p1 = arena["audience"][arena.player1].username;
    arenalist[roomid].p2 = arena["audience"][arena.player2].username;
    arena["started"]=true;
    arena["inPlay"]=true;
    setTimeout(function(){
        endGame(roomid);
    },gamelength);
}


function endGame(roomid){
    var arena = gameData[roomid];
    var p1Votes = 0;
    var p2Votes = 0;
    var winner;
    for (var voter in arena["votes"]){
        if(arena["votes"][voter]===1){
            p1Votes+=1;
        } else if(arena["votes"][voter]===2){
            p2Votes+=1;
        }
    }
    if(p1Votes>p2Votes){
        arena.player2 = null;
        winner = 1;
    }else if(p1Votes<p2Votes){
        arena.player1 = null;
        winner = 2;
    }else{
        winner = null;
    }
    emitToAll(arena["games"],"newGame",
        {
            winner:winner,
            p1Votes: p1Votes,
            p2Votes: p2Votes
        });
    emitToAll(arena["audience"],"newGame",{});
    arena["inPlay"]=false;
    setTimeout(function(){
        startGame(roomid);
    },3000);
}

// diagnostic purposes
// setInterval(function(){
//     console.log("current sockets: ");
//     console.log(IO.sockets.sockets);
//     console.log("current games: ");
//     console.log(gameData);
// },5000);


function randomSocket(sockets){
    var keys = Object.keys(sockets);
    return keys[Math.floor(keys.length * Math.random())];
}



function emitToAll(sockets, msg, data){
    for (var s in sockets){
        sockets[s].emit(msg, data);
    }
}
