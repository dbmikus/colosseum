function setup(io) {
  io.sockets.on('connection', function (socket) {
    console.log('CREATING webrtc socket stuff');

    // When we recieve a message, just bounce it to all other clients
    socket.on('message', function (data) {
      socket.broadcast.emit('message', data);
    });
  });
}


module.exports.setup = setup;
