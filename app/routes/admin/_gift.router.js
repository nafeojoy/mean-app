import Gift from '../../models/gift.model';

export default (app, router, auth) => {
  router.route('/gift')
    .get(auth, (req, res, next) => {
      Gift.find()
        .exec((err, gift) => {
          if (err) {
            res.send(err)
          }
          res.json(gift)
        })
    })
    .post(auth, (req, res) => {
      Gift.create({
        name: req.body.name,
        description: req.body.description,
        is_enabled: req.body.is_enabled,
        gift_cost: req.body.gift_cost,
        estimated_qty: req.body.estimated_qty,
        allocated_qty: req.body.allocated_qty,
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, gift) => {
        if (err)
          res.send(err);
        else
          res.json(gift);
      });
    })

  router.route('/gift/by-name/:name')
    .get((req, res) => {
      Gift.findOne({ name: req.params.name })
        .select({ name: 1 })
        .exec()
        .then(gift => {
          res.send(gift)
        })
        .catch(err => {
          res.send(err);
        })
    })


  router.route('/gift/:id')
    .get(auth, (req, res) => {
      Gift.findOne({
        '_id': req.params.id
      }, (err, gift) => {
        if (err) {
          res.send(err);
        }
        res.send(gift)
      })
    })

    .put(auth, (req, res) => {
      Gift.findOne({
        '_id': req.params.id
      }, (err, gift) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          gift.name = req.body.name;
          gift.description = req.body.description;
          gift.is_enabled = req.body.is_enabled;
          gift.gift_cost = req.body.gift_cost;
          gift.estimated_qty = req.body.estimated_qty;
          gift.allocated_qty = req.body.allocated_qty;
          gift.created_by = req.user._id;
          gift.updated_by = req.user._id
        }
        return gift.save((err) => {
          if (err)
            res.send(err);

          return res.send(gift);

        });
      })

    })

    .delete(auth, (req, res) => {
      Gift.remove({
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

  router.route('/gift/list/active')
    .get((req, res) => {
      Gift.find({
        'is_enabled': true
      }, (err, status) => {
        if (err)
          res.send(err)
        else
          res.json(status);
      })
    })

}
