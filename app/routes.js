// ```
// routes.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// routes.js may be freely distributed under the MIT license
// ```

// */app/routes.js* 

// ## Node API Routes

// Define routes for the Node backend

//Authentication Api
import authRoutes from './routes/public/_authentication.router.js';

import Publisher from './models/publisher.model';
// Load our API routes for the `Category` component
import categoryRoutes from './routes/public/_category.router.js';
// Load Authors API
import authorRoutes from './routes/public/_author.router.js';
//Publishers API
import publisherRoutes from './routes/public/_publisher.router.js';

import productRoutes from './routes/public/_product.router.js';
//Language API
import languageRoutes from './routes/public/_language.router.js';
//Home Content API
import homePageRoutes from './routes/public/_homepage.router.js';

import cartPageRoutes from './routes/public/_cart.router.js';
import customerFeedbackRoutes from './routes/public/_customer-feedback.router.js';
import shippingAddressRoutes from './routes/public/_shipping-address.router.js';
import testimonialRoutes from './routes/public/_testimonial.router.js';
import newsRoutes from './routes/public/_news.router.js';
import dataIMportExportRoutes from './routes/public/data-import-export.router';
import wishListRoutes from './routes/public/_wish-list.router';
import dynamicPageRoutes from './routes/public/_dynamic-page.router.js'
import subscriberRoutes from './routes/public/_subscriber.router.js';
import siteSubscriberRoutes from './routes/public/_site-subscriber.router';
import publicVisitRoutes from './routes/public/_public-visitor.router.js';
import orderRoutes from './routes/public/_order.router.js';
import orderPaymentRoutes from './routes/public/_order-payment.router.js'
import walletRoutes from './routes/public/_wallet.router'

import sliderImageRoutes from './routes/public/_slider-images.router.js'
import staticContent from './routes/public/_static-content.router.js';
import thanaRoutes from './routes/public/_thana.router.js';
import districtRoutes from './routes/public/_district.router.js';
import customerQueryRoutes from './routes/public/_customer-query.router.js';
import promotionalCodeRoutes from './routes/public/_promotional-code.router.js';
import cors from 'cors';
import useragent from 'express-useragent';
import jwt from 'jsonwebtoken';
import log4js from 'log4js';

import config from '../config/config.json';

export default (app, router, passport) => {

  // Redis Cache Server
  var cache = require('express-redis-cache')({
    host: process.env.REDIS_SERVER
  });

  app.use(useragent.express());


  // ### Express Middlware to use for all requests
  router.use((req, res, next) => {

    // Make sure we go to the next routes and don't stop here...
    next();
  });

  function isLoggedIn(req, res, next) {
    // //console.log(req.user.role);
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();

    // if they aren't redirect them to the home page
    res.send({
      staus: 420
    });
  }

  // Define a middleware function to be used for all secured routes
  let auth = (req, res, next) => {
    let token = req.cookies.token || req.headers['token'];
    jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
      if (err) {
        res.json({
          success: false,
          message: 'Please login first'
        });
      } else {
        let user = decoded;
        req.user = user;
        next();
      }
    })
  };

  let logger = function (log_for) {
    return (req, res, next) => {
      let file_name = 'logs/' + log_for + '.log';
      log4js.configure({
        appenders: {
          everything: {
            type: 'dateFile',
            filename: file_name,
            pattern: '.yyyy-MM-dd-hh',
            compress: false
          }
        },
        categories: {
          default: {
            appenders: ['everything'],
            level: 'debug'
          }
        }
      });
      req.log = log4js.getLogger(log_for);
      next();
    }
  }

  app.use(cors())

  // For mobile app api
  app.use(function (req, res, next) {


    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)

    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
  });

  // Pass in our Express app and Router
  authRoutes(app, router, passport, auth);
  categoryRoutes(app, router, cache);
  authorRoutes(app, router, cache);
  publisherRoutes(app, router, cache, jwt);
  productRoutes(app, router, cache, jwt);
  languageRoutes(app, router);
  homePageRoutes(app, router, cache, jwt);
  cartPageRoutes(app, router, jwt);
  shippingAddressRoutes(app, router, jwt);
  orderRoutes(app, router, jwt);
  orderPaymentRoutes(app, router, logger, auth);
  walletRoutes(app, router, logger, auth);
  testimonialRoutes(app, router, jwt);
  staticContent(app, router, jwt);
  newsRoutes(app, router, cache, jwt);
  dataIMportExportRoutes(app, router, cache);
  
  wishListRoutes(app, router, cache, jwt);
  dynamicPageRoutes(app, router, cache, jwt);

  subscriberRoutes(app, router, jwt);
  siteSubscriberRoutes(app, router, jwt);
  customerFeedbackRoutes(app, router, jwt);
  publicVisitRoutes(app, router, jwt);
  sliderImageRoutes(app, router, jwt);
  promotionalCodeRoutes(app, router, auth);
  thanaRoutes(app, router, auth);
  districtRoutes(app, router, auth);
  customerQueryRoutes(app, router, logger);
  // dynamiPagesRoutes(app, router, auth);
  // All of our routes will be prefixed with /api

  app.route('/sitemap.xml')
    .get((req, res) => {
      res.set('Content-Type', 'application/rss+xml');
      res.sendFile('/sitemap.xml', {
        root: __dirname + "/../"
      });
    });
  app.route('/sitemap1.xml.gz')
    .get((req, res) => {
      res.sendFile('/sitemap1.xml.gz', {
        root: __dirname + "/../"
      });
    });
  app.route('/sitemap2.xml.gz')
    .get((req, res) => {
      res.sendFile('/sitemap2.xml.gz', {
        root: __dirname + "/../"
      });
    });
  app.route('/sitemap3.xml.gz')
    .get((req, res) => {
      res.sendFile('/sitemap3.xml.gz', {
        root: __dirname + "/../"
      });
    });
  app.route('/authors.xml.gz')
    .get((req, res) => {
      res.sendFile('/authors.xml.gz', {
        root: __dirname + "/../"
      });
    });
  app.route('/publishers.xml.gz')
    .get((req, res) => {
      res.sendFile('/publishers.xml.gz', {
        root: __dirname + "/../"
      });
    });
  app.route('/categories.xml.gz')
    .get((req, res) => {
      res.sendFile('/categories.xml.gz', {
        root: __dirname + "/../"
      });
    });

  app.route('/google59c7527fb56b9f2b.html')
    .get((req, res) => {
      res.sendFile('/google59c7527fb56b9f2b.html', {
        root: __dirname + "/../"
      });
    });

  app.use('/api', router);
  // Route to handle all Angular requests
  app.get('*', (req, res) => {
    if (process.env.MODULE && process.env.MODULE == 'public') {
      res.sendFile('/dist-public/index.html', {
        root: __dirname + "/../"
      });
    } else if (process.env.MODULE && process.env.MODULE == 'mobile') {
      res.sendFile('/dist-mobile/index.html', {
        root: __dirname + "/../"
      });
    } else {
      res.sendFile('/dist-admin/index.html', {
        root: __dirname + "/../"
      });
    }
  });

};
