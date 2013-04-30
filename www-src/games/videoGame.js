(window.onpopstate = function () {
  var match,
  pl     = /\+/g,  // Regex for replacing addition symbol with a space
  search = /([^&=]+)=?([^&]*)/g,
  decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
  query  = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query)) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
})();

// This line is modified by Mustache
var socket = io.connect("{{{host}}}");


// API requirements //

// Making sure WebRTC stuff is consistent in namespace regardless of browser
if (navigator.getUserMedia === undefined) {
  navigator.getUserMedia = (navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);
}

if (window.AudioContext === undefined) {
  window.AudioContext = (window.webkitAudioContext ||
                         window.webkitAudioContext);
}

if (window.requestAnimationFrame === undefined) {
  window.requestAnimationFrame = (
    window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      });
}

if (window.RTCPeerConnection === undefined) {
  window.RTCPeerConnection = (
    window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.oRTCPeerConnection ||
      window.msRTCPeerConnection
  );
}

var playerNum;
var isPlayer = false;
var isStreaming = false;

socket.emit('setUp', {
  roomid: urlParams.id,
  secretKey: urlParams.s
});

socket.on('selectedAsPlayer', function (data) {
  // client notifies webrtc handshake server that a player has been selected
  // the webrtc server will send a message back when there are two players
  $.ajax({
    type: 'post',
    url: '/webrtcPlayerSelect',
    data: {player: data.player},
    error: function (jqXHR, textStatus, errorThrown) {
      console.log('Server threw error ' + errorThrown);
    }
  });

  // The player starts a call to other clients.
  // TODO This may be subject to change based on webrtc server changes
  playerNum = data.player;
  console.log('You are selected as a player');
  console.log(data);
  isPlayer = true;
  if (!isStreaming && data.player === 1) {
    isStreaming = true;
    startCall(true, true);
  }
});


// The webrtc server has requested client types to build peer graph
socket.on('webrtcRequestTypes', function (data) {
  var ctype;
  if (isPlayer) ctype = 'competitor';
  else ctype = 'spectator';

  socket.emit('webrtcSendType', {
    clientType: ctype,
    clientID: socket.id
  });
});

socket.on('newGame', function (data) {
});


// Holds a record of stream types and which clients they coorespond to
var streamTypes = {};
// Receives moveData from move emits
socket.on('movemade', function (data) {
  var moveData = data.moveData;
  if (moveData.type === 'streamType') {
    var streamid = moveData.data.id;
    var clientType = moveData.data.clientType;

    streamTypes[streamid] = {type: clientType, player: data.player};
  }
});

// end API requirements //


/////////////////////////////////////
// This is the actual webrtc stuff //
/////////////////////////////////////


// Some documentation about how the process works.
//
// Let Peer1 = Alice and Peer2 = Bob
//
// == How peers exchange network information ==
// 1. Alice creates an `RTCPeerConnection` object with an `onicecandidate`
//    handler
// 2. The handler is run when network candidates become available
// 3. Alice sends serialized candidate data to Bob, via a signaling channel
//    When Bob gets a candidate message from Alice, he calls `addIceCandidate`
//    to add the candidate to the remote peer description
//
//
// == How peers exchange media configuration information ==
// Works by exchanging an "offer" and an "answer" using
// Session Description Protocol (SDP)
//
// 1. Alice runs `RTCPeerConnection` method `createOffer()`. The callback
//    argument of this is passed as an RTCSessionDescription: Alice's local
//    session description
// 2. In the callback described above, Alice sets the local description using
//    `setLocalDescription()` and then sends this session description to Bob via
//    the signaling channel
// 3. Bob sets the description Alice sent him as his remote description
//    (using `setRemoteDescription()`)
// 4. Bob runs the `RTCPeerConnection` method `createAnswer()`, passing it the
//    remote description he got from Alice, so a local session can be generated
//    that is compatible with hers. The `createAnswer()` callback is passed an
//    `RTCSessionDescription`: Bob sets that as the local description and sends
//    it to Alice.
// 5. When Alice gets Bob's session description, she sets that as the remote
//    description with `setRemoteDescription`

var pc;
var videoStream;
// stream id is used to identify clients based on their streams
var streamID;
var video1 = document.getElementById('video1');
var video2 = document.getElementById('video2');
var callButton = document.getElementById('callButton');


// This line below is configuration passed to RTCPeerConnection that includes
// ICE servers
//   var configuration = ...;
var configuration = { 'iceServers': [{'url': 'stun:stun.l.google.com:19302'}] };

// run startCall(true) to initiate a call
function startCall(isCaller, displayStream) {
  pc = new RTCPeerConnection(configuration);

  // send any ice candidates to the other peer
  // run when network candidates become available
  pc.onicecandidate = function (evt) {
    // send candidate data to peer via communication method
    // (WebSocket, Socket.io, etc.)
    // When peer receives this message, he calls addIceCandidate
    // The line below uses generic signaling channel
    //   signalingChannel.send(JSON.stringify({ "candidate": evt.candidate }));
    socket.emit('webrtcMessage', { "candidate": evt.candidate });
  };

  // once remote stream arrives, show it in the remote video element
  pc.onaddstream = function (evt) {
    console.log('EEVVEEEEENT in addstream');
    console.log(evt);
    // the stream id in event
    var sid = evt.stream.id;
    // client type can either be a competitor or spectator
    if (streamTypes[sid].type === 'competitor') {
      video2.src = URL.createObjectURL(evt.stream);
    }
  };


  // Peers need to ascertain and exchange local and remote audio and
  // video media information. This is done by exchanging an "offer"
  // and an "answer" using Session Description Protocol (SDP)
  function gotDescription (desc) {
    pc.setLocalDescription(desc);
    // The line below uses generic signaling channel
    //   signalingChannel.send(JSON.stringify({ "sdp": desc }));
    socket.emit('webrtcMessage', { "sdp": desc });
  }

  // get the local stream, show it in the local video element, and send it
  if (videoStream === undefined) {
    console.log('starting to make a video stream');
    navigator.getUserMedia(
      { "audio": false, "video": true },
      // success on getting user media stream
      function (stream) {
        videoStream = stream;
        console.log('STREEEEAAAAAM');
        console.log(videoStream);
        streamID = videoStream.id;
        // start repeatedly emitting signal type
        streamIDSignal();

        if (displayStream) {
          video1.src = URL.createObjectURL(stream);
        }
        pc.addStream(stream);

        if (isCaller) {
          // create SDP offer and send it over signaling channel
          pc.createOffer(gotDescription);
        } else {
          // create an answer and send it over the signaling channel
          pc.createAnswer(gotDescription);
        }
      },
      // error on getting user media stream
      function (error) {
        console.log("Error getting user media: ", error);
      }
    );
  } else {
    pc.addStream(videoStream);

    if (isCaller) {
      // create SDP offer and send it over signaling channel
      pc.createOffer(gotDescription);
    } else {
      // create an answer and send it over the signaling channel
      pc.createAnswer(gotDescription);
    }
  }
}

// When peer receives ICE candidate message sent from onicecandidate handler,
// he calls addIceCandidate in this function
// The line below uses generic signaling channel
//   signalingChannel.onmessage = function (evt) {
socket.on('webrtcMessage', function (evt) {
  // console.log('Received a webrtc message');

  // If we recieve the message and have not yet initialized pc, then we are
  // the receiver of a call
  if (!pc) {
    startCall(false, isPlayer);
  }

  // Socket.io automatically stringifies and parses JSON for us
  // var signal = JSON.parse(evt.data);
  var signal = evt;
  // console.log('signal: ', signal);
  // If we received an "sdp" message
  if (signal.sdp !== undefined && signal.sdp !== null) {
    pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
  }
  // Otherwise, we received a "candidate" message for ICE
  else if (signal.candidate !== undefined && signal.candidate !== null) {
    pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
  } else {
    console.log('Neither sdp or candidate object defined in channel message.');
  }
});


// Repeatedly send the client stream ID and client type so other users can
// respond to the video type
function streamIDSignal () {
  if (streamID !== undefined) {
    var ctype;
    if (isPlayer) {
      ctype = 'competitor';
    } else {
      ctype = 'spectator';
    }

    socket.emit('move', {
      moveData: {
        type: 'streamType',
        data: {
          id: streamID,
          clientType: ctype
        }
      },
      roomid: urlParams.id,
      secretKey: urlParams.s
    });
  }
  setTimeout(streamIDSignal, 2000);
}
