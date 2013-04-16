var arenalist = {};




function createRoom(){
    $.ajax({
        type: "post",
        data: {
            name: $("#name-input").val(),
            desc: $("#desc-input").val()
        },
        url: "/arena",
        success: function(data) {
            if(data.success){
                refreshList();
            }
        }
    });
    $("#name-input").val("");
    $("#desc-input").val("")
}


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
    $("#wrapper").html("");
    for (var key in arenalist){
        var arena = arenalist[key]
        var link = $("<a>")
        link.addClass("room-link");
        link.attr("href","/arena?id="+ arena.id);
        link.append(arena.name);
        link.append("<br>");
        $("#wrapper").prepend(link);
    }
}


$(document).ready(refreshList);