import SmsGeneration from '../../models/sms-generation.model';
import {
  sendMessage
} from './text-message.service';

export function getScheduleTime() {

  var current_date = new Date();
  current_date.setHours(current_date.getHours() + 6);
  SmsGeneration.findOne({
    'schedule_time': {
      $gt: current_date
    },
    'sent_time': {
      $exists: false
    },
    'is_cancelled': {
      $ne: true
    }
  }, (err, smsGeneration) => {
    if (err) {

    } else {
      if (smsGeneration) {
        var schedule = require('node-schedule');
        var date = smsGeneration.schedule_time;
        var j = schedule.scheduleJob(date.setHours(date.getHours() - 6), function () {
          smsGeneration.sent_time = smsGeneration.schedule_time;
          smsGeneration.save(err => {
            if (err) {

            } else {
              sendMessage({
                phone_numbers: smsGeneration.phone_numbers,
                text: smsGeneration.message_text,
                sms_sent_for: smsGeneration.sms_type,
                generation_id: smsGeneration._id
              })
            }
          })
          getScheduleTime();
        });


      }
    }
  }).sort({
    "schedule_time": 1
  }).limit(1)
}


export default (app, router, auth) => {

  router.route('/sms-generation')
    .get((req, res, next) => {
      SmsGeneration.find({
        'is_cancelled': {
          $ne: true
        }
      }, (err, smsGenerations) => {
        if (err) {
          res.send(err);
        }
        res.json(smsGenerations)
      })
    })

    .post(auth, (req, res) => {
      SmsGeneration.create({
        message_text: req.body.message_text,
        phone_numbers: req.body.phone_numbers,
        number_count: req.body.number_count,
        generation_time: req.body.generation_time,
        schedule_time: req.body.schedule_time,
        sent_time: req.body.sent_time,
        sms_type: req.body.sms_type,
        ref_id: req.body.ref_id,
        is_success: req.body.is_success,
        created_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, smsGeneration) => {
        if (err) {
          res.send(err);
        }
        getScheduleTime();
        res.json(smsGeneration);
      })
    });

  router.route('/sms-generation/type/:type')
    .get((req, res) => {


      SmsGeneration.find()
        .where('sms_type').equals(req.params.type)
        .where('is_cancelled').ne(true)
        .populate({
          path: 'created_by'
        })
        .sort({
          generation_time: -1
        })
        .exec((err, smsGeneration) => {
          if (err)
            res.send(err)
          res.json(smsGeneration)
        })
    })

  router.route('/sms-generation/edit/:id')

    .put((req, res) => {

      SmsGeneration.findOne({
          '_id': req.params.id
        })
        .exec((err, smsGeneration) => {
          if (err) {
            res.send(err);
          } else {
            smsGeneration.message_text = req.body.message_text;
            smsGeneration.save(err => {
              if (err) {
                res.json({
                  success: false,
                  message: "Edit Failed!"
                })
              } else {
                res.json({
                  success: true,
                  message: "Edit Successful!"
                })
              }
            })
          }
        })
    })

  router.route('/sms-generation/:id')

    .get((req, res) => {
      SmsGeneration.findOne({
          '_id': req.params.id
        })
        .exec((err, smsGeneration) => {
          if (err)
            res.send(err);
          else {

            res.json(smsGeneration);
          }
        })
    })


    .put((req, res) => {



      SmsGeneration.findOne({
          '_id': req.params.id
        })
        .exec((err, smsGeneration) => {

          if (err) {
            res.send(err);
          } else {
            smsGeneration.sent_time = new Date();
            smsGeneration.save(err => {
              if (err) {
                res.json({
                  success: false,
                  message: "SMS Sending Failed!"
                })
              } else {
                sendMessage({
                  phone_numbers: req.body.phone_numbers,
                  text: req.body.message_text,
                  sms_sent_for: req.body.sms_type,
                  generation_id: req.body._id
                })
                res.json({
                  success: true,
                  message: "SMS Sending Successful!"
                })
              }
            })

          }
        })
    })

  router.route('/sms-generation/cancel/:id')
    .put((req, res) => {
      SmsGeneration.findOne({
          '_id': req.params.id
        })
        .exec((err, smsGeneration) => {
          if (err) {
            res.send(err);
          } else {
            smsGeneration.is_cancelled = true;
            smsGeneration.save(err => {
              if (err) {
                res.json({
                  success: false,
                  message: "SMS Cancelletion Failed!"
                })
              } else {
                res.json({
                  success: true,
                  message: "SMS Cancelletion Successful!"
                })
              }
            })

          }
        })
    })
}
