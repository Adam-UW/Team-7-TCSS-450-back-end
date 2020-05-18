//express is the framework we're going to use to handle requests
const express = require('express')
//Create a new instance of express
const app = express()

const nodemailer = require('nodemailer')

//EJS
app.set('view engine', 'ejs')

let middleware = require('./utilities/middleware')

const bodyParser = require("body-parser");


/*  NEVER UNCOMMENT XXXXX*/
//app.use(express.static('public')); 


var passwordValidator = require('password-validator');
 

//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json())

// USING ROUTES 
app.use('/auth',     require('./routes/register'));
app.use('/auth',     require('./routes/login'));
app.use('/hello',    require('./routes/hello'));
app.use('/demosql',  require('./routes/demosql'));
app.use('/pass',     require('./routes/forgotPass'))
app.use('/weather',  require('./routes/weather'))
app.use('/contacts', middleware.checkToken,  require('./routes/contacts.js'))
app.use('/messages', middleware.checkToken,  require('./routes/messages.js'))
app.use('/chats',    middleware.checkToken,  require('./routes/chats.js'))


// app
// .route('/hello/adam')
// .get((request, respond)=>{})
// .post((request, respond)=>{})
app.get("/wait", (request, response)=>{
    setTimeout(()=>{
        response.send({
            message:"Thanks for waiting"
        });
    }, 5000)
});
/*
 * This middleware function will respond to inproperly formed JSON in 
 * request parameters.
 */
app.use(function(err, req, res, next) {

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).send({ message: "malformed JSON in parameters" });
  } else next();
})

/*
 * Return HTML for the / end point. 
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it. 
 * Look up the node module 'fs' ex: require('fs');
 */
app.get("/", (request, response) => {
    //this is a Web page so set the content-type to HTML
    response.writeHead(200, {'Content-Type': 'text/html'});
    for (i = 1; i < 7; i++) {
        //write a response to the client
        response.write('<h' + i + ' style="color:blue">Hello World!</h' + i + '>'); 
    }
    response.end(); //end the response
});


// FOR API
app.use("/doc", express.static('apidoc'))

/*
 * Serve the API documentation genertated by apidoc as HTML. 
 * https://apidocjs.com/
 */
// app.use("/doc", express.static('apidoc'))

 
app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});