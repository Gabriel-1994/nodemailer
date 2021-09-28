const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); 
const nodemailer = require('nodemailer'); 
var cors = require('cors');
require('dotenv').config();
//----------- all the requires --------//

const Server = "https://myndlift-send-email.herokuapp.com/"  // our server

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var conn = mysql.createConnection({
    host: process.env.host,         // connecting ...  
    user: process.env.user,         // to ...
    password: process.env.password, // our ... 
    database: process.env.database  // database
});

let transporter = nodemailer.createTransport({
    service: 'gmail', // using gmail SMTP
    auth: {           // configuring the authorizations 
      type: 'OAuth2',
      user: "gabriel.nalbandian94@gmail.com",
      pass: process.env.pass,
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      refreshToken: process.env.refreshToken
    }
});

app.get('/', (req, res) => {    // main route
    res.send("Hello World!")
});

app.route('/sendHelloEmail').post((req, res) => {   // the api that sends the hello email
    let Sender = "gabriel.nalbandian94@gmail.com";  // using my gmail as the sender
    let Recipient = req.body['Recipient'];          // letting the user decide who the recipient is
    let MessageBody = "Hello";                      // email will always be "Hello"
    let Subject = req.body['Subject'];              // letting the user decide what the subject is
   
    let htmlBody = '<p>' + MessageBody + '</p>' + '<img src = "' + Server + 'recipients/' + Recipient + '" style="display:none">';
    // inserting an img with src as one of our endpoints to be able to track the email, 
    // making display as none so user won't see it when opening the email

    var mailOptions = {
      from: Sender,
      to: Recipient,
      subject: Subject,
      html: htmlBody
    }; // mailoptions object with all the info we declared above
    
    transporter.sendMail(mailOptions, function (error, info) { // sending the email
        if (error) {
        console.log(error);
        } else {
            conn.query('INSERT INTO users(email)  VALUES(?)',[Recipient], // insert the email into our users table in the DB
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

app.route('/recipients/:recipient').get((req, res) => { //this endpoint is triggered/visited when the user opens the email
    var Recipient = req.params['recipient'];
    var date_ob = new Date().toISOString().slice(0, 19).replace('T', ' ');
    conn.query('UPDATE users SET status = ?, first_seen= ? WHERE email=?', ["opened", date_ob, Recipient], 
    // update the status to "opened" and first seen to the time now (meaning when the user first opens the email)
    (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Data Inserted:');
            res.send({ "status": "success" });
        }
    });
})

app.route('/report').get((req, res) => { // api that returns all the information from our DB    
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
