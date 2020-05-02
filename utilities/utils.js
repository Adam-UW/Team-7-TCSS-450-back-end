//Get the connection to Heroku Database
let pool = require('./sql_conn.js')
const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 25,
  secure: false,
  auth:{
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  tls:{
      rejectUnauthorized: false
  }

});



//We use this create the SHA256 hash
const crypto = require("crypto");

function sendEmail(from, receiver, subj, message) {
  //research nodemailer for sending email from node.
  // https://nodemailer.com/about/
  // https://www.w3schools.com/nodejs/nodejs_email.asp
  //create a burner gmail account 
  //make sure you add the password to the environmental variables
  //similar to the DATABASE_URL and PHISH_DOT_NET_KEY (later section of the lab)

  //fake sending an email for now. Post a message to logs. 
  //console.log('Email sent: ' + message);

  let HelperOption={
    from: from,
    to: receiver,
    subject: subj,
    text: message
  }

  transporter.sendMail(HelperOption, (err, info)=>{
    if(err){
      console.log("error has occured"+ err);
    }else {
      console.log('email has sent...');
    }

  });

  
}

/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

module.exports = { 
    pool, getHash, sendEmail
};
