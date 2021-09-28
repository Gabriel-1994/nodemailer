const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); 
const nodemailer = require('nodemailer'); 
var cors = require('cors');
require("dotenv").config();

const Server = "https://myndlift-send-email.herokuapp.com/"

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


var conn = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: "gabriel.nalbandian94@gmail.com",
      pass: process.env.pass,
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      refreshToken: process.env.refreshToken
    }
});


app.get('/', (req, res) => {    
    res.send("Hello World!")
});



app.route('/sendHelloEmail').post((req, res) => {
    let Sender = "gabriel.nalbandian94@gmail.com";
    let Recipient = req.body['Recipient'];
    let MessageBody = "Hello";
    let Subject = req.body['Subject'];
   
    let htmlBody = '<p>' + MessageBody + '</p>' + '<img src = "' + Server + 'recipients/' + Recipient + '" style="display:none">';
    var mailOptions = {
      from: Sender,
      to: Recipient,
      subject: Subject,
      html: htmlBody
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
        console.log(error);
        } else {
            conn.query('INSERT INTO users(email)  VALUES(?)',[Recipient],
            (err, rows) => {
                if (err) {
                    throw err,
                    console.log(err);
                } else {
                   res.send({ "status": "success" });
                }
            });
        }
    });
})



app.route('/recipients/:recipient').get((req, res) => {
    var Recipient = req.params['recipient'];
    var date_ob = new Date().toISOString().slice(0, 19).replace('T', ' ');
    conn.query('UPDATE users SET status = ?, first_seen= ? WHERE email=?', ["opened", date_ob, Recipient],
    (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Data Inserted:');
            res.send({ "status": "success" });
        }
    });
})


app.route('/report').get((req, res) => {
    
    conn.query('Select * from users',
    (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Data Fetched:');
            res.send(rows);
        }
    });    
})



app.listen(process.env.PORT || 5000, () => {
    console.log("Server is listening...url: " + Server);
});
