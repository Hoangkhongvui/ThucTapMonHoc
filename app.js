const express = require('express');
const app = express();
const connectDB = require('./config/db');
const routes = require('./app/routes');
const path = require('path');
const helpers = require('./app/utils/helpers');
const session = require('express-session');
const MongoStore = require('connect-mongo');

var config = require('config');
// var bodyParser = require('body-parser');

// app.use(bodyParser.json());

connectDB();

app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');

app.locals.helpers = helpers;

app.use(express.static(path.join(__dirname, 'public/assets')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: 'my_database',
      collectionName: 'sessions'
  }),
  cookie: {
      maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(routes);

var host = config.get('server.host');
var port = config.get('server.port');
app.listen(3000, function(){
    console.log('Server is running on port 3000');
})