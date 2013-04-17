var express = require('express');
var app = express();

app.use(expres.bodyParser());
app.use(express.cookieParser());

app.listen(9999);

app.get('/', function (req, res) {
    res.sendfile('static/index.html');
});

// ========================
// === Socket.io server ===
// ========================

var io = require.('socket.io').listen(8888);

io.sockets.on('connection', function (socket) {
    // When we recieve a message, just bounce it to all other clients
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
