function isAndroid(){
    return navigator.userAgent.indexOf("Android") !== -1;
}

function isIOS(){
   return  !!(navigator.userAgent.match(/iPhone/i) ||
           navigator.userAgent.match(/iPod/i) ||
           navigator.userAgent.match(/iPad/i));
}

function isMobile () {
    return isAndroid() || isIOS();
}

function isWindows () {
    return navigator.platform.indexOf("Win") !== -1;
}

function isLinux () {
    return navigator.platform.indexOf("Linux") !== -1;
}

function isMac () {
    return navigator.platform.indexOf("Mac") !== -1;
}

function getPlatform () {
    var platform = "";

    if (isAndroid()) {
        platform = "Android";
    } else if (isIOS()) {
        platform = "iOS";
    } else if (isWindows()) {
        platform = "Windows";
    } else if (isLinux()) {
        platform = "Linux";
    } else if (isMac()) {
        platform = "Mac";
    } else {
        platform = "Other";
    }

    return platform;
}
