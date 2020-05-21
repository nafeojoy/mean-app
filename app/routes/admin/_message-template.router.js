import MessageTemplate from '../../models/message-template.model';

export default (app, router, auth) => {
  router.route('/message-template')
    .get((req, res, next) => {
      MessageTemplate.find((err, messageTemplate) => {
        if (err) {
          res.send(err);
        }
        res.json(messageTemplate)
      })
    })

    .post(auth, (req, res) => {
      MessageTemplate.create({
        template_name: req.body.template_name,
        message_text: req.body.message_text,
        created_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, messageTemplate) => {
        if (err) {
          res.send(err);
        }
        res.json(messageTemplate);
      })
    });
}
