var express = require('express');
var app = express();

app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

app.listen(9876);

// ========================
// === Socket.io server ===
// ========================

var io = require.('socket.io').listen(9889);
io.sockets.on('connection', function (socket) {
    socket.on('msg', function (data) {
        // confirm success to sender
        socket.emit('status', { success: 'true' });
        // broadcast message to everyone else
        io.sockets.emit('newmsg', { body: data.body });
    });
});
