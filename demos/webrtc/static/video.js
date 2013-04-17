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

// This line below uses a fake generic signaling channel:
//   var signalingChannel = createSignalingChannel();
var socket = io.connect('http://localhost:8888');

var pc;
var selfView = document.getElementById('selfView');
var remoteView = document.getElementById('remoteView');
var callButton = document.getElementById('callButton');
callButton.addEventListener('click', function (event) {
    start(true);
}, false);

// This line below is configuration passed to RTCPeerConnection that includes
// ICE servers
//   var configuration = ...;
var configuration = { 'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

// run start(true) to initiate a call
function start(isCaller) {
    pc = new RTCPeerConnection(configuration);

    // send any ice candidates to the other peer
    // run when network candidates become available
    pc.onicecandidate = function (evt) {
        // send candidate data to peer via communication method
        // (WebSocket, Socket.io, etc.)
        // When peer receives this message, he calls addIceCandidate
        // The line below uses generic signaling channel
        //   signalingChannel.send(JSON.stringify({ "candidate": evt.candidate }));
        socket.emit('message', { "candidate": evt.candidate });
    };

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = function (evt) {
        remoteView.src = URL.createObjectURL(evt.stream);
    };

    // get the local stream, show it in the local video element, and send it
    navigator.getUserMedia(
        { "audio": true, "video": true },
        // success on getting user media stream
        function (stream) {
            selfView.src = URL.createObjectURL(stream);
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
                socket.emit('message', { "sdp": desc });
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
socket.on('message', function (evt) {
    // If we recieve the message and have not yet initialized pc, then we are
    // the receiver of a call
    if (!pc) {
        start(false);
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
