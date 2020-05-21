// ```
// server.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// server.conf.js may be freely distributed under the MIT license
// ```

// *server.conf.js*

//  This is the file where we will:
//  - Configure our application
//  - Connect to our database
//  - Create our Mongoose models
//  - Define routes for our RESTful API
//  - Define routes for our frontend Angular application
//  - Set the app to listen on a port so we can view it in our browser

// # Node Env Variables

// Load Node environment variable configuration file
import {
  validateEnvVariables
} from './config/env.conf.js';

// Set up appropriate environment variables if necessary
validateEnvVariables();

import config from './config/config.json';

// # Modules

// Load Express
import express from 'express';

import device from 'express-device';
// Load Socket.io
import socketio from 'socket.io';
// Load Node http module
import http from 'http';
// Create our app with Express
let app = express();
// Create a Node server for our Express app
let server = http.createServer(app);
// Integrate Socket.io
let io = socketio.listen(server);
// Load Mongoose for MongoDB interactions
import mongoose from 'mongoose';
// Log requests to the console (Express 4)
import morgan from 'morgan';
// Pull information from HTML POST (express 4)
import bodyParser from 'body-parser';
// Simulate DELETE and PUT (Express 4)
import methodOverride from 'method-override';
// PassportJS
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';

// # Configuration

// Load Socket.io server functionality
import base from './sockets/base';

base(io);

// Set the port for this app
let port = process.env.PORT || 3000;

// Load Mongoose config file for connecting to MongoDB instance
import mongooseConf from './config/mongoose.conf.js';

mongoose.Promise = global.Promise;
// import es6Promise from 'es6-promise';
// mongoose.Promise = es6Promise.Promise;

// mongoose.Promise = require('bluebird');

// Pass Mongoose configuration Mongoose instance
mongooseConf(mongoose);

// Import PassportJS configuration
import passportConf from './config/passport.conf.js';

// Pass Passport configuration our PassportJS instance
passportConf(passport);

if (process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test')
  // Log every request to the console
  app.use(morgan('dev'));

// Read cookies (needed for authentication)
app.use(cookieParser());
app.use(device.capture());

// Set default cookies
app.use(function (req, res, next) {

  let strHeader = req.headers.host;
  var device = req.device.type;
  var itemForDevice = 10;

  if (process.env.NODE_ENV == "production") {

    itemForDevice = 8;
  } else {

    itemForDevice = 8;

  }




  res.cookie('deviceName', device);
  res.cookie('itemForDevice', itemForDevice, {
    httpOnly: true
  });

  // check if client sent cookie
  var reqLang = req.cookies.lang;

  if (req.headers['app-device']) {
    let appDevice = JSON.parse(req.headers['app-device']);
    reqLang = appDevice.lang;
  }

  if (!reqLang) {
    res.cookie('lang', 'bn', {
      path: '/'
    });
  } else {
    // yes, cookie was already present 
    res.cookie('lang', reqLang, {
      path: '/'
    });
  }
  next();
});

// ## Get all data/stuff of the body (POST) parameters

// Parse application/json
app.use(bodyParser.json());
// Parse application/vnd.api+json as json
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
}));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

// Override with the X-HTTP-Method-Override header in the request. Simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// gzip compression
app.use(compression({
  filter: shouldCompress
}));

function shouldCompress(req, res) {


  if (req.headers['x-no-compression']) {
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

var oneDay = 86400000;
// Set the static files location /public/img will be /img for users
if (process.env.MODULE && process.env.MODULE == 'public') {
  app.use(express.static(__dirname + '/dist-public', {
    maxAge: oneDay
  }));
} else if (process.env.MODULE && process.env.MODULE == 'mobile') {
  app.use(express.static(__dirname + '/dist-mobile', {
    maxAge: oneDay
  }));
} else {
  app.use(express.static(__dirname + '/dist-admin'));
}



// ## Passport JS

// Session secret
app.use(session({

  secret: process.env.SESSION_SECRET,

  resave: true,

  saveUninitialized: true
}));

app.use(passport.initialize());

// Persistent login sessions
app.use(passport.session());

// ## Routes

// Get an instance of the express Router
let router = express.Router();
let adminRouter = express.Router();

// Load our application API routes
// Pass in our express and express router instances
import routes from './app/routes';
import adminRoutes from './app/admin.routes';
import uploadRoutes from './app/uploads.routes';

// Pass in instances of the express app, router, and passport
adminRoutes(app, adminRouter, passport);
uploadRoutes(app, router);
routes(app, router, passport);

// ### Ignition Phase

server.listen(port);

// Shoutout to the user
console.log(`Wizardry is afoot on port ${port}`);

// Expose app
export {
  app
};
