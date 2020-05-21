import CustomerFeedback from '../../models/customerfb.model';
import config from '../../../config/config.json'

export default (app, router) => {
  router.route('/customer-feedback')
    .get((req, res) => {
      let pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
      CustomerFeedback.find()
        .skip(10 * (pageNum - 1))
        .limit(10)
        .sort({
          'created_at': -1
        })
        .exec((err, feedback) => {
          if (err)
            res.send(err);
          else
            res.json(feedback)
        })
    })
    .post((req, res) => {
      CustomerFeedback.create({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
        created_at: new Date()
      }, (err, feedback) => {
        if (!err && feedback && feedback._id) {
          res.json({
            success: true
          });
        } else {
          res.json({
            success: false
          });
        }
      })
    })
}
