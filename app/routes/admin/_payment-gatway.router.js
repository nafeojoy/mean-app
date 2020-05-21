import PaymentGateway from '../../models/payment-gateway.model';

export default (app, router, auth) => {
  router.route('/payment-gateway')
    .get(auth, (req, res, next) => {
      PaymentGateway.find((err, directPaymentes) => {
        if (err) {
          res.send(err)
        }
        res.json(directPaymentes)
      })
    })

    .post(auth, (req, res) => {
      PaymentGateway.create({
        name: req.body.name,
        is_enabled: req.body.is_enabled,
        created_by: req.user._id
      }, (err, directPayment) => {
        if (err) {
          res.send(err);
        }
        res.json(directPayment);
      });
    });

  router.route('/payment-gateway/:id')
    .get(auth, (req, res) => {
      PaymentGateway.findOne({
        '_id': req.params.id
      }, (err, directPayment) => {
        if (err) {
          res.send(err);
        }
        res.send(directPayment)
      })
    })

    .put(auth, (req, res) => {
      PaymentGateway.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          name: req.body.name,
          updated_by: req.user._id,
          updated_at: new Date(),
          is_enabled: req.body.is_enabled
        }
      }, {
        new: true
      }, (err, directPayment) => {
        if (err) {
          res.send(err)
        }
        res.send(directPayment)
      })
    })

    .delete(auth, (req, res) => {
      PaymentGateway.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'PaymentGateway Deleted',
          'status': true
        })
      })
    })
}
