// ```
// routes.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// routes.js may be freely distributed under the MIT license
// ```

// */app/routes.js*

// ## Node API Routes

// Define routes for the Node backend

// Load our API routes for user authentication
import authRoutes from './routes/admin/_authentication.router.js';
// // Load our API routes for the `todo` component
// import todoRoutes from './routes/_todo.router.js';

// // Load our API routes for the `recipe` component
// import recipeRoutes from './routes/_recipe.router.js';

// Category Routes
import categoryRoutes from './routes/admin/_category.router.js';
import config from '../config/config.json';
// Author Routes
import authorRoutes from './routes/admin/_author.router.js';
import publisherRoutes from './routes/admin/_publisher.router.js';
import productRoutes from './routes/admin/_product.router.js';

// User Permissions
import roleRoutes from './routes/admin/_role.router.js';
import userRoutes from './routes/admin/_user.router.js';
import menuRoutes from './routes/admin/_menu.router.js';
import permissionRoutes from './routes/admin/_permission.router.js';

// Setup Routes
import languageRoutes from './routes/admin/_language.router.js';
import offerRoutes from './routes/admin/_offer.router.js';
import giftRoutes from './routes/admin/_gift.router.js';
import bannerRoutes from './routes/admin/_banner.router.js';
import blogRoutes from './routes/admin/_blog_content.router';
import homeblockRoutes from './routes/admin/_homeblock_content.router';
import videoContentRoutes from './routes/admin/_video_content.router.js';
import promotionalImageRoutes from './routes/admin/_promotional-image.router.js';
import promotionalCodeRoutes from './routes/admin/_promotional-code.router.js';
import smsGenerationRoutes from './routes/admin/_sms-generation.router.js'
import {
    getScheduleTime
} from './routes/admin/_sms-generation.router.js'

import bulkSmsLogRoutes from './routes/admin/_bulk-sms-log.router';
import messageTemplate from './routes/admin/_message-template.router';


import currencyRoutes from './routes/admin/_currency.router.js';
import lengthClassRoutes from './routes/admin/_length-class.router.js';
import weightClassRoutes from './routes/admin/_weight-class.router.js';
import orderStatusRoutes from './routes/admin/_order-status.router.js';
import stockStatusRoutes from './routes/admin/_stock-status.router.js';
import testimonialRoutes from './routes/admin/_testimonial.router.js';
import paymentGatewayRoutes from './routes/admin/_payment-gatway.router.js';

import staticContentRoutes from './routes/admin/_static-content.router.js';
import dynamicPageRoutes from './routes/admin/_dynamic-page.router.js';
import uploadedImagesPageRoutes from './routes/admin/_uploaded-images.router.js';
import customerQueryRoutes from './routes/admin/_customer-query.router.js';
import subscriberRoutes from './routes/admin/_subscriber.router';

import newsRoutes from './routes/admin/_news.router.js';
import shippingAddressRoutes from './routes/admin/_shipping-address.router.js'
import attributeRoutes from './routes/admin/_attribute.router.js';
import ordersRoutes from './routes/admin/_order.router.js';
import orderCarrierRoutes from './routes/admin/_order-carrier.router.js';
import paymentCollectionRoutes from './routes/admin/_payment-collect.router.js';
import bulkUpdateRoutes from './routes/admin/_bulk-update.router.js';

// Inventory

import purchaseRoutes from './routes/admin/inventory/_purchase.router.js';
import stockRoutes from './routes/admin/inventory/_stock.router.js';
import salesRoutes from './routes/admin/inventory/_sales.router.js';
import suppierRoutes from './routes/admin/inventory/_supplier.router.js';
import purchaseOrderRoutes from './routes/admin/inventory/_purchase-order.router.js';
import employeeRoutes from './routes/admin/inventory/_employee.router.js';
import walletRoutes from './routes/admin/_wallet.router';
import RefundRoutes from './routes/admin/_refund.router';
import inventoryRouters from './routes/admin/inventory/inventory.service.js';


// Product Analysis 
import SalesReport from './routes/admin/sales-report/_sales-report.router.js';


//MIS Reprorts
import dashboardRoutes from './routes/admin/_dashboard.router.js';
import publicVisitRoutes from './routes/admin/_public-visitor.router.js';

//CRM Routes

import crmCallRecordRoutes from './routes/admin/crm-routes/_callrecord.router';

// Chart Of Account
import chartOfAccountRoutes from './routes/admin/_chart-of-account.router';
import voucherRoutes from './routes/admin/_voucher.router';
import costCenterRoutes from './routes/admin/_cost-center.router';

import accountReportRoutes from './routes/admin/_account-report.router';

import multer from 'multer';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import log4js from 'log4js';
import {
    slugGenerate
} from '../config/slug-generator.service';
import {
    getDateOfThirtyDayAgo,
    getTwoDateDiffirenceAsDays,
    getDateOfSpecificDayAgo
} from '../app/routes/admin/admin-api.service';

export default (app, router, passport) => {


    //Node Scheduler
    // var schedule = require('node-schedule');

    // var j = schedule.scheduleJob('41 * * * *', function () {
    //     //console.log('The answer to life, the universe, and everything!');
    // });

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

    function checkPermission(req) {
        var requestedUrl = req.url,
            requestedMethod = req.method,
            role = req.user.role,
            hasUrl = (role.resources[requestedUrl].isAllowed) == undefined ? false : role.resources[requestedUrl].isAllowed,
            hasAction = (role.resources[requestedUrl].permissions[requestedMethod]) == undefined ? false : role.resources[requestedUrl].permissions[requestedMethod];
        if (hasUrl && hasAction)
            return true;

        return false;
    }
    // Define a middleware function to be used for all secured routes
    // let auth = (req, res, next) => {
    //     if (!req.isAuthenticated())
    //         res.json({ name: "Authentication Failed", message: "Please login first" });

    //     else
    //         next();
    // };
    let auth = (req, res, next) => {
        let token = req.cookies.admin_token;
        jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
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

    let dateRangeCond = function(date_field_name) {
        return (req, res, next) => {
            let c_cond = new Object();
            let p_cond = new Object();

            let from_date = req.query.from_date ? new Date(req.query.from_date) : new Date(getDateOfThirtyDayAgo());
            from_date.setHours(0, 0, 0, 0);
            let to_date = req.query.to_date ? new Date(req.query.to_date) : new Date();
            to_date.setHours(23, 59, 59, 999);
            c_cond[date_field_name] = {
                $lte: new Date(to_date),
                $gte: new Date(from_date)
            }
            req.current_cond = c_cond;
            let fromDate_string = from_date.getFullYear() + '-' + (from_date.getMonth() + 1) + '-' + from_date.getDate();
            let toDate_string = to_date.getFullYear() + '-' + (to_date.getMonth() + 1) + '-' + to_date.getDate();
            let dif = getTwoDateDiffirenceAsDays(fromDate_string, toDate_string);
            let p_to_date = new Date(from_date);
            p_to_date.setHours(23, 59, 59, 999);
            let p_from_date = new Date(getDateOfSpecificDayAgo(p_to_date, Math.abs(dif)));
            p_from_date.setHours(0, 0, 0, 0);
            p_cond[date_field_name] = {
                $lte: new Date(p_to_date),
                $gte: new Date(p_from_date)
            }
            req.prior_cond = p_cond;
            next()
        }
    }


    let logger = function(log_for) {
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

    let slug = function(model) {
        return (req, res, next) => {
            slugGenerate(model, req).then(newSlug => {
                req.slug = newSlug;
                req.body.lang[0].content.seo_url = newSlug.lang_seo_url;
                next();
            })
        }
    }


    // #### RESTful API Routes

    // ### Server Routes

    // Handle things like API calls,

    // #### Authentication routes

    // Pass in our Express app and Router.
    // Also pass in auth & admin middleware and Passport instance
    authRoutes(app, router, passport, auth);


    // Define a middleware function to be used for all secured administration
    // routes
    categoryRoutes(app, router, auth, slug);

    authorRoutes(app, router, auth, slug);
    publisherRoutes(app, router, auth, slug);
    productRoutes(app, router, auth, slug);

    userRoutes(app, router, auth);
    roleRoutes(app, router, auth);
    menuRoutes(app, router, auth)
    permissionRoutes(app, router);

    languageRoutes(app, router, auth);
    offerRoutes(app, router, auth);
    giftRoutes(app, router, auth);
    currencyRoutes(app, router, auth);
    lengthClassRoutes(app, router, auth);
    paymentGatewayRoutes(app, router, auth);
    weightClassRoutes(app, router, auth);
    orderStatusRoutes(app, router, auth);
    stockStatusRoutes(app, router, auth);
    testimonialRoutes(app, router, auth);
    ordersRoutes(app, router, auth);

    staticContentRoutes(app, router, auth);
    dynamicPageRoutes(app, router, auth);
    uploadedImagesPageRoutes(app, router, auth);

    newsRoutes(app, router, auth);
    attributeRoutes(app, router, auth);
    shippingAddressRoutes(app, router, auth);
    bannerRoutes(app, router, auth);
    blogRoutes(app, router, auth);
    homeblockRoutes(app, router, auth);
    videoContentRoutes(app, router, auth);
    promotionalImageRoutes(app, router, auth);
    promotionalCodeRoutes(app, router, auth);
    smsGenerationRoutes(app, router, auth);
    bulkSmsLogRoutes(app, router, auth);
    messageTemplate(app, router, auth);
    orderCarrierRoutes(app, router, auth, logger);
    paymentCollectionRoutes(app, router, auth);
    customerQueryRoutes(app, router, auth);
    subscriberRoutes(app, router, auth);
    bulkUpdateRoutes(app, router, auth);
    walletRoutes(app, router, auth);
    RefundRoutes(app, router, auth);
    SalesReport(app, router, auth);



    //**********************Inventory

    purchaseRoutes(app, router, auth, logger);
    stockRoutes(app, router, auth, logger);
    salesRoutes(app, router, auth, logger);
    suppierRoutes(app, router, auth, logger);
    employeeRoutes(app, router, auth, logger);
    purchaseOrderRoutes(app, router, auth, logger);
    inventoryRouters(app, router, auth);
    getScheduleTime();

    // MIS Reports
    dashboardRoutes(app, router, auth, log4js, dateRangeCond);
    publicVisitRoutes(app, router, auth);



    //CRM
    crmCallRecordRoutes(app, router, auth, logger)

    // ChartOfAccount
    chartOfAccountRoutes(app, router, auth, logger);
    voucherRoutes(app, router, auth, logger);
    costCenterRoutes(app, router, auth, logger);
    accountReportRoutes(app, router, auth)

    // File Upload
    const path = require('path');
    app.use(cors());

    // const upload = multer({
    //   storage: multer.diskStorage({
    //     destination: 'uploads/offer/',
    //     filename: (req, file, cb) => {
    //       let ext = path.extname(file.originalname);
    //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
    //     }
    //   })
    // });

    // app.post('/upload', upload.any(), (req, res) => {
    //   res.json(req.files.map(file => {
    //     let ext = path.extname(file.originalname);
    //     return {
    //       originalName: file.originalname,
    //       filename: file.filename
    //     }
    //   }));
    // });



    var fs = require('fs'),
        url = require('url'),
        dir = config.IMAGE_UPLOAD_PATH;

    app.get('/images/:model/:index/:dir/:size/:name', (req, res) => {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        var model = req.params.model + '/',
            index = req.params.index + '/',
            directory = req.params.dir + '/',
            size = req.params.size + '/';
        if (action == ('/images/' + model + index + directory + size + req.params.name)) {
            var img = fs.readFileSync(dir + model + index + directory + size + req.params.name);
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        } else {
            var img = fs.readFileSync(dir + 'no-photo.png');
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        }
    })

    app.get('/images/:model/:index/:dir/backcover/:size/:name', (req, res) => {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        var model = req.params.model + '/',
            index = req.params.index + '/',
            directory = req.params.dir + '/',
            size = req.params.size + '/';
        if (action == ('/images/' + model + index + directory + 'backcover/' + size + req.params.name)) {
            var img = fs.readFileSync(dir + model + index + directory + 'backcover/' + size + req.params.name);
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        } else {
            var img = fs.readFileSync(dir + 'no-photo.png');
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        }
    })

    app.get('/images/:model/:index/:dir/:type/:page_num/:size/:name', (req, res) => {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        var model = req.params.model + '/',
            index = req.params.index + '/',
            directory = req.params.dir + '/',
            size = req.params.size + '/',
            type = req.params.type + '/',
            page_num = req.params.page_num + '/';
        if (action == ('/images/' + model + index + directory + type + page_num + size + req.params.name)) {
            var img = fs.readFileSync(dir + model + index + directory + type + page_num + size + req.params.name);
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        } else {
            var img = fs.readFileSync(dir + 'no-photo.png');
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        }
    })


    app.get('/image/:model/:name', (req, res) => {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        var model = req.params.model + '/';
        if (action == ('/image/' + model + req.params.name)) {
            var img = fs.readFileSync(dir + model + req.params.name);
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        } else {
            var img = fs.readFileSync(dir + 'no-photo.jpg');
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        }
    })

    app.get('/images/:model/:type/:name', (req, res) => {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        var model = req.params.model + '/',
            type = req.params.type + '/'
        if (action == ('/images/' + model + type + req.params.name)) {
            var img = fs.readFileSync(dir + model + type + req.params.name);
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        } else {
            var img = fs.readFileSync(dir + 'no-photo.jpg');
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(img, 'binary');
        }
    })

    app.route('/upload-cropped-image-to-server.html')
        .get((req, res) => {
            res.sendFile('/server-resource/upload-cropped-image-to-server.html', {
                root: __dirname + "/../"
            });
        });
    app.route('/cropper.js')
        .get((req, res) => {
            res.sendFile('/server-resource/cropper.js', {
                root: __dirname + "/../"
            });
        });
    app.route('/cropper.css')
        .get((req, res) => {
            res.sendFile('/server-resource/cropper.css', {
                root: __dirname + "/../"
            });
        });

    // All of our routes will be prefixed with /admin/api
    app.use('/admin/api', router);
};
