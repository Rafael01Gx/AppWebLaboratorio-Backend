const express = require("express");
const cors = require("cors");
const app = express()
const config = require('./config');
const routes = require('./app/routes/index.routes');


app.use(express.json())

app.use(cors({ credentials: true, origin:['http://localhost:4200','http://192.168.1.6:4200']}))

app.use(express.static('public')) 

app.use(routes);

app.listen(config.port,()=>console.log("App run on port: ", config.port))