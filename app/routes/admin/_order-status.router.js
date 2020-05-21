import OrderStatus from '../../models/order-status.model';

export default (app, router, auth) => {
  router.route('/order-status')
    .get(auth, (req, res, next) => {
      OrderStatus.find()
        .sort({
          seq: 1
        })
        .exec((err, orderStatus) => {
          if (err) {
            res.send(err)
          }
          res.json(orderStatus)
        })
    })
    .post(auth, (req, res) => {
      OrderStatus.create({
        name: req.body.name,
        description: req.body.description,
        is_enabled: req.body.is_enabled,
        prinit_inprocess: req.body.prinit_inprocess,
        send_message: req.body.send_message,
        message_text: req.body.message_text,
        lang: req.body.lang,
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, orderStatus) => {
        if (err)
          res.send(err);
        else
          res.json(orderStatus);
      });
    })

  router.route('/order-status/by-name/:name')
    .get((req, res) => {
      OrderStatus.findOne({ name: req.params.name })
        .select({ name: 1 })
        .exec()
        .then(orderStatus => {
          res.send(orderStatus)
        })
        .catch(err => {
          res.send(err);
        })
    })

  router.route('/order-status/list/for-aging')
    .get(auth, (req, res) => {
      OrderStatus.find({
        name:{$in:['Pending', 'Confirmed', 'Inshipment', 'Dispatch']}
      })
      .select({name:1})
      .sort({seq:1})
      .exec()
      .then(status=>{
        res.json({success: true, data: status});
      })
      .catch(err=>{
        res.json({success: false, err: err});
      })
    })

  router.route('/order-status/:id')
    .get(auth, (req, res) => {
      OrderStatus.findOne({
        '_id': req.params.id
      }, (err, orderStatus) => {
        if (err) {
          res.send(err);
        }
        res.send(orderStatus)
      })
    })

    .put(auth, (req, res) => {
      OrderStatus.findOne({
        '_id': req.params.id
      }, (err, orderStatus) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          orderStatus.name = req.body.name;
          orderStatus.description = req.body.description;
          orderStatus.is_enabled = req.body.is_enabled;
          orderStatus.prinit_inprocess = req.body.prinit_inprocess;
          orderStatus.send_message = req.body.send_message;
          orderStatus.message_text = req.body.message_text;
          orderStatus.lang = req.body.lang;
          orderStatus.updated_by = req.user._id;
        }
        return orderStatus.save((err) => {
          if (err)
            res.send(err);

          return res.send(orderStatus);

        });
      })

    })

    .delete(auth, (req, res) => {
      OrderStatus.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Order Status Deleted',
          'status': true
        })
      })
    })

  router.route('/active-order-status')
    .get((req, res) => {
      OrderStatus.find({
        'is_enabled': true
      }, (err, status) => {
        if (err) {
          res.send(err)
        }
        res.json(status);
      })
    })
}
