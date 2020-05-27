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

//  For Latitude	47.608013 Longitude	-122.335167
// http://api.openweathermap.org/data/2.5/weather?lat=47.608013&lon=-122.335167&appid=2fd309a672a3f18e290e9bf61e263016
// TODO @ Must move all links into .env
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



   
//     //Current 
//    // const url="https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&appid="+process.env.WEATHER_API

//     // 5 Days by lat & long
//     const url="https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&appid="+process.env.WEATHER_API
//     if(lat && long){
//         https.get(url, response=>{
//             response.on('data', data=>{
//                 const weatherData= JSON.parse(data)
//                console.log(weatherData.name)
//              //  console.log(weatherData)
//                 res.send({
//                     weatherData
//                 })
//             })
//         })
//     }else{
//         response.status(400).send({msg:'Missing required information'})
//     }

// })

// function callHttp(url){
//     return new Promise((resolve, reject)=>{
//         if(url){
//             let weather=""
//             https.get(url, response=>{
//                 response.on('data', data=>{
//                      weather=JSON.parse(data)
//                     console.log('The proimise is triggered')
//                //     console.log(weather)
//                 })
//             })

//            if(weather){
//                resolve( weather)
//                return weather
//            }else{
//             reject(weather)
//            // console.log('inside reject')
//            return weather
//         }

//         }
//     })
// }

// async function httpsCall (url){
//     return new Promise((resolve, reject)=>{
//         console.log(`Inside first promise ${url}`)
//         if()
//     })
//     var weatherData=""
//     https.get(url, response=>{
//        response.on('data', data=>{
//             weatherData=JSON.parse(data)
//             console.log(weatherData) // Only in 24 hrs
//        })
//     })
    
//     console.log(weatherData, 'I am last at httpsCall')
//     return weatherData=="" ? weatherData : false

// }

// async 
// function httpHelp(url){
//     try{
//         const response = await callHttp(url)
//         console.log('response recieveed ')
//     }
//     catch(err){
//         console.log(err)
//     }
// }



// /fruit/:fruitName/:fruitColor', function(req, res) {
// Ignore 
//  function htppHelper(url){
// let weatherReturn=""
//       https.get(url, (response)=>{
//         response.on('data', (data)=>{
//             weatherReturn=JSON.parse(data)
//            //  console.log('I am here ' )
//             // console.log(weather)       
//         })
//     })
//    return weatherReturn != "" ? weatherReturn : undefined

// }







// new route for 5-12 days 

module.exports= router