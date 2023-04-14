const express = require("express");
const bodyParser = require('body-parser')
const crypto = require('crypto')
const app = express();

app.use(express.static(__dirname));

// const urlencodedParser = express.urlencoded({extended: false});
var jParser = bodyParser.json();
  
app.post("/", jParser, function (req, res)
{
    const type = req.body.type;
    const inText = req.body.text;
    // const key = req.body.key;

    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync('secret', 'salt', 32);
    const outText = crypto
                .createCipheriv('aes-128-cbc', key, iv)
                .update('Any data', 'utf-8', 'hex')
                .final('hex');

    console.log(outText)

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(outText);
});

app.listen(2000, "localhost", () =>
{
    console.log("listening");
});
