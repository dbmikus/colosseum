function createRoom(){
    var type = $('input:radio[name=Type]:checked').val();
    if (type ==="custom"){
        type = $("#custom-game-input").val();
    } 
    $.ajax({
        type: "post",
        data: {
            name: $("#name-input").val(),
            desc: $("#desc-input").val(),
            type: type
        },
        url: "/arena",
        success: function(data) {
            if(data.success){
                window.location.href = "/findarena";
            }
            else{
                alert("Fill in all the fields, or may god have mercy on you soul.");
            }
        }
    });
    $("#name-input").val("");
    $("#desc-input").val("")
}


$("#createButton").click(createRoom);