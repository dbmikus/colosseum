var socket = io.connect('http://localhost:9889');

// $('#chatform').submit(function () {
//     // send the msg event, with some data
//     socket.emit('msg', { body: $('#chatbody').val(); });
//     return false;
// });

// socket.on("status", function (data) {
//     if (data.success) {
//         alert("Message successfully sent.");
//     } else {
//         alert('Message failed to send.');
//     }
// });

var started = false;
var localstream = null;
var localvid = null;
var remotevide = null;

function createPeerConnection () {
    var servers = "STUN stun.l.google.com:19302";
    try {
        peerConn = new RTCPeerConnection(servers, function (message) {
            socket.emit('message', message);
        });
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
    }
    peerConn.addEventListener('addstream', onRemoteStreamAdded, false);
    peerConn.addEventListener('removestream', onRemoteStreamRemoved, false);
}

function onRemoteStreamAdded (event) {
    trace('Added remote stream.');
    remotevid.src = webkitURL.createObjectURL(event.stream);
}

function onRemoteStreamRemoved (event) {
    trace("Removed remote stream.");
    remotevid.src = '';
}

// start the connection upon user request
function connect () {
    if (!started && localstream) {
        createPeerConnection();
        trace('Adding local stream...');
        peerConn.addStream(localstream);
        started = true;
    } else {
        trace('Local stream not running yet.');
    }
}

// accept connection request
socket.on('message', onMessage);
function onMessage (event) {
    trace('RECEIVED: ' + event.data);
    if (!started) {
        createPeerConnection();
    }
}

// Old shit

var pc1, pc2;
var localstream;
var sdpConstraints = {'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
}};

function start () {
    trace("Requesting local stream");
    // Call into getUserMedia via the polyfill (adapter.js)
    getUserMedia({audio: true,
                  video: true},
                 function (stream) {
                     trace("Received local stream");
                     // Call the polyfill wrapper to attach the media stream to
                     // this element
                     attachMediaStream(vid1, stream);
                     localstream = stream;
                 },
                 function (err) { alert('Error getting user media.'); });
}

function call () {
    trace("Starting call.");
    console.log(localstream);
    var videoTracks = localstream.getVideoTracks();
    var audioTracks = localstream.getAudioTracks();
    if (videoTracks.length > 0) {
        trace('Using Video device: ' + videoTracks[0].label);
    }
    if (audioTracks.length > 0) {
        trace('Using Audio device: ' + audioTracks[0].label);
    }
    var servers = "STUN stun.l.google.com:19302";
    pc1 = new RTCPeerConnection(servers, iceCallback1);
    trace("Created local peer connection object pc1.");
//    pc1.onicecandidate = iceCallback1;
    pc2 = new RTCPeerConnection(servers, iceCallback2);
    trace("Created remote peer connection object pc2.");
//    pc2.onicecandidate = iceCallback2;
    pc2.onaddstream = gotRemoteStream;

    // Adding the video stream to the peer connection
    pc1.addStream(localstream);
    trace("Adding Loal Stream to peer connection.");

    pc1.createOffer(gotDescription1);
}


function gotDescription1(desc) {
    pc1.setLocalDescription(desc);
//    trace("Offer from pc1\n" + desc.sdp);
    pc2.setRemoteDescription(desc);
    // Since the "remote" side has no media stream, we need to pass in the
    // right constraints in order for it to accept the incoming offer of
    // audio and video.
    pc2.createAnswer(gotDescription2, null, sdpConstraints);
}

function gotDescription2(desc) {
    pc2.setLocalDescription(desc);
//    trace("Answer from pc2\n" + desc.sdp);
    // I think that we won't have access to this here
    pc1.setRemoteDescription(desc);
}

function hangup () {
    trace("Ending call.");
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;
}

function gotRemoteStream (e) {
    vid2.src = webkitURL.createObjectURL(e.stream);
    trace("Received remote stream.");
}

function iceCallback1 (event) {
    if (event.candidate) {
        console.log('\n== iceCallback1 ==\n');
        console.log('FUCKFUCKFUCKFUCK');
        console.log(event);
        pc2.addIceCandidate(new RTCIceCandidate(event.candidate));
        trace("Local ICE candidate:\n" + event.candidate.candidate);
    }
}

function iceCallback2 (event) {
    if (event.candidate) {
        console.log('\n== iceCallback2 ==\n');
        console.log('FUCKFUCKFUCKFUCK');
        console.log(event);
        pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
        trace("Remote ICE candidate:\n" + event.candidate.candidate);
    }
}
