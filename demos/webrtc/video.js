// Global namespace object for webrtc related functions and values
var webrtc = (function () {

// Namespace of objects to export to window.webrtc
var webrtc = {};

window.stream = null;

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

// TODO this shit is totally incomplete
webrtc.createPeerConnection = function (servers, stream) {
    // servers is an optional config file (see TURN and STUN discussion below)

    // Caller pc1 is local peer
    var pc1 = new RTCPeerConnection(servers);
    // ...
    pc1.addStream(stream);

    // Callee pc2 is remote peer
    var pc2 = new RTCPeerConnection(servers);

    function gotRemoteStream (e) {
        vid2.src = URL.createObjectURL(e.stream);
    }

    pc2.onaddstream = gotRemoteStream;

    function gotDescription1 (desc) {
        pc1.setLocalDescription(desc);
        trace("Offer from pc1 \n" + desc.sdp);
        pc2.setRemoteDescription(desc);
        pc2.createAnswer(gotDescription2);
    }

    pc1.createOffer(gotDescription1);
}

var video = document.getElementById("webcam");
var photo = document.getElementById('photo');
var feed = document.getElementById('feed');
var feedContext = feed.getContext('2d');
var display = document.getElementById('display');
var displayContext = display.getContext('2d');

// Function called after successfully getting user media
// The argument is the stream obtained
function getUserMediaSuccess (stream) {
    window.stream = stream;

    // Getting audio context and adding it to video stream
    // To use Web Audio Input, you must go to chrome://flags and enable it
    var audioContext = new AudioContext();
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(audioContext.destination);

    // This is the same as the code from adapter.js:
    // attachMediaStream(video, stream);
	video.src = window.webkitURL.createObjectURL(stream);

    // Setting up the initial drawing of video to canvas
    display.width = 320;
    feed.width = display.width;
    display.height = 240;
    feed.height = display.height;
    streamFeed();
}

function getUserMediaError (err) {
	console.log("Your thing is not a thing.");
}

webrtc.showVideo = function() {
	navigator.getUserMedia(
        // Streams to enable
        {
            video: true,
            //audio: true
        },
        getUserMediaSuccess,
        getUserMediaError
	);
}

// Takes a photo from the video stream and draws it to the canvas given
webrtc.takePhoto = function () {
    var context = photo.getContext('2d');

    var scaleFactor = 3/4;

    photo.width = video.width * scaleFactor;
    photo.height = video.height * scaleFactor;
    // photo.width = video.width;
    // photo.height = video.height;

    context.drawImage(display, 0, 0, photo.width, photo.height);
}

var photoButton = document.getElementById('takePhoto');
photoButton.addEventListener('click', webrtc.takePhoto, false);


function addEffects(data) {
    var len = data.length;

    // Increment by 4 since we deal with blocks of (r,g,b,a)
    for (var i=0; i < len; i += 4) {
        var gray = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = gray;
        data[i+1] = gray;
        data[i+2] = gray;
    }

    return data;
}

function streamFeed () {
    // Waits a small delay and then requests the animation frame from the feed
    requestAnimationFrame(streamFeed);
    // Draw it to the feed canvas first
    feedContext.drawImage(video, 0, 0, display.width, display.height);

    // Get the image data from the feed canvas
    // getImageData(left, top, width, height)
    var imageData = feedContext.getImageData(0, 0, display.width, display.height);
    imageData.data = addEffects(imageData.data);

    // Put the image data from the feed canvas on the display
    // putImageData(data, left, top)
    displayContext.putImageData(imageData, 0, 0);
}

return webrtc;

})();
