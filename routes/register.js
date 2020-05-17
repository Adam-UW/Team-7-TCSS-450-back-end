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
 
// Create a schema to validate passwords
var schema = require('./PassValidator')


// FOR USER to register
let first, last, email, username, password;
let rand, mailOptions, host, link





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
router.post('/', (req, res, next)=>{
    res.type("application/json")

    first=req.body.first
    last=req.body.last
    email=req.body.email
    username=req.body.username
    password=req.body.password
    console.log(typeof password)

    if(!password){
        res.status(400).end({
            message: "Oops Password is empty... session has ended"
        })
    }
    else{
        const validate= schema.validate(password, {list: true});
        if(validate.includes('min', 'uppercase', 'digits', 'lowercase', 'spaces')){
            res.status(400).send({
                message:"Your password is not strong enough! it should be digits and letters with at least one uppercase letter"
            }) 

        }else{
                  // make sure if the user exist
        let theQuery= "SELECT * FROM Members WHERE Email = $1"
        let value =[email]

        pool.query(theQuery, value)
        .then(result =>{
            if(result.rowCount == 0){
                next()
            }else{
                res.status(404).send({
                    message: "username exit"
                })
            }
        })
        .catch(err=>{
            res.status(404).send({
                message: "error "+err.detail
            })
        })

        }
    }
}, (req, res)=>{
    
    if(first && last && email && username && password){
        rand=Math.floor((Math.random() * 100) +54)
        host=req.get('host')
        link='http://'+host+'/auth/verify?id='+rand
        mailOptions={
            to: email,
            subject: 'please confirm your Email account',
            html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
        }
    }

    smtpTransport.sendMail(mailOptions, (err, res)=>{
        if(err){
            console.log(err)
        res.env('error')
        }else {
            console.log('Message sent: '+ res.message)
        res.end('sent')
        }
    })

    res.json({
        success: true,
        message: "email has sent"
    })

})

//Email verify  
router.get('/verify', (req, res)=> {
    console.log(req.protocol+":/"+req.get('host'))

    if((req.protocol+"://"+req.get('host'))==("http://"+host)){
        console.log('Domain is matched Information is from Authentic email')
        if(req.query.id == rand){
            console.log('email is verified')
            rand= Math.floor((Math.random() * 100) +54)

            let salt = crypto.randomBytes(32).toString('hex')
            let salted_hash= getHash(password, salt)

    let theQuery= 'INSERT INTO MEMBERS (FirstName, LastName, Username, Email, Password, Salt) VALUES($1, $2, $3, $4, $5, $6) RETURNING Email'
    let  values=[first, last, username, email, salted_hash, salt]

    if(first && last && username && email && salted_hash && salt){

    console.log(values)
       
        pool.query(theQuery, values)
        .then(result =>{
            // User had added to the DB
            res.status(201).send({
                success: true,
                email: result.rows[0].email
            })   
        })
        .catch(err =>{
            console.log(err)
            if(err.constraint == 'members_username_key'){
                res.status(400).send({
                    message: "username exist"
                })
            }else if(err.constraint== "members_email_key"){
                res.status(400).send({
                    message: "Email exist"
                })
            }else {
                res.status(400).send({
                    message: err.detail
                })
            }
        })

    } else {
        res.status(400).send({
            message: "Missing required information"
        })
    }
          //  res.setHeader('Content-Type', 'text/html');
         // res.send("<strong>Email "+ mailOptions.to+" is been Successfully verified</strong>")
         // res.render('index.ejs', {email: mailOptions.to})

            console.log('Email has verified ')

        }
    }
    else{
        res.set('Content-Type', 'text/html');
        res.send(new Buffer('<h2>OOPS, this links has expired!!!</h2>'));
      //  res.end('<h1> OOPS, this links has expired!!!<h1>')
    }

})



//Email varification stuff
var smtpTransport = nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})




module.exports = router