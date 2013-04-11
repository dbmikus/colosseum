var pc1, pc2;
var localstream;
var sdpConstraints = {'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
}};

function gotStream (stream) {
    trace("Received local stream");
    // Call the polyfill wrapper to attach the media stream to this element
    attachMediaStream(vid1, stream);
    localstream = stream;
}

function start () {
    trace("Requesting local stream");
    // Call into getUserMedia via the polyfill (adapter.js)
    getUserMedia({audio: true,
                  video: true},
                 gotStream,
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
    var servers = null;
    pc1 = new RTCPeerConnection(servers);
    trace("Created local peer connection object pc1.");
    pc1.onicecandidate = iceCallback1;
    pc2 = new RTCPeerConnection(servers);
    trace("Created remote peer connection object pc2.");
    pc2.onicecandidate = iceCallback2;
    pc2.onaddstream = gotRemoteStream;

    // Adding the video stream to the peer connection
    pc1.addStream(localstream);
    trace("Adding Loal Stream to peer connection.");

    pc1.createOffer(gotDescription1);
}


function gotDescription1(desc) {
    pc1.setLocalDescription(desc);
    trace("Offer from pc1\n" + desc.sdp);
    pc2.setRemoteDescription(desc);
    // Since the "remote" side has no media stream, we need to pass in the
    // right constraints in order for it to accept the incoming offer of
    // audio and video.
    pc2.createAnswer(gotDescription2, null, sdpConstraints);
}

function  gotDescription2(desc) {
    pc2.setLocalDescription(desc);
    trace("Answer from pc2\n" + desc.sdp);
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
        pc2.addIceCandidate(new RTCIceCandidate(event.candidate));
        trace("Local ICE candidate:\n" + event.candidate.candidate);
    }
}

function iceCallback2 (event) {
    if (event.candidate) {
        pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
        trace("Remote ICE candidate:\n" + event.candidate.candidate);
    }
}
