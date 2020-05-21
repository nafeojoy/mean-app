
import cors from 'cors';
import jwt from 'jsonwebtoken';
import config from '../config/config.json';
import authorUpload from './routes/upload/author.router';
import publisherUpload from './routes/upload/publisher.router';
import categoryUpload from './routes/upload/category.router';
import productUpload from './routes/upload/product.router';
import otherUploads from './routes/upload/other-upload.router';

export default (app, router) => {

  router.use((req, res, next) => {
    next();
  });

  // Define a middleware function to be used for all secured routes
  let auth = (req, res, next) => {
    let token = req.cookies.admin_token || req.headers['admin_token'];
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


  app.use(cors());

  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
  });

  authorUpload(app, router, auth);
  publisherUpload(app, router, auth);
  categoryUpload(app, router, auth);
  productUpload(app, router, auth);
  otherUploads(app, router, auth);
  
  app.use('/upload/api', router);

};
