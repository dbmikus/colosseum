function createRoom(){
    $.ajax({
        type: "post",
        data: {
            name: $("#name-input").val(),
            desc: $("#desc-input").val(),
            type: $('input:radio[name=Type]:checked').val()
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


$("#submitButton").click(createRoom);
