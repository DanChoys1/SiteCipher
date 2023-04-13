// подключение express
const express = require("express");
const app = express();
app.use(express.static(__dirname));

const urlencodedParser = express.urlencoded({extended: false});
  
app.post("/", urlencodedParser, function (request, response) {
    // if(!request.body) return response.sendStatus(400);
    console.log(request.body);

    request.body.out_text = "some2";

    response.sendDate(request.body);
});

app.listen(2000, "localhost", (error) =>
{
    error ? console.log(error) : console.log("listening 4000");
});
// let a=document.querySelectorAll('submit') <script src="server.js"></script>;