import PublicVisit from '../../models/public-visitor.model';
import VisitorBrowserCounter from '../../models/visitors-browser-counter.model'

export default (app, router, cache) => {
  router.route('/visitor-track')
    .post((req, res) => {

      if (req.body.userAgent) {
        req.useragent = req.body.userAgent;
      }
      if (req.body.referrer) {
        req.referrer = req.body.referrer;
      }
      updateVisitorCounter(req);
      PublicVisit.create({
        fingerprint: req.body.fingerprint,
        first_visit_at: new Date(),
        visited_at: new Date(),
        visiting_ip: req.body.ip,
        user_agent: req.useragent,
        referrer_site: req.referrer
      }, (err, publicvisit) => {
        if (!err) {
          res.cookie('trackingKey', getSimpleDate())
          res.json({
            isTracked: true
          })
        } else {
          res.json(err)
        }
      })
    })


  function updateVisitorCounter(req) {
    let user_agent;
    let inc_field = new Object();
    inc_field['total_visit'] = 1;

    if (req.body.userAgent) {
      user_agent = req.body.userAgent;
      if (user_agent.device_type == 'Desktop') {
        inc_field['desktop'] = 1;
        if (user_agent.browser == 'Chrome') {
          inc_field['chrome'] = 1;
        } else if (user_agent.browser == 'Firefox') {
          inc_field['firefox'] = 1;
        } else if (user_agent.browser == 'Safari') {
          inc_field['safari'] = 1;
        } else if (user_agent.browser == 'Opera') {
          inc_field['opera'] = 1;
        }
      } else if (user_agent.device_type == 'Mobile') {
        inc_field['mobile'] = 1;
        if (user_agent.browser == 'Chrome') {
          inc_field['chrome_mobile'] = 1;
        } else if (user_agent.browser == 'Firefox') {
          inc_field['firefox'] = 1;
        } else if (user_agent.browser == 'Safari') {
          inc_field['mobile_safari'] = 1;
        } else if (user_agent.browser == 'Opera') {
          inc_field['opera'] = 1;
        }
      } else {
        inc_field['tablet'] = 1;
        if (user_agent.browser == 'Chrome') {
          inc_field['chrome_mobile'] = 1;
        } else if (user_agent.browser == 'Firefox') {
          inc_field['firefox'] = 1;
        } else if (user_agent.browser == 'Safari') {
          inc_field['mobile_safari'] = 1;
        } else if (user_agent.browser == 'Opera') {
          inc_field['opera'] = 1;
        }
      }

    } else {
      user_agent = req.useragent;
      if (user_agent.isChrome && user_agent.isDesktop) inc_field['chrome'] = 1;
      if (user_agent.isOpera) inc_field['opera'] = 1;
      if (user_agent.isSafari && user_agent.isDesktop) inc_field['safari'] = 1;
      if (user_agent.isDesktop) inc_field['desktop'] = 1;
      if (user_agent.isMobile) inc_field['mobile'] = 1;
      if (user_agent.isTablet) inc_field['tablet'] = 1;
      if (user_agent.isFirefox && user_agent.isDesktop) inc_field['firefox'] = 1;
      if (user_agent.isChrome && (user_agent.isMobile || user_agent.isTablet)) inc_field['chrome_mobile'] = 1;
      if (user_agent.isSafari && (user_agent.isMobile || user_agent.isTablet)) inc_field['mobile_safari'] = 1;
    }


    VisitorBrowserCounter.update({
        _id: 'visiting_counter'
      }, {
        $inc: inc_field
      }, {
        new: true
      })
      .exec()
      .then(result => {
        //console.log(result);
      })
  }

  function getSimpleDate() {
    let today = new Date();
    return today.getDate() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getFullYear();
  }
}
