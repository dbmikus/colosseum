function setup(io) {
  io.sockets.on('connection', function (socket) {
    // When we recieve a message, just bounce it to all other clients
    socket.on('message', function (data) {
      socket.broadcast.emit('webrtcMessage', data);
    });
  });
}


module.exports.setup = setup;
