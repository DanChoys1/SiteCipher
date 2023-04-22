const express = require("express");
const bodyParser = require('body-parser')
const crypto = require('crypto')
var pg = require("pg");
const e = require("express");
// const { log } = require("console");
const fs = require('fs').promises;

//Сайт
const app = express();
app.use(express.static(__dirname));

const urlencodedParser = express.urlencoded({extended: false});
var jParser = bodyParser.json();

//БД
var client = new pg.Client("postgres://postgres:1@localhost:5432/cipher");
client.connect();

// Settings
const port = 5000;

const adminLogin = "admin";
const adminPass = "admin";
let isAdminLogined = false;

const cryptos = [ "aes-128-cbc", "blowfish", "cast", "des" ]  
const iv8 = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72, 0xfa, 0x8a]);
const iv16 = Buffer.from([0x1e, 0xd5, 0x83, 0x2c, 0x1f, 0xf0, 0xdc, 0xb0, 0x95, 0xfa, 0xec, 0x7e, 0x8a, 0xfe, 0xc6, 0xb3]);

const tableName = "frequency_algo";
const algoNameColumn = "algo_name";
const freqCountColumn = "frequency";

function logCipherCount(type)
{
    client.query(`SELECT COUNT(*) FROM ${tableName} WHERE ${algoNameColumn} = '${type}'`)
    .then((res) => 
    {
        if(res.rows[0].count > 0)
        {
            client.query(`UPDATE ${tableName} SET ${freqCountColumn} = ${freqCountColumn} + 1 WHERE ${algoNameColumn} = '${type}'`);
        } 
        else
        {
            client.query(`INSERT INTO ${tableName} values('${type}', '1')`);
        }
    })
    // .finally(_ => client.end());
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

app.get("/admin-login", function (req, res)
{
    if (isAdminLogined)
    {
        isAdminLogined = false;

        let html = `<!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="utf-8">
            <title>Ciphers</title>
        </head>
        <body>
            <table>
            <caption>Частота использования алгоритмов</caption>
            <tr>
                <th>Алгоритм</th>
                <th>Частота</th>
            </tr>
            <tr>`;

        for (const type of cryptos)
        {
            client.query(`SELECT COUNT(*) FROM ${tableName} WHERE ${algoNameColumn} = '${type}'`)
            .then((result) => 
            {
                if(result.rows[0].count > 0)
                {
                    client.query(`SELECT ${freqCountColumn} FROM ${tableName} WHERE ${algoNameColumn} = '${type}'`)
                    .then((result) =>
                    {
                        html += `<td>${type}</td>`;
                        html += `<td>${result.rows[0].frequency}</td>`;                        
                    });
                } 
            });
        }
        
        html += `</tr></table></body></html>`;

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(html);
    }
    else
    {   
        fs.readFile(__dirname + "/admin-logging.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
    }
});

app.post("/admin-login", urlencodedParser, function (req, res)
{
    let path = '/admin-login';
    if (req.body.log == adminLogin &&
        req.body.pass == adminPass)
    {
        isAdminLogined = true;
        path = '/admin-login';
    }

    res.redirect(path);    
});

// function checkAuth(req, res, next) {
//     if (!req.loggedin) 
//     {
//       res.send('You are not authorized to view this page');
//     } 
//     else 
//     {
//       next();
//     }
// }

// app.get('/admin', checkAuth, function (req, res) 
// {
//     let html = `<table>
//         <caption>Частота использования алгоритмов</caption>
//         <tr>
//             <th>Алгоритм</th>
//             <th>Частота</th>
//         </tr>
//         <tr>`;

//     for (const type of cryptos)
//     {
//         client.query(`SELECT COUNT(*) FROM ${tableName} WHERE ${algoNameColumn} = '${type}'`)
//         .then((result) => 
//         {
//             if(result.rows[0].count > 0)
//             {
//                 client.query(`SELECT ${freqCountColumn} FROM ${tableName} WHERE ${algoNameColumn} = '${type}'`)
//                 .then((result) =>
//                 {
//                     html += `<td>${type}</td>`;
//                     html += `<td>${result}</td>`;
//                 });
//             } 
//         });
//     }

//     html += `</tr> </table>`;

//     res.end(html);
// });

app.listen(port, "localhost", () =>
{
    console.log(`listening port ${port}`);
});
