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
    let unit ="imperial"
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
})

// new route for zipcode 
http://api.openweathermap.org/data/2.5/weather?zip=98125,us&appid=2fd309a672a3f18e290e9bf61e263016
router.get("/zip", (req, res) => {
    const zip= req.query.code
    let unit ="imperial"
    console.log(zip)
    const url= "https://api.openweathermap.org/data/2.5/weather?zip="+zip+",us&units="+unit+"&appid="+process.env.WEATHER_API 
    if (zip) {
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
})


// http://api.openweathermap.org/data/2.5/forecast?q=seattle&units=imperial&appid=2fd309a672a3f18e290e9bf61e263016
// new route for 24 hrs 
router.get("/daily", (req, res) => {
    const query= req.query.name
    console.log(query)
    let unit ="imperial"
    const url= "https://api.openweathermap.org/data/2.5/forecast?q="+query+"&units=imperial&appid="+process.env.WEATHER_API 
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
})





// new route for 5-12 days 

module.exports= router