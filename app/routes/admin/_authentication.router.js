import config from '../../../config/config.json'
import User from '../../models/user.model.js';
import Role from '../../models/role.model';

let ObjectId = require('mongoose').Types.ObjectId;
var jwt = require('jsonwebtoken');

export default (app, router, passport, auth) => {

  router.get('/auth/loggedIn', (req, res) => {
    res.send(req.isAuthenticated() ? req.user : '0');
  }); 

  router.post('/auth/login', (req, res, next) => {
   
    passport.authenticate('local-login', (err, user, info) => {

      if (err)
        return next(err);

      if (!user) {
        return res.json({
          message: info.loginMessage
        });
      }

      req.login(user, (err) => {

        if (err)
          return next(err);
        res.status(200);
        let super_secret = config.SESSION_SECRET;
        var usr = {
          _id: user._id,
          agent: user.agent,
          distributor: user.distributor,
          area: user.area,
          store: user.store,
          local: user.local,
          user_type: user.user_type,
          role: {
            _id: user.role._id,
            name: user.role.name
          }
        }
        var token = jwt.sign(usr, super_secret, {
          expiresIn: 500 * 24 * 60 * 60
        });

        res.cookie('admin_token', token);
        res.json({
          user: user,
          success: true,
          admin_token: token
        });
      });

    })(req, res, next);
  });

  router.post('/auth/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {

        if (err)
          return next(err);
        if (!user) {
          return res.json({
            message: info.signupMessage
          })
        }
        res.json({
          _id: user._id,
          message: "User Add Success....."
        })

      })
      (req, res, next);
  });


  router.post('/auth/logout', (req, res) => {
    req.logOut();
    res.clearCookie("admin_token");
    // res.cookie('admin_token', '', {expires: new Date(0)});
    res.json({
      success: true
    });
  });



  router.get('/auth/user', auth, (req, res) => {
    res.json(req.user);
  });


  router.route('/auth/change-password')
    .put((req, res, next) => {

      let token = req.cookies.admin_token || req.headers['admin_token'];
      jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
        if (err) {
          //console.log(err);
          res.json({
            success: false,
            message: 'Please login first'
          });
        } else {

          let user = decoded;
          req.body.username = user.local.username;
          passport.authenticate('local-auth-change-password', (err, user, info) => {
            if (err)
              return next(err);
            if (!user) {
              return res.json({
                message: info.loginMessage
              });
            }
            req.login(user, (err) => {
              if (err)
                return next(err);
              res.status(200);
              res.json({
                userename: user.local.username,
                message: 'Password Updated Successfully!'
              });
            });

          })(req, res, next);

        }
      })
    });
};
