//Get the connection to Heroku Database
let pool = require('./sql_conn.js')
const nodemailer = require('nodemailer');


// Transporter for the Email server
let transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 25, 
  secure: false, // Since not 465
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

/**
 * 
 * @param {email} from     a sender email
 * @param {email} receiver a receiver email
 * @param {string} subj    a subject email
 * @param {string} message a message container 
 */
function sendEmail(from, receiver, subj, message) {
  let HelperOption={
    from: from,
    to: receiver,
    subject: subj,
   // text: message
   html: message
  }

  transporter.sendMail(HelperOption, (err, info)=>{
    if(err){
      console.log("error has occured and can not verify your registeration "+ err);
    }else {
      console.log('Verification email has sent...' + HelperOption.message);
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
