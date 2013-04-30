function setup(app, io, roomsockets) {
  // Holds a map from each socket id to that socket
  var socketMap = {};
  var totalSockets = Object.keys(roomsockets).length;
  var clientTypes = { competitors: [], spectators: [] };
  var responsesRecorded = 0;

  Object.keys(roomsockets).forEach(function (key) {
    var socket = roomsockets[key];
    socketMap[socket.id] = socket;

    // When we recieve a message, just bounce it to all other clients
    socket.on('webrtcMessage', function (data) {
      socket.broadcast.emit('webrtcMessage', data);
    });

    // Each socket responds to a request for client type.
    // When we have received a response from each client, construct a graph and
    // send it back to every socket
    socket.on('webrtcSendType', function (data) {
      responsesRecorded += 1;
      console.log('RECORDS! total: ' + totalSockets + ', responses: ' + responsesRecorded);
      if (data.clientType === 'competitor') {
        clientTypes.competitors.push({ myID: data.clientID,
                                       mySocket: socket });
      } else if (data.clientType === 'spectator') {
        clientTypes.spectators.push({ myID: data.clientID,
                                      mySocket: socket });
      }
      if (responsesRecorded === totalSockets) {
        var graph = makePeerGraph(clientTypes);
        // Send a message to each socket to start call between sender and
        // receiver
        for (var sendID in graph) {
          var socketList = graph[sendID];
          socketList.forEach(function (sock) {
            sock.emit('webrtcCall', {
              fromID: sendID,
              toID: sock.id,
              isCaller: true,
              displayStream: true
            });
          });
        }
      }
    });
  });


  // Counts how many players we have so far.
  // If we have more than 2, throw an error.
  // If we have two players, request the client types of each client:
  //   either "competitor" or "spectator"
  // Then, using this info construct a graph where:
  //   each competitor connects to every other client
  //   each spectator connects to all competitors
  var numPlayers = 0;
  app.post('/webrtcPlayerSelect', function (req, res) {
    if (req.body.player === '1' || req.body.player === '2') {
      numPlayers += 1;
      if (numPlayers > 2) {
        console.log('Too many players.');
        res.send(500, { error: 'Too many players.' });
      } else if (numPlayers === 2){
        numPlayers = 0;
        // Request all player types along with player ids.
        // This will be used to construct a peer graph
        for (var key in socketMap) {
          // io.sockets.emit('webrtcRequestTypes', {});
          sckt = socketMap[key];
          sckt.emit('webrtcRequestTypes', {});
        }
        res.send('Reached player requirement. Requesting client types.');
      }
    }
    else {
      console.log('Wrong player number');
      res.send(500, { error: 'Wrong player number.' });
    }
  });

  // TODO listen for clients (spectators) joining late

  function addSocket(socketid, socket) {
    socketMap[socketid] = socket;
    totalSockets += 1;
  }

  function deleteSocket(socketid) {
    try {
      delete socketMap[socketid];
      totalSockets -= 1;
    } catch (e) {
      // do nothing, cause it ain't there
    }
  }

  return ({
    addSocket: addSocket,
    deleteSocket: deleteSocket
  });
}

// clientTypes : {
//   competitors : client ID list,
//   spectators  : client ID list
// }
//
// Returns:
//   Map from socket ids to a list of sockets that are edges
function makePeerGraph(clientTypes) {
  console.log('MAKING PEER GRAPH');
  var clientGraph = {};

  // We must adjust start point since 1st competitor connects to 2nd, 3rd, etc.
  // 2nd connects to 3rd, etc...
  var startPoint = 1;
  var competitors = clientTypes.competitors;
  var spectators = clientTypes.spectators;
  var complen = competitors.length;
  for (startPoint = 1; startPoint < complen; startPoint++) {
    var clientEdges = [];
    // connect current competitor to all subsequent competitors
    for (var i = startPoint; i < complen; i++) {
      clientEdges.push(competitors[i].mySocket);
    }
    // Add an edge to every spectator
    spectators.forEach(function (spec) {
      clientEdges.push(spec.mySocket);
    });
    // Put the edge list into the total list
    clientGraph[competitors[startPoint-1].myID] = clientEdges;
  }

  return clientGraph;
}


module.exports.setup = setup;
module.exports.makePeerGraph = makePeerGraph;
