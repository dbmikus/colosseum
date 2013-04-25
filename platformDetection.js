function getUA(req) {
    return req.header('user-agent');
}

function isAndroid(req) {
    return getUA(req).indexOf("Android") !== -1;
}

function isIOS(req) {
   return  !!(getUA(req).match(/iPhone/i) ||
              getUA(req).match(/iPod/i) ||
              getUA(req).match(/iPad/i));
}

function isMobile (req) {
    return isAndroid(req) || isIOS(req);
}

// The functions to detect desktop platform depended on navigator.platform

function getPlatform () {
    var platform = "";

    if (isAndroid()) {
        platform = "Android";
    } else if (isIOS()) {
        platform = "iOS";
    } else {
        platform = "Other";
    }

    return platform;
}

module.exports.getUA       = getUA;
module.exports.isAndroid   = isAndroid;
module.exports.isIOS       = isIOS;
module.exports.isMobile    = isMobile;
module.exports.getPlatform = getPlatform;
