const express = require('express')
const bcrypt= require("crypto")
let pool = require('../utilities/utils').pool

let getHash= require('../utilities/utils').getHash

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
var router= express.Router()
router.use(bodyParser.json())

var schema = require('./PassValidator')
var oldPass, newPass, email


/**
 * @api {post} /changepassword Request to change a user password in the system
 * @apiName Postchangepassword
 * @apiGroup changepassword
 * 
 * @apiParam {String} email the existence email
 * @apiParam {String} old valid password
 * @apiParam {String} new valid password
 * 
 * @apiSuccess {string} success password has been changed
 * 
 * @apiError (400: Empty values) {String} message "You provided an empty value for either email, old password or the new password"
 * 
 * @apiError (400: invalid old password) {String} message "Your old password is not matching your record"
 * 
 * @apiError (404: Email Not Found) {String} message "Email provide to change password for has not found"
 * 
 * @apiError (400: SQL Error) {String} message "password is matched but not updated SQL ERROR"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 */ 
router.post('/', (req, res)=>{
     email=   req.body.email
     oldPass= req.body.oldpassword
     newPass= req.body.newpassword

    console.log(email, oldPass, newPass)


    if(email && oldPass && newPass){
        const validate= schema.validate(newPass, {list: true});
        if(validate.includes('min, uppercase', 'digits', 'lowercase', 'spaces')){
            res.status(400).send({
                message: "Your new password is too weak.. please make it strong Upper and lower case with special character @&%&"
            })
    }else{
        let theQuery= 'SELECT Password, salt  FROM Members WHERE Email=$1'
        let values= [email]

        pool.query(theQuery, values)
        .then(result=>{
            if(result.rowCount==0){
                res.status(404).send({
                    message: "Email is not exist !!!"
                })
            }

        let vls ={salt: result.rows[0].salt, theSaltedPassword: result.rows[0].password}

        let TheirSalt=getHash(oldPass, vls.salt)

        console.log('old salt', vls.ourSalt)
        console.log('new salt', TheirSalt)

        if(vls.theSaltedPassword === TheirSalt){
            console.log('old password matched the one in the table')

            let newSalt = bcrypt.randomBytes(32).toString('hex')
            let hashNewPass= getHash(newPass, newSalt)
            let changePassQuery =`UPDATE Members SET salt=$1, password=$2 WHERE email=$3`
            let newValues=[newSalt, hashNewPass, email]

            pool.query(changePassQuery, newValues)
            .then(result=>{
                if(result.rowCount==0){
                    res.status(400).send({
                        message: "Password has not updated due to an error"
                    })
                }else{
                    res.status(201).send({
                        message: "Your Password has been changed. "
                    })
                }

            }).catch(err=>{
                res.status(404).send({
                    message:"OOps Error in SQL and the password has not changed unfortunately "
                })
            })

        }else{
            res.status(400).send({
                message: "Your previous password is not matching provided password! Please try again..."
            })

        }


        }).catch(err =>{res.status(400).send({message: "SQL error" + err})})
        

    }
}else{
    res.status(400).send({
        message: "Please don not provide empty values !!!!"
    })
}
 
  

})

module.exports= router

