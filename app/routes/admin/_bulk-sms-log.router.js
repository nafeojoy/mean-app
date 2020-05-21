import BulkSmsLog from '../../models/bulk-sms-log.model';

export default (app, router, auth) => {

  router.route('/bulk-sms-log')
    .get((req, res, next) => {
      BulkSmsLog.find((err, bulkSmsLogs) => {
        if (err) {
          res.send(err);
        }
        res.json(bulkSmsLogs)
      })
    })

    .post(auth, (req, res) => {
      BulkSmsLog.create({
        message_text: req.body.message_text,
        generation_time: req.body.generation_time,
        phone_number: req.body.phone_number,
        sms_log: req.body.sms_log,
        schedule_time: req.body.schedule_time,
        sent_time: req.body.sent_time,
        sms_type: req.body.sms_type,
        ref_id: req.body.ref_id,
        is_success: req.body.is_success,
        created_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, bulkSmsLogs) => {
        if (err) {
          res.send(err);
        }
        res.json(bulkSmsLogs);
      })
    });

}
