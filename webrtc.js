// Holds a map from each socket id to that socket
var socketMap = {};

function setup(app, io) {

  // Keep track of total sockets connected so that we know when every client has
  // responded to total requests
  var totalSockets = 0;
  var clientTypes = { competitors: [], spectators: [] };
  var responsesRecorded = 0;

  io.sockets.on('connection', function (socket) {
    totalSockets += 1;

    // When we recieve a message, just bounce it to all other clients
    socket.on('webrtcMessage', function (data) {
      socket.broadcast.emit('webrtcMessage', data);
    });


    // Each socket responds to a request for client type.
    // When we have received a response from each client, construct a graph and
    // send it back to every socket
    socket.on('webrtcSendType', function (data) {
      responsesRecorded += 1;
      socketMap[socket.id] = socket;
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

    // TODO listen for clients (spectators) joining late
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
    if (req.body.player === 1 || req.body.player === 2) {
      numPlayers += 1;
      if (numPlayers > 2) {
        res.send(500, { error: 'Too many players.' });
      } else if (numPlayers === 2){
        // Request all player types along with player ids.
        // This will be used to construct a peer graph
        io.sockets.emit('webrtcRequestTypes', {});
        res.send('Reached player requirement. Requesting client types.');
      }
    }
    else {
      res.send(500, { error: 'Wrong player number.' });
    }
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
