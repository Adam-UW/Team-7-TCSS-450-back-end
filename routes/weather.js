const express= require('express')

var router= express.Router()
router.use(express.json())

var url="http://api.openweathermap.org/data/2.5/weather?q=seattle&appid=2fd309a672a3f18e290e9bf61e263016"

router.get('/', (req, res)=>{
    if(req.query.city){
        res.send({

        })
    }
})