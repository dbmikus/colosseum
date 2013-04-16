var arenalist = [];



$.ajax({
    type: "get",
    url: "/arenalist",
    success: function(data) {
        arenalist = data.arenalist;
        refreshDOM();
    }
});



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
                arenalist = data.arenalist
                refreshDOM();
            }
        }
    });
    $("#name-input").val("");
    $("#desc-input").val("")
}

function refreshDOM(){
    $("#wrapper").html("");
    arenalist.forEach(function(arena){
        var link = $("<a>")
        link.addClass("room-link");
        link.attr("href","/arena.html?id="+ arena.id);
        link.append(arena.name);
        link.append("<br>");
        $("#wrapper").prepend(link);
    })
}
