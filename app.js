const express = require('express');
var config = require('config');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

var controller = require(__dirname +'/app/controller');
app.use(controller)

var host = config.get('server.host');
var port = config.get('server.port');
app.listen(3000, function(){
    console.log('Server is running on port 3000');
})