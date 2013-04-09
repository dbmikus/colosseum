(function () {

    var pc1, pc2;
    var localstream;
    var sdpConstraints = {'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
    }};

    function gotStream (stream) {
        trace("Received local stream");
    }

})();
