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

var userID = 'offerer'; // unique ID to identify this user
var foundParticipant = false;

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
    // Don't get his own messages
    if (response.userID === userID) retun;

    // if participant found
    if (response.participant) {
        foundParticipant = true;

        // create offer and send him offer sdp
        createOffer();
    }

    // answer sdp sent to you, complete handshake
    if (response.firstPart || response.secondPart) {
        processAnswerSDP(response);
    }
}

var peer;

function createOffer () {
    peer = RTCPeerConnection({
        onOfferSDP : sendOfferSDP,

        onICE: function (candidate) {
            socket && socket.send({
                userID: userID,
                candidate: {
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: JSON.stringify(candidate.candidate)
                }
            });
        },

        onRemoteStream: function (stream) {
            if (stream) video.src = URL.createObjectURL(stream);
        },

        attachStream: clientStream
    });
}

// send offer sdp
function sendOfferSDP (sdp) {
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
            peer.addAnswerSDP(fullSDP);
        }
    }
}
