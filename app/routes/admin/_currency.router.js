import Currency from '../../models/currency.model';

export default (app, router, auth) => {
  router.route('/currency')
    .get(auth, (req, res, next) => {
      Currency.find((err, currencies) => {
        if (err) {
          res.send(err)
        }
        res.json(currencies)
      })
    })

    .post(auth, (req, res) => {
      Currency.create({
        title: req.body.title,
        code: req.body.code,
        symbol_left: req.body.symbol_left,
        symbol_right: req.body.symbol_right,
        value: req.body.value,
        decimal_place: req.body.decimal_place,
        is_enabled: req.body.is_enabled,
        order: req.body.order
      }, (err, currency) => {
        if (err) {
          res.send(err);
        }
        res.json(currency);
      });
    });

  router.route('/currency/:id')
    .get(auth, (req, res) => {
      Currency.findOne({
        '_id': req.params.id
      }, (err, currency) => {
        if (err) {
          res.send(err);
        }
        res.send(currency)
      })
    })

    .put(auth, (req, res) => {
      Currency.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          title: req.body.title,
          code: req.body.code,
          symbol_left: req.body.symbol_left,
          symbol_right: req.body.symbol_right,
          value: req.body.value,
          decimal_place: req.body.decimal_place,
          is_enabled: req.body.is_enabled,
          order: req.body.order
        }
      }, {
        new: true
      }, (err, currency) => {
        if (err) {
          res.send(err)
        }
        res.send(currency)
      })
    })

    .delete(auth, (req, res) => {
      Currency.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Currency Deleted',
          'status': true
        })
      })
    })
}
