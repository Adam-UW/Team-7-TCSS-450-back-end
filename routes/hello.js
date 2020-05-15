//express is the framework we're going to use to handle requests
const express = require('express')

//retrieve the router pobject from express
var router = express.Router()

router.get("/", (request, response) => {
    response.send({
        message: "Hello, you sent a GET request"
    })
})


router.post("/", (request, response) => {
    response.send({
        message: "Hello, you sent a POST request"
    })
})
// "return" the router
module.exports = router;