const express = require("express");
const app = express();

app.use(express.static(__dirname));

const urlencodedParser = express.urlencoded({extended: false});
  
app.post("/", urlencodedParser, function (req, res)
{
    console.log(req.body);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Some');
});

app.listen(2000, "localhost", () =>
{
    console.log("listening");
});