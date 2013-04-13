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
var arenalist = [];


var gameData  = {};
//gameData[id]=
// {
    // name: name,
    // desc: desc,
    // player1: player socket,
    // player2: player socket,
    // audience: player sockets
// }

var nextId =0;

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
                    res.send(result); // NOTE: direct access to the database is a bad idea in a real app
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
    res.send({
        arenalist: arenalist
    });
});


app.post('/arena', function(req, res){
    console.log(req.body);
    var name = req.body["name"];
    var desc = req.body["desc"];

    if(name && desc){
        arenalist.push({id:nextId,name: name, desc: desc});
        gameData[nextId] = {
            name: name,
            desc: desc, 
            player1:  null, 
            player2:  null,
            audience: []
        }
        nextId+= 1;

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
    // player1: player socket,
    // player2: player socket,
    // audience: player sockets
// }



//socket server

var io = require('socket.io').listen(8888);


io.sockets.on("connection",function(socket){
  socket.on("thisArena",function(data){
    gameData[data.roomid]["audience"].push(socket);
    socket.on("sendChat",function(chatData){
        gameData[data.roomid]["audience"].forEach(function(s){
            s.emit("newChat",chatData);
        });
    });
  });
  socket.emit("whatArena",{});
});


