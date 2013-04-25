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
        console.log(key);

        var arena = arenalist[key];
        var link = $("<a>")
        link.addClass("room-link");
        link.attr("href","/arena?id="+ arena.id);
        link.append(arena.name);

        var li = $('<li>');
        li.append(link);

        // This makes the arenas appear sorted with the most recently created at
        // the top
        arena_ul.prepend(li);
    }
}


$(document).ready(refreshList);
