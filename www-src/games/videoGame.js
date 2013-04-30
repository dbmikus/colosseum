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

var isStreaming = false;

socket.emit('setUp', {
  roomid: urlParams.id,
  secretKey: urlParams.s
});

socket.on('selectedAsPlayer', function (data) {
  console.log('You are selected as a player');
  console.log(data);
  if (!isStreaming && data.player === 1) {
    isStreaming = true;
    startCall(true);
  }
});

socket.on('newGame', function (data) {
});

socket.on('movemade', function (data) {
  console.log("made a move, but we don't do anything.");
});


// TODO change this to actually work
function sendchat(){
  socket.emit("move",
              {
                moveData:{
                  msg: $("#chat-input").val()
                },
                roomid: urlParams.id,
                secretKey: urlParams.s
              });
  $("#chat-input").val("");
}

// end API requirements //


/////////////////////////////////////
// This is the actual webrtc stuff //
/////////////////////////////////////

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
var video1 = document.getElementById('video1');
var video2 = document.getElementById('video2');
var callButton = document.getElementById('callButton');


// This line below is configuration passed to RTCPeerConnection that includes
// ICE servers
//   var configuration = ...;
var configuration = { 'iceServers': [{'url': 'stun:stun.l.google.com:19302'}] };

// run startCall(true) to initiate a call
function startCall(isCaller) {
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
    video2.src = URL.createObjectURL(evt.stream);
  };

  // get the local stream, show it in the local video element, and send it
  navigator.getUserMedia(
    { "audio": true, "video": true },
    // success on getting user media stream
    function (stream) {
      video1.src = URL.createObjectURL(stream);
      pc.addStream(stream);

      if (isCaller) {
        // create SDP offer and send it over signaling channel
        pc.createOffer(gotDescription);
      } else {
        // create an answer and send it over the signaling channel
        pc.createAnswer(gotDescription);
      }

      // Peers need to ascertain and exchange local and remote audio and
      // video media information. This is done by exchanging an "offer"
      // and an "answer" using Session Description Protocol (SDP)
      function gotDescription (desc) {
        pc.setLocalDescription(desc);
        // The line below uses generic signaling channel
        //   signalingChannel.send(JSON.stringify({ "sdp": desc }));
        socket.emit('webrtcMessage', { "sdp": desc });
      }
    },
    // error on getting user media stream
    function (error) {
      console.log("Error getting user media: ", error);
    }
  );
}

// When peer receives ICE candidate message sent from onicecandidate handler,
// he calls addIceCandidate in this function
// The line below uses generic signaling channel
//   signalingChannel.onmessage = function (evt) {
socket.on('webrtcMessage', function (evt) {
  console.log('Received a webrtc message');

  // If we recieve the message and have not yet initialized pc, then we are
  // the receiver of a call
  if (!pc) {
    startCall(false);
  }

  // Socket.io automatically stringifies and parses JSON for us
  // var signal = JSON.parse(evt.data);
  var signal = evt;
  console.log('signal: ', signal);
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
