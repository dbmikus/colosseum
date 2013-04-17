// START COMMENT CODE
/*
var offerPeer = RTCPeerConnection({
    // client stream that you need to share with other peer
    attachStream   : clientStream,
    // it returns localy generated ICE so you can share them with the other end
    onICE          : function (candidate) {
        // candidate object contains two properties:
        // 1. candidate.sdpMLineIndex
        // 2. candidate.candidate
        peer.addICE({sdpMLineIndex : candidate.sdpMLineIndex,
                     candidate     : candidate.candidate});
    },
    // returns remote stream attached by other peer
    onRemoteStream : function (stream) {},
    // returns offer sdp so you can send it to other peer to get answer sdp
    onOfferSDP     : function (sdp) {
        peer.addAnswerSDP(sdp);
    }
});

var answerPeer = RTCPeerConnection({
    attachStream : clientStream,
    onICE : function (candidate) {
        peer.addICE({
            sdpMLineIndex : candidate.sdpMLineIndex,
            candidate     : candidate.candidate
        });
    },
    onRemoteStream : function (stream) {},
    // you need to pass offer sdp sent by other peet
    offerSDP : offer_sdp,
    // returns answer sdp so you can send it to other end
    onAnswerSDP : function (sdp) {}
});
*/
// END COMMENT CODE

//////////////////////////////////////////////////////////////////////

// offerer stuff

var socket = io.connect('http://localhost:9889');

socket.on('connect', onconnect);
socket.on('message', oncallback);

// socket is opened: it is your time to transmit request!
function onconnect () {
    transmitRequest();
}


var userID = 'answerer'; // unique ID to identify this user

// on the answerer side, when user clicks a "join" button, send a message
// offerer to tell him that you're ready to get "offer sdp" from him
// maybe this should periodically send on a timeout?
function sendJoin () {
    socket && socket.send({
        participant: true,
        userID: userID
    });
}

function transmitRequest () {
    socket.send({
        userID : userID,
        type   : 'request to join'
    });

    // Transmit "join request" until participant found
    !foundParticipant && setTimeout(transmitRequest, 1000);
}

// got response
function oncallback (response) {
    if (response.userID === userID) return;

    // you can show a "join" button or you can send participant request
    if (response.type && response.type === 'request to join') {}

    // offer sdp sent to you by offerer
    if (response.firstPart || response.secondPart) {
        processAnswerSDP(response);
    }
}

var peer;

function createAnswer(offer_sdp) {
    peer = RTCPeerConnection({
        offerSDP: offer_sdp,
        onAnswerSDP: sendAnswerSDP,
        onICE: onICE,
        onRemoteStream: onRemoteStream,
        attachStream: clientStream
    });
}

// send offer sdp
function sendAnswerSDP (sdp) {
    var sdp = JSON.stringify(sdp);

    // because sdp size is larger than what pubnub supports for single request...
    // that's why it is split into two parts
    var firstPart = sdp.substr(0, 700);
    var secondPart = sdp.substr(701, sdp.length - 1);

    // transmitting first sdp part
    socket.send({
        userID: userID,
        firstPart: firstPart
    });

    socket.send({
        userID: userID,
        secondPart: secondPart
    });
}

var answerSDP = {};

// got answer sdp, process it
function processAnswerSDP (response) {
    if (response.firstPart) {
        answerSDP.firstPart = response.firstPart;
        if (answerSDP.secondPart) {
            var fullSDP = JSON.parse(answerSDP.firstPart + answerSDP.secondPart);
            createAnswer(fullSDP);
        }
    }
}
