const express = require('express');
const app = express();
const connectDB = require('./config/db');
const routes = require('./app/routes');
const path = require('path');
const helpers = require('./app/utils/helpers');

var config = require('config');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

connectDB();

app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');

app.locals.helpers = helpers;

app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

var host = config.get('server.host');
var port = config.get('server.port');
app.listen(3000, function(){
    console.log('Server is running on port 3000');
})