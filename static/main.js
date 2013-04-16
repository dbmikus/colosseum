// Main Javascript file

var appName = 'colosseum';
var storagePrefix = appName + '-';
window.user = {};


// from: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

function getLocal(key) {
    if (typeof(localStorage) !== 'undefined') {
        return JSON.parse(localStorage[storagePrefix + key]);
    }
    else {
        return null;
    }
}

function setLocal(key, val) {
    if (typeof(localStorage) !== 'undefined') {
        localStorage[storagePrefix + key] = JSON.stringify(val);
        console.log(JSON.parse(localStorage[storagePrefix + key]));
    }
}

// Returns true if logged in.
// returns false if not logged in.
// Should also check cookie against server, somehow
function isLoggedIn() {
    var uc = getLocal('usercookie');
    if (uc !== '') {
        console.log(uc);
        console.log(uc.username);
        // check hash against server, here
        return true;
    }
    else {
        return false;
    }
}

function setUserLi() {
    var li = $('#user_li');

    if (isLoggedIn()) {
        var link = $('<a/>');
        link.attr('href', 'usersettings.html');
        link.append('User Settings');

        li.append(link);
    }
    else {
        var bttn = $('<button/>');
        bttn.attr('type', 'button');
        bttn.append('Login');

        bttn.click(loginPopup);

        li.append(bttn);
    }

    console.log('setting user LI');
}

function loginPopup(showPopup) {
    var pane = $('#loginPane');

    if (showPopup) {
        pane.css('visibility', 'visible');
        pane.css('margin-top', String(-pane.height()) + 'px');
        pane.css('margin-left', String(-pane.width()) + 'px');
    }
    else {
        pane.css('visibility', 'hidden');
    }
}

function main() {
    setUserLi();
}

$(document).ready(main);
