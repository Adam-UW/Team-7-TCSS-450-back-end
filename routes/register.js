//express is the framework we're going to use to handle requests
const express = require('express')
const nodemailer= require('nodemailer')

//We use this create the SHA256 hash
const crypto = require("crypto")

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

let getHash = require('../utilities/utils').getHash

let sendEmail = require('../utilities/utils').sendEmail

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())

 

/**
 * @api {post} /Auth Request to resgister a user
 * @apiName PostAuth
 * @apiGroup Auth
 * 
 * @apiParam {String} first a users first name
 * @apiParam {String} last  a users last name
 * @apiParam {String} username  a user nickname
 * @apiParam {String} email a users email *required unique
 * @apiParam {String} password a users password
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: Username exists) {String} message "Username exists"
 * 
 * @apiError (400: Email exists) {String} message "Email exists"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 */ 
router.post('/', (req, res) => {
    res.type("application/json")

    //Retrieve data from query params
    var first = req.body.first
    var last = req.body.last
    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(first && last && username && email && password) {
        //We're storing salted hashes to make our application more secure
        let salt = crypto.randomBytes(32).toString("hex")
        let salted_hash = getHash(password, salt)
        
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let theQuery = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING Email"
        let values = [first, last, username, email, salted_hash, salt]
        pool.query(theQuery, values)
            .then(result => {
                //We successfully added the user, let the user know
                res.status(201).send({
                    success: true,
                    email: result.rows[0].email
                })
               // sendEmail(process.env.EMAIL, email, "Welcome!", `<strong>Hi ${last} Welcome to our app!</strong>`);
            })
            .catch((err) => {
                //log the error
                //console.log(err)
                if (err.constraint == "members_username_key") {
                    res.status(400).send({
                        message: "Username exists"
                    })
                } else if (err.constraint == "members_email_key") {
                    res.status(400).send({
                        message: "Email exists"
                    })
                } else {
                    res.status(400).send({
                        message: err.detail
                    })
                }
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})




// var first, last, email, username, password;
// var rand, mailOptions, host, link
// // Test route 
// router.post('/', (req, res)=>{
//     res.type("application/json")

//     first=req.body.first
//     last=req.body.last
//     email=req.body.email
//     username=req.body.username

//     //The password must be hashed !! later 
//     password=req.body.password


//     if(first, last, email, username, password){
//         rand=Math.floor((Math.random() * 100) +54)
//         host=req.get('host')
//         link='http://'+host+'/auth/verify?id='+rand
//         mailOptions={
//             to: email,
//             subject: 'please confirm your Email account',
//             html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
//         }
//     }

//     smtpTransport.sendMail(mailOptions, (err, res)=>{

//         if(err){
//             console.log(err)
//         res.env('error')
//         }else {
//             console.log('Message sent: '+ res.message)
//         res.end('sent')
//         }
//     })

//     res.json({
//         success: true,
//         message: "email has sent"
//     })
// })



// //Add a user 

// function addUser (){
//     let salt = crypto.randomBytes(32).toString('hex')
//     let salted_hash= getHash(password, salt)

//     let theQuery= 'INSERT INTO MEMBERS (FirstName, LastName, Username, Email, Password, Salt) VALUES($1, $2, $3, $4, $5, $6) RETURNING Email'
//     let  values=[first, last, username, email, password,salted_hash, salt]
//     if(first, last, username, email, salted_hash, salt){

    
       
//         pool.query(theQuery, values)
//         .then(result =>{
//             // User had added to the DB
//             res.status(201).send({
//                 success: true,
//                 email: result.rows[0].email
//             })   
//         })
//         .catch(err =>{
//             if(err.constraint == 'members_username_key'){
//                 res.status(400).send({
//                     message: "username exist"
//                 })
//             }else if(err.constraint== "members_email_key"){
//                 res.status(400).send({
//                     message: "Email exist"
//                 })
//             }else {
//                 res.status(400).send({
//                     message: err.detail
//                 })
//             }
//         })

//     } else {
//         res.status(400).send({
//             message: "Missing required information"
//         })
//     }
// }
 


// router.get('/verify', (req, res, next)=> {
//     console.log(req.protocol+":/"+req.get('host'))

//     if((req.protocol+"://"+req.get('host'))==("http://"+host)){
//         console.log('Domain is matched Information is from Authentic email')
//         if(req.query.id == rand){
//             console.log('email is verified')
//           //  res.setHeader('Content-Type', 'text/html');
//             res.json("<strong>Email "+ mailOptions.to+" is been Successfully verified</strong>")
//             console.log('Email has verified ')

//             next()
//         }
//     }
//     else{
//         res.end('<h1> Request is from unknown source')
//     }

// }, (req, res) =>{
//      // add the user to the database

//      let salt = crypto.randomBytes(32).toString('hex')
//      let salted_hash= getHash(password, salt)

//      let theQuery= 'INSERT INTO MEMBERS (FirstName, LastName, Username, Email, Password, Salt) VALUES($1, $2, $3, $4, $5, $6) RETURNING Email'
//      let  values=[first, last, username, email, password,salted_hash, salt]
//      if(first, last, username, email, salted_hash, salt){

     
        
//          pool.query(theQuery, values)
//          .then(result =>{
//              // User had added to the DB
//              res.status(201).send({
//                  success: true,
//                  email: result.rows[0].email
//              })   
//          })
//          .catch(err =>{
//              if(err.constraint == 'members_username_key'){
//                  res.status(400).send({
//                      message: "username exist"
//                  })
//              }else if(err.constraint== "members_email_key"){
//                  res.status(400).send({
//                      message: "Email exist"
//                  })
//              }else {
//                  res.status(400).send({
//                      message: err.detail
//                  })
//              }
//          })

//      } else {
//          res.status(400).send({
//              message: "Missing required information"
//          })
//      }

// })














// //Email varification stuff
// var smtpTransport = nodemailer.createTransport({
//     service:"Gmail",
//     auth:{
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// })






module.exports = router