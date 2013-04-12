$.ajax({
    type: "get",
    url: "/arenalist",
    success: function(data) {
        console.log(data);
        data.arenalist.forEach(function(arena){
            var link = $("<a>")
            link.addClass("room-link");
            link.attr("href","/arena.html?id="+ arena.id);
            link.append(arena.name);
            link.append("<br>");
            $("#wrapper").prepend(link);
        })
    }
});
