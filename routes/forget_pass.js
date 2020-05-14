// //express is the framework we're going to use to handle requests
// const express = require('express')
// const nodemailer= require('nodemailer')

// //We use this create the SHA256 hash
// const crypto = require("crypto")

// //Access the connection to Heroku Database
// let pool = require('../utilities/utils').pool

// let getHash = require('../utilities/utils').getHash

// let sendEmail = require('../utilities/utils').sendEmail

// var router = express.Router()

// const bodyParser = require("body-parser")
// //This allows parsing of the body of POST requests, that are encoded in JSON
// router.use(bodyParser.json())

// // FOR USER to register
// var first, last, email, username, password;
// var rand, mailOptions, host, link

// //Email varification stuff
// var smtpTransport = nodemailer.createTransport({
//     service:"Gmail",
//     auth:{
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// })



// router.post('/', (req, res, next)=>{
//     email= req.body.email
//     let theQuery= 'SELECT * FROM Members WHERE Email=$1'
//     let values =[req.body.email]

//     pool.query(theQuery, values)
//     .then(result=>{
//         if(result.rowCount==0){
//             res.status(404).send({
//                 message: "Email is not exist"
//             })
//         }
//         else{
//             next()
//         }
//     })
//     .catch(err =>{
//         res.status(404).send({
//             message: "error" + err.detail
//         })
//     })
// }, (req, res)=>{
//     if(email){
//         rand=Math.floor((Math.random() * 100) +54)
//         host=req.get('host')
//         link='http://'+host+'/auth/verify?id='+rand
//         mailOptions={
//             to: email,
//             subject: 'please confirm your Email account',
//             html : "Hello,<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to verify</a>"	
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
//         message: "Reset Password Email has sent"
//     })
// })


// //Email verify  
// router.get('/verify', (req, res)=> {
//     console.log(req.protocol+":/"+req.get('host'))

//     if((req.protocol+"://"+req.get('host'))==("http://"+host)){
//         console.log('Domain is matched Information is from Authentic email')
//         if(req.query.id == rand){
//             console.log('email is clicked')

//             let salt = crypto.randomBytes(32).toString('hex')
//             let salted_hash= getHash(password, salt)






// app.post('/', (req, res)=>{
//     const query=req.body.cityName
//     let unit ="metric"
//     const url= "https://api.openweathermap.org/data/2.5/weather?q="+query+"&units="+unit+"&appid="+API_KEY
    
//     https.get(url, (response)=>{
//         console.log(response.statusCode)
//         response.on('data', (data)=>{
//             const weatherData=JSON.parse(data)
//             const temp=weatherData.main.temp
//             const weatherDescription= weatherData.weather[0].description
//             const icon= weatherData.weather[0].icon
//             console.log(icon)
//             const imageUrl= "http://openweathermap.org/img/wn/"+icon+"@2x.png"
//             res.write('<p> The weather is currently '+weatherDescription+'<p>')
//             res.write("<h1> The temperature in "+query+" is " + temp+" degree Celcius.<h1>")
//             res.write("<img src="+imageUrl+">")
//             res.send()
//            console.log(temp)
//         })
//     })
//   //  res.send('HI Adam ')
// })




