const express = require("express");
const bodyParser = require('body-parser')
const crypto = require('crypto')
var pg = require("pg");
const e = require("express");
// const { log } = require("console");
const fs = require('fs').promises;
//export NODE_OPTIONS=--openssl-legacy-provider//
//Сайт
const app = express();
app.use(express.static(__dirname));

const urlencodedParser = express.urlencoded({extended: false});
var jParser = bodyParser.json();

//БД
var client = new pg.Client("postgres://postgres:1@localhost:5432/cipher");
client.connect();

// Settings
const port = 3000;

const adminLogin = "admin";
const adminPass = "admin";
let isAdminLogined = false;

const cryptos = [ "aes-128-cbc", "blowfish", "cast", "des" ]  
const iv8 = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72, 0xfa, 0x8a]);
const iv16 = Buffer.from([0x1e, 0xd5, 0x83, 0x2c, 0x1f, 0xf0, 0xdc, 0xb0, 0x95, 0xfa, 0xec, 0x7e, 0x8a, 0xfe, 0xc6, 0xb3]);

const tableName = "frequency_algo";
const algoNameColumn = "algo";
const dateColumn = "date";

function logCipherCount(type)
{
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    client.query(`INSERT INTO ${tableName} values('${type}', '${yyyy + '-' + mm + '-' + dd }')`);
}

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
            logCipherCount(type)
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

app.get("/admin", function (req, res)
{
    let file = "/admin-logging.html";
    if (isAdminLogined)
    {
        isAdminLogined = false;
        file = "/admin.html"
    }

    fs.readFile(__dirname + file)
    .then(contents => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(contents);
    })
});

app.post("/admin-dates", function (req, res)
{
    dates(res)
});

async function dates(res)
{
    let arr = {};
    let i = 0;
    for (const type of cryptos)
    {
        arr[type] = {};
        arr[type][0] = await client.query(`SELECT COUNT(*) FROM ${tableName} 
                WHERE ${algoNameColumn} = '${type}' AND (now() - interval '7 day') < ${dateColumn}`)
        .then((result) => 
        {
            return result.rows[0].count;
        });
        arr[type][1] = await client.query(`SELECT COUNT(*) FROM ${tableName} 
                WHERE ${algoNameColumn} = '${type}' AND (now() - interval '31 day') < ${dateColumn}`)
        .then((result) => 
        {
            return result.rows[0].count;
        });
        arr[type][2] = await client.query(`SELECT COUNT(*) FROM ${tableName}
                WHERE ${algoNameColumn} = '${type}' AND (now() - interval '356 day') < ${dateColumn}`)
        .then((result) => 
        {
            return result.rows[0].count;
        });
    }

    res.setHeader("Content-Type", "application/json;charset=utf-8");
    res.writeHead(200);
    res.end(JSON.stringify(arr));
}

app.post("/admin", urlencodedParser, function (req, res)
{
    isAdminLogined = req.body.log == adminLogin && req.body.pass == adminPass;
    res.redirect("/admin");
});

app.listen(port, "localhost", () =>
{
    console.log(`listening port ${port}`);
});
