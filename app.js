const express = require('express');
const app = express();
const connectDB = require('./config/db');
const routes = require('./config/routes');

var config = require('config');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

// var controller = require(__dirname +'/app/controllers');
// app.use(controller)

app.use(routes);

var host = config.get('server.host');
var port = config.get('server.port');
app.listen(3000, function(){
    console.log('Server is running on port 3000');
})