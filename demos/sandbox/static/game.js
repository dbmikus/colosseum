    $.ajax({
            type: "get",
            url: "",
            data: {'sendSubRooms': saveFormatRooms(subrooms),
                   'sendFurniture': saveFormatFurniture(furniture)},
            success: function(data) {
                $("#saveNotification").html('Saved as "'+ saveName+'"!');
                $("#loadNotification").html('');
                $("#save-input").val("");
            }
    });