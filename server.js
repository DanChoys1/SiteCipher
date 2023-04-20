const express = require("express");
const bodyParser = require('body-parser')
const crypto = require('crypto')
var pg = require("pg")

//Сайт
const app = express();
app.use(express.static(__dirname));

// const urlencodedParser = express.urlencoded({extended: false});
var jParser = bodyParser.json();

//Шифрование
const cryptos = [ "aes-128-cbc", "blowfish", "cast", "des" ]  
const iv8 = crypto.randomBytes(8);
const iv16 = crypto.randomBytes(16);

//БД
var client = new pg.Client("postgres://postgres:1@localhost:5432/chipher");
client.connect();
client.query("INSERT INTO newtable values('woivgnds;fkjbdkjbnd;jbnd;kjfbndkfj;bnreaovd;k', '123')");

app.post("/", jParser, function (req, res)
{   
    const isDeciph = req.body.isDeciph
    const inText = req.body.text;
    const key = req.body.key;

    let type = "";
    for (const val of cryptos)
    {
        if(val.includes(req.body.type.toLowerCase()))
        {
            type = val
            break
        }
    }

    let iv = iv8
    if(type == "aes-128-cbc") iv = iv16

    let outText;
    if (isDeciph)
    {
        let cipher = crypto.createDecipheriv(type, key, iv);  
        outText = cipher.update(inText, 'hex', 'utf8') + cipher.final('utf8');
    }
    else
    {
        let cipher = crypto.createCipheriv(type, key, iv);  
        outText = cipher.update(inText, 'utf8', 'hex') + cipher.final('hex');
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(outText);
});
 
app.listen(5000, "localhost", () =>
{
    console.log("listening");
});
