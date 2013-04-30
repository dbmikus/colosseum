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

    for (var key in arenalist) {
        // TODO this is how the server should store data in each arenalist
        // element
        var arena = arenalist[key];

        // This makes the arenas appear sorted with the most recently created at
        // the top
      console.log('AAAAREEENAANAAAAAANA!');
      console.log(arena);
        arena_ul.prepend(makeArenaItem(arena.id,
                                       arena.p1,
                                       arena.p2,
                                       arena.name,
                                       arena.population));
    }
}

function makeArenaItem(id, player1, player2, name, numSpectators) {
    if (numSpectators === undefined) {
        numSpectators = 0;
    }

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
    viewers.attr('class', 'viewers');
    viewers.append(String(numSpectators) + ' spectators');

    var vs = $('<div>');
    vs.append('vs');

    li.append(name);
    li.append(p1);
    li.append(p2);
    li.append(viewers);
    li.append(vs);
    li.click(function () {
        window.location.href = "/arena?id=" + String(id);
    });

    return li;
}

function makePlayerMobile(player, playerNum) {
    if (player === undefined) {
        if (playerNum === 1) {
            player = 'King';
        } else if (playerNum === 2) {
            player = 'Challenger';
        }
    }

    var pdiv = $('<div>');
    pdiv.attr('class', 'player' + String(playerNum));
    var ppar = $('<p>');
    ppar.attr('class', 'name' + String(playerNum));
    ppar.append(player);
    pdiv.append(ppar);

    return pdiv;
}

function makeArenaItemDesktop(id, player1, player2, name, numSpectators) {

    console.log("NAME: ", name);

    var li = $('<li>');

    var link = $("<a>");
    link.addClass("room-link");
    link.attr("href", "/arena?id=" + id);
    link.append(li);
	li.html(name);
    var user1 = $('<div>').addClass('listPlayer1');
	var user2 = $('<div>').addClass('listPlayer2');
	var player1Name = $('<p>').html(player1);
	player1Name.addClass('listName1')
	var player2Name	= $('<p>').html(player2);
	player2Name.addClass('listName2')
	user1.append(player1Name);
	user2.append (player2Name);
	li.append(user1);
	li.append(user2);
    var versus = $('<div>').addClass('listVersus');
    li.append(versus.html('vs'));
	var viewers = $('<div>').addClass('listViewers');
	li.append(viewers.html(numSpectators+" participants"));


    return link;
}


$(document).ready(refreshList);
