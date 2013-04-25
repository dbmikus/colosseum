// 15-237 Term Project - Colosseum
// nhamal
// dmikus
// zim

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
//gameData[id]=
// {
    // name: name,
    // desc: desc,
    // player1: player socket,
    // player2: player socket,
    // audience: player sockets
// }

var nextId = 0;

//===========================
//  init
//===========================

// mongoExpressAuth.init({
//     mongo: {
//         dbName: 'Colosseum',
//         collectionName: 'accounts'
//     }
// }, function(){
//     console.log('mongo ready!');
//     app.listen(process.env.PORT || 3000);
// });

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

app.get('/me', function(req, res){
    mongoExpressAuth.checkLogin(req, res, function(err){
        if (err)
            res.send(err);
        else {
            mongoExpressAuth.getAccount(req, function(err, result){
                if (err)
                    res.send(err);
                else
                    res.send(result);
            });
        }
    });
});

app.post('/login', function(req, res){
    mongoExpressAuth.login(req, res, function(err){
        if (err)
            res.send(err);
        else
            res.send('ok');
    });
});

app.post('/logout', function(req, res){
    mongoExpressAuth.logout(req, res);
    res.send('ok');
});

app.post('/register', function(req, res){
    mongoExpressAuth.register(req, function(err){
        if (err)
            res.send(err);
        else
            res.send('ok');
    });
});

app.get('/arenalist', function(req, res){
    res.send(arenalist);
});

app.get('/arena',function(req, res){
    if (pd.isMobile(req)) {
        res.sendfile('www/mobile-arena.html');
    } else {
        res.sendfile("www/desktop-arena.html");
    }
})

app.post('/arena', function(req, res){
    var name = req.body["name"];
    var desc = req.body["desc"];

    if(name && desc){
        arenalist[nextId] =
            {
                id:nextId,
                name: name,
                desc: desc,
                type: "textGame"
            };
        gameData[nextId] =
        {
            name: name,
            desc: desc,
            started: false,
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
    // player1: player secretKey,
    // player2: player secretKey,
    // audience: audience sockets
    // games: game sockets,
    // votes: votes
// }


// we have to keep track of which sockets are in which rooms
// not just the other way around

var gameSockets ={};
var audienceSockets={};


//socket server for audience
var http = require("http");
var server = http.createServer(app);

var IO = require('socket.io').listen(server);
// needed for heroku
// IO.configure(function(){
//     IO.set('transports', ["xhr-polling"]);
//     IO.set('polling duration', 10);
// });

server.listen(process.env.PORT || 3000);


IO.sockets.on("connection",function(socket){
    socket.on("thisArena",function(data){
        if(gameData[data.roomid]){
            audienceSockets[socket.id]= data.roomid;
            gameData[data.roomid]["audience"][socket.id]=socket;
            socket.emit("arenaInfo",
            {
               roomSpecs: arenalist[data.roomid]
            });
            socket.on("sendChat",function(chatData){
                for(var s in gameData[data.roomid]["audience"]){
                    gameData[data.roomid]["audience"][s].emit("newChat",chatData);
                }
            });
            socket.on("sendVote",function(voteData){
                gameData[data.roomid]["votes"][socket.id] = voteData.vote;
            });
        }
    });

    socket.on("disconnect", function(data){
        try{
            delete gameData[audienceSockets[socket.id]]["audience"][socket.id];
            delete audienceSockets[socket.id]
        }
        catch(e){
        }
        try{
            delete gameData[gameSockets[socket.id]]["games"][socket.id];
            delete gameSockets[socket.id]
        }
        catch(e){
        }

    });

    // game socket stuff
    socket.on("setUp",function(data){
        if(gameData[data.roomid]){
            gameSockets[socket.id]= data.roomid;
            gameData[data.roomid]["games"][data.secretKey]=socket;
            if(Object.keys(gameData[data.roomid]["games"]).length>3
                &&gameData[data.roomid]["started"]===false){
                startGame(data.roomid);
            }
        }else
        console.log("wat");
    });

    socket.on("move",function(data){
        if(gameData[data.roomid]["player1"]===data.secretKey){
            emitToAll(gameData[data.roomid]["games"],"msg",
                {
                    moveData:data.moveData,
                    player: 1
                });
        }
        if(gameData[data.roomid]["player2"]===data.secretKey){
            emitToAll(gameData[data.roomid]["games"],"msg",
                {
                    moveData:data.moveData,
                    player: 2
                });
        }
    });


    socket.emit("whatArena",{});
});



function startGame(roomid){
    var arena = gameData[roomid];
    if(Object.keys(arena["games"]).length<4){
        return;
    }
    if (!arena.player1){
        arena.player1 = randomSocket(arena.games);
        while(arena.player1===arena.player2){
            arena.player1= randomSocket(arena.games);
        }
    }
    if (!arena.player2){
        arena.player2 = randomSocket(arena.games);
        while(arena.player1===arena.player2){
            arena.player2= randomSocket(arena.games);
        }
    }
    arena["votes"]= {};
    arena["games"][arena.player1].emit("selectedAsPlayer",{});
    arena["games"][arena.player2].emit("selectedAsPlayer",{});
    arena["started"]=true;
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
    setTimeout(function(){
        startGame(roomid);
    },3000);
}


setInterval(function(){
    console.log(IO.sockets);
},5000);


function randomSocket(sockets){
    var keys = Object.keys(sockets);
    return keys[Math.floor(keys.length * Math.random())];
}



function emitToAll(sockets, msg, data){
    for (var s in sockets){
        sockets[s].emit(msg, data);
    }
}
