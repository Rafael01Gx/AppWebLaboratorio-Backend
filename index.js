const express = require("express");
const cors = require("cors");
const app = express()
const config = require('./config');
const routes = require('./app/routes/index.routes');


// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin:['http://localhost:4200','http://192.168.1.4:4200']}))

// Public folder for images
app.use(express.static('public')) 

// Routes
app.use(routes);

app.listen(config.port,()=>console.log("App run on port: ", config.port))