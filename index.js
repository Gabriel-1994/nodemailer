const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); //as we use a MySQL database
const nodemailer = require('nodemailer'); //to send mails
var cors = require('cors');

const Server = "https://myndlift-send-email.herokuapp.com/"

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


var conn = mysql.createConnection({
    host: "sql6440476",
    user: "sql6440476",
    password: "YxtF8iLck6",
    database: "sql6440476"
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: "gabriel.nalbandian94@gmail.com",
      pass: "Bandi4434!!!",
      clientId: "452361147036-ceojk2okp2oi89msre2mave0m9aa15ea.apps.googleusercontent.com",
      clientSecret: "xupRMWFscsoRH78r1sOBnJKX",
      refreshToken: "1//04fJiiFTpzRxcCgYIARAAGAQSNwF-L9IrgUSm9GN0TJig0OnLTHtapxJZOR5kzoT2n-rz0Zh0lmOhmruUG4H0ERENyhMtdsbGwDo"
    }
});


app.get('/', (req, res) => {
    res.json({
     "message": "Hi this is mail tracker node server",
     "url": Server
    });
});



app.listen(process.env.PORT || 5000, () => {
    console.log("Server is listening...url: " + Server);
});

