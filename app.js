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
                    res.send(result); 
// NOTE: direct access to the database is a bad idea in a real app
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
            player1:  null, 
            player2:  null,
            audience: {}
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
    // player1: player secretKey,
    // player2: player secretKey,
    // audience: player sockets
// }



//socket server

var io = require('socket.io').listen(8888);


io.sockets.on("connection",function(socket){
  socket.on("thisArena",function(data){
    if(gameData[data.roomid]){
        var secretKey = createSecretKey();
        gameData[data.roomid]["audience"][secretKey]=socket;
        socket.emit("arenaInfo",
        {
           roomSpecs: arenalist[data.roomid],
           secretKey: secretKey
        });
        socket.on("sendChat",function(chatData){
            for(var s in gameData[data.roomid]["audience"]){
                gameData[data.roomid]["audience"][s].emit("newChat",chatData);
            }
        });
    }
  });
  socket.emit("whatArena",{});
});



// from 
//http://stackoverflow.com/questions/1349404/
// generate-a-string-of-5-random-characters-in-javascript
function createSecretKey(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}