//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())
 
let pool = require('../utilities/utils').pool


router.post("/", (request, response) => {

    if (request.body.name && request.body.message) {
        const theQuery = "INSERT INTO DEMO(Name, Message) VALUES ($1, $2) RETURNING *"
        const values = [request.body.name, request.body.message]

        pool.query(theQuery, values)
            .then(result => {
                response.status(201).send({
                    success: true,
                    message: "Inserted: " + result.rows[0].name
                })
            })
            .catch(err => {
                //log the error
                console.log(err)
                if (err.constraint == "demo_name_key") {
                    response.status(400).send({
                        message: "Name exists"
                    })
                } else {
                    response.status(400).send({
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


router.get("/:name?", (request, response) => {

    const theQuery = 'SELECT name, message FROM Demo WHERE name LIKE $1'
    let values = [request.params.name]

    //No name was sent so SELECT on all
    if(!request.params.name)
        values = ["%"]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                response.send({
                    success: true,
                    names: result.rows
                })
            } else {
                response.status(404).send({
                    message: "Name not found"
                })
            }
        })
        .catch(err => {
            //log the error
            // console.log(err.details)
            response.status(400).send({
                message: err.detail
            })
        })
})


router.put("/", (request, response) => {

    if (request.body.name && request.body.message) {
        const theQuery = "UPDATE Demo SET message = $1 WHERE name = $2 RETURNING *"
        const values = [request.body.message, request.body.name]

        pool.query(theQuery, values)
            .then(result => {
                if (result.rowCount > 0) {
                    response.send({
                        success: true,
                        message: "Updated: " + result.rows[0].name
                    })
                } else {
                    response.status(404).send({
                        message: "Name not found"
                    })
                }
            })
            .catch(err => {
                //log the error
                // console.log(err)
                response.status(400).send({
                    message: err.detail
                })
            }) 
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    } 
})


router.delete("/:name", (request, response) => {

    if (request.params.name) {
        const theQuery = "DELETE FROM Demo  WHERE name = $1 RETURNING *"
        const values = [request.params.name]

        pool.query(theQuery, values)
            .then(result => {
                if (result.rowCount == 1) {
                    response.send({
                        success: true,
                        message: "Deleted: " + result.rows[0].name
                    })
                } else {
                    response.status(404).send({
                        message: "Name not found"
                    })
                }
            })
            .catch(err => {
                //log the error
                // console.log(err)
                response.status(400).send({
                    message: err.detail
                })
            }) 
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    } 
})

module.exports = router