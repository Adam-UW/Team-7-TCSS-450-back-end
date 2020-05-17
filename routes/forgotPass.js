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
router.use(bodyParser.urlencoded({extended: true}))
//This allows parsing of the body of POST requests, that are encoded in JSON
//router.use(bodyParser.json())
router.use(express.static('public')); 
 
// Create a schema to validate passwords
var schema = require('./PassValidator')





// FOR USER to register
var first, last, email, username, password;
var rand, mailOptions, host, link

//Email varification stuff
var smtpTransport = nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})



router.post('/', (req, res, next)=>{
    email= req.body.email
    let theQuery= 'SELECT * FROM Members WHERE Email=$1'
    let values =[req.body.email]

    pool.query(theQuery, values)
    .then(result=>{
        if(result.rowCount==0){
            res.status(404).send({
                message: "Email is not exist"
            })
        }
        else{
            next()
        }
    })
    .catch(err =>{
        res.status(404).send({
            message: "error" + err.detail
        })
    })
}, (req, res)=>{
    if(email){
        rand=Math.floor((Math.random() * 100) +54)
        host=req.get('host')
        link='http://'+host+'/pass/verify?id='+rand
        mailOptions={
            to: email,
            subject: 'Password Reset',
            html : "Hello,<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to verify</a>"	
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
        message: "Reset Password Email has sent"
    })
})


//Email verify  
router.get('/verify', (req, res)=> {
    console.log(req.protocol+":/"+req.get('host'))

    if((req.protocol+"://"+req.get('host'))==("http://"+host)){
        console.log('Domain is matched Information is from Authentic email')
        if(req.query.id == rand){
            rand= Math.floor((Math.random() * 100) +54)
            console.log('email is clicked')

          //  let salt = crypto.randomBytes(32).toString('hex')
           // let salted_hash= getHash(password, salt)
        //    res.sendFile('index.html', {root: __dirname})
              res.sendFile(__dirname +"/index.html")
        }
        else{
            res.status(404).render('404')
        }
    }
})


router.post('/done', (req, res)=>{
    const query= req.body.pass
    //const query2= document.getElementById(cityInput)
    console.log(query)
    if(query === undefined){
        res.status(404).send({
            message: "Empty password!!! Please request another request"
        })
    }else{
        const validate= schema.validate(query, {list: true});
        if(validate.includes('min', 'uppercase', 'digits', 'lowercase', 'spaces')){
            res.status(400).send({
                message:"Your password is not strong enough! it should be digits and letters with at least one uppercase letter"
            })    
         }else{
            let salt = crypto.randomBytes(32).toString('hex')
            let salted_hash= getHash(query, salt)


             let theQuery="UPDATE Members SET salt =$1, password=$2 WHERE email=$3"
          //   let theQuery2= "SELECT memberid FROM Members WHERE email =$1"
           

             // Add the new Password 
             let values=[salt, salted_hash, email]
             console.log(salted_hash)
    
             pool.query(theQuery, values)
             .then(result=>{
                 if(!result.rowCount==0){
                     res.send({
                        message: "Password has been changed"
                     })
                   //  console.log()
                 }
                 else{
                     res.status(400).send({
                         message: "Not able to process the query!!"
                     })
                 }
             })
             .catch(err=>{
                 res.status(404).send({
                     message: "error occurred!!!" + err.detail
                 })
             })
           // console.log(password)
    
         }
    }
})

module.exports = router;

