const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const rfs = require('rotating-file-stream');
const path = require('path');
const app = express();
const config = require("./config");
const routes = require("./app/routes/index.routes");


const logStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs'),
  });


app.use(express.json());

app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});
morgan.token("id", (req) => req.id);
app.use(
  morgan(function (tokens, req, res) {
    return JSON.stringify({
      requestId: tokens.id(req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: parseInt(tokens.status(req, res), 10),
      responseTime: `${tokens["response-time"](req, res)} ms`,
   
    })
  },{ stream: logStream })
);
 
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200",config.aplication_URL,"http://192.168.1.16:4200"],
  })
);

app.use(express.static("public"));

app.use(routes);

app.listen(config.port, () => console.log("App run on port: ", config.port));
