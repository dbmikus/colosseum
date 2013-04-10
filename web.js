var express = require("express"); // imports express
var app = express();        // create a new instance of express


// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

//gives the index when navigating to the server
app.get("/", function (request,response){
    response.sendfile("static/index.html");
})



function initServer() {
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(process.env.PORT || 3000);
