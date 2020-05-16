const express= require('express')
const https = require('https')

// Initiate the route
var router= express.Router()
const bodyParser= require('body-parser')
router.use(bodyParser.urlencoded({extended: true}))

/**
 * @api {get} /weather send a JSON inforamtion about the weather 
 * @apiName weather
 * @apiGroup weather
 * 
 *  @apiParam {String} city the name of a city
 * 
 * @apiSuccess {String} JSON weather information!
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 */ 
router.get("/", (req, res) => {
    const query= req.query.name
    console.log(query)
    let unit ="metric"
    const url= "https://api.openweathermap.org/data/2.5/weather?q="+query+"&units="+unit+"&appid="+process.env.WEATHER_API 
    if (query) {
        https.get(url, (response)=>{
            response.on('data', (data)=>{
                const weatherData=JSON.parse(data)
                res.send({
                    weatherData
                })
            })

        })

    } else {
        response.status(400).send({ message: "Missing required information"})}
});


// new route for zipcode 

// new route for 24 hrs 

// new route for 5-12 days 

module.exports= router