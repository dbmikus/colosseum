// 15-237 Term Project - Colosseum
// nhamal
// dmikus
// zim


var express = require("express");
var app = express();

//REPLACE THE REQUIRE WITH "require('mongo-express-auth');" if installed as a node module
var mongoExpressAuth = require('./mongo-express-auth/lib/mongoExpressAuth.js');

//list containing all the rooms, used for displaying rooms in
//the browse rooms view
var arenalist = {};


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

mongoExpressAuth.init({
    mongo: {
        dbName: 'Colosseum',
        collectionName: 'accounts'
    }
}, function(){
    console.log('mongo ready!');
    app.listen(process.env.PORT || 3000);
});

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'racial slurs degrade society, white boy!' }));

//===========================
//  routes
//===========================

app.get('/', function(req, res){
    res.sendfile('static/index.html');
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
    res.send( arenalist );
});

app.get('/arena',function(request,response){
    response.sendfile("static/arena.html");
})

app.post('/arena', function(req, res){
    console.log(req.body);
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
            games: {}
        }
        nextId += 1;

        res.send({success:true, arenalist:arenalist});
    }else{

        res.send({success: false});
    }

});




app.use(express.static(__dirname + '/static/'));


//gameData[id]=
// {
    // name: name,
    // desc: desc,
    // player1: player secretKey,
    // player2: player secretKey,
    // audience: audience sockets
    // games: game sockets
// }


// we have to keep track of which sockets are in which rooms
// not just the other way around

var gameSockets ={};
var audienceSockets={};


//socket server for audience

var audienceIO = require('socket.io').listen(8888);


audienceIO.sockets.on("connection",function(socket){
    socket.on("thisArena",function(data){
        if(gameData[data.roomid]){
            audienceSockets[socket.sessionid]= data.roomid;
            gameData[data.roomid]["audience"][socket.sessionid]=socket;
            socket.emit("arenaInfo",
            {
               roomSpecs: arenalist[data.roomid]
            });
            socket.on("sendChat",function(chatData){
                for(var s in gameData[data.roomid]["audience"]){
                    gameData[data.roomid]["audience"][s].emit("newChat",chatData);
                }
            });
        }
    });

    socket.on("disconnect", function(data){
        try{
            delete gameData[audienceSockets[socket.sessionid]]["audience"][socket.sessionid];
            delete audienceSockets[socket.sessionid]
        }
        catch(e){
        }
    });

    socket.emit("whatArena",{});
});





// socket server for gameplay

var gameIO = require('socket.io').listen(8889);


gameIO.sockets.on("connection",function(socket){
    socket.on("setUp",function(data){
        if(gameData[data.roomid]){
            gameSockets[socket.id]= data.roomid;
            gameData[data.roomid]["games"][data.secretKey]=socket;
            if(Object.keys(gameData[data.roomid]["games"]).length>3
                && gameData[data.roomid]["started"]===false){
                console.log("starting game");
                startGame(data.roomid);
            }
        }else
        console.log("wat");
    });

    socket.on("move",function(data){
        console.log(socket.id);
        console.log(gameData[data.roomid]["player1"]);
        console.log(gameData[data.roomid]["player2"]);
        if(gameData[data.roomid]["player1"]===data.secretKey){
            emitToAll(gameData[data.roomid]["games"],"msg",data);
        }
        if(gameData[data.roomid]["player2"]===data.secretKey){
            emitToAll(gameData[data.roomid]["games"],"msg",data);
        }
    });

    socket.on("disconnect", function(data){
        try{
            delete gameData[gameSockets[socket.id]]["games"][socket.id];
            delete gameSockets[socket.id]
        }
        catch(e){
        }
    });

});





function startGame(roomid){
    var arena = gameData[roomid];
    if (!arena.player1){
        arena.player1 = randomSocket(arena.games);
        while(arena.player1===arena.player2){
            arena.player1= randomSocket(arena.games);
        }
    }
    if (!arena.player2){
        arena.player2 = randomSocket(arena.games);
        while(arena.player1===arena.player2){
            arena.player1= randomSocket(arena.games);
        }
    }
    arena["games"][arena.player1].emit("newGame",{});
    arena["games"][arena.player2].emit("newGame",{});
    arena["started"]=true;
}

function randomSocket(sockets){
    var keys = Object.keys(sockets);
    return keys[Math.floor(keys.length * Math.random())];
}



function emitToAll(sockets, msg, data){
    for (var s in sockets){
        sockets[s].emit(msg, data);
    }
}
