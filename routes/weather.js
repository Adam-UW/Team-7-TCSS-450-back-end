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
/**
 * @api {get} /weather send a JSON inforamtion about the weather 
 * @apiName weather
 * @apiGroup weather
 * 
 *  @apiParam {String} Zip code of a city
 * 
 * @apiSuccess {String} JSON weather information!
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 */ 
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

/**
 * @api {get} /weather send a JSON inforamtion about the weather  for the current 24 Hrs
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
router.get("/daily", (req, res) => {
    const query= req.query.name
    console.log(query)
    let unit ="imperial"
    const url= "http://api.openweathermap.org/data/2.5/forecast?q="+query+"&units=imperial&appid="+process.env.WEATHER_API 
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

/**
 * @api {get} /weather send a JSON inforamtion about the weather based on the GPS coordinates
 * @apiName weather
 * @apiGroup weather
 * 
 *  @apiParam {String} params values for the latitude and longitude of a location
 * 
 * @apiSuccess {String} JSON weather information!
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 */ 
router.get('/gps/:lat&:long', (req, res)=>{
    const lat= parseFloat(req.params.lat)
    const long=parseFloat(req.params.long)
    const types=req.body.name

    console.log(lat +' '+  long)
    console.log('Weather gps got hit')

    // For current or 24 hrs by long and lat 
    if(types.includes('daily') && lat && long){
        console.log('Daily got hit')
        const url="https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&appid="+process.env.WEATHER_API
        https.get(url, response=>{
            response.on('data', data=>{
                const weatherInfo= JSON.parse(data)
                if(weatherInfo !==undefined){
                    res.send({
                        weatherInfo
                    })
                }else{
                    res.status(400).send({ message: "Missing required information"})}
            })
        })
    }

    // For 5 days by Lat and Long
    if(types.includes('5days') && lat && long){
        console.log('5Days got hit')
        const url="https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&appid="+process.env.WEATHER_API

        https.get(url, response=>{
            response.on('data', data=>{
                const weatherInfo= JSON.parse(data)
                if(weatherInfo !==undefined){
                    res.send({
                        weatherInfo
                    })
                }else{
                    res.status(400).send({ message: "Missing required information"})}
            })
        })
    }})

module.exports= router