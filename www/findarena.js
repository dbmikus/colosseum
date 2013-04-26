var arenalist = {};

function refreshList(){
    $.ajax({
    type: "get",
    url: "/arenalist",
    success: function(data) {
        arenalist = data;
        refreshDOM();
    }
});

}

function refreshDOM(){
    var arena_ul = $('#arenalist');
    // Clear the HTML in the list so we can repopulate it
    arena_ul.html('');

    for (key in arenalist) {
        // TODO this is how the server should store data in each arenalist
        // element
        var arena = arenalist[key];

        // This makes the arenas appear sorted with the most recently created at
        // the top
        arena_ul.prepend(makeArenaItem(arena.id,
                                       arena.player1,
                                       arena.player2,
                                       arena.name,
                                       arena.spectators));
    }
}

function makeArenaItem(id, player1, player2, name, numSpectators) {
    if (isMobile()) {
        return makeArenaItemMobile(id, player1, player2, name, numSpectators);
    } else {
        return makeArenaItemDesktop(id, player1, player2, name, numSpectators);
    }
}

function makeArenaItemMobile(id, player1, player2, name, numSpectators) {
    var li = $('<li>');

    var p1 = makePlayerMobile(player1, 1);
    var p2 = makePlayerMobile(player2, 2);

    var viewers = $('<div>');
    viewers.html('class', 'viewers');
    viewers.append(String(numSpectators) + ' spectators');

    var vs = $('<div>');
    vs.append('vs');

    li.append(p1);
    li.append(p2);
    li.append(viewers);
    li.append(vs);

    return li;
}

function makePlayerMobile(player, playerNum) {
    var pdiv = $('<div>');
    pdiv.html('class', 'player' + String(playerNum));
    var ppar = $('<p>');
    ppar.html('class', 'name' + String(playerNum));
    pdiv.append(ppar);

    return pdiv;
}

function makeArenaItemDesktop(id, player1, player2, name, numSpectators) {
    // var p1 = players[0];
    // var p2 = players[1];
    // var num_viewers = spectators.length;

    console.log("NAME: ", name);

    var li = $('<li>');

    var link = $("<a>");
    link.addClass("room-link");
    link.attr("href", "/arena?id=" + id);
    link.append(name);
    li.append(link);

    return li;
}


$(document).ready(refreshList);
