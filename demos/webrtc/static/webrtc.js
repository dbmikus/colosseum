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
