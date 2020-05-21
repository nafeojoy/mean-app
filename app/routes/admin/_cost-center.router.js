import CostCenter from '../../models/cost-center.model';

export default (app, router, auth, logger) => {
  router.route('/cost-center')
    .get((req, res) => {
      CostCenter.find({ is_enabled: true })
        .exec()
        .then(costCenters => {
          res.json(costCenters)
        })
        .catch(err => {
          let empty = [];
          res.json(empty)
        })
    })

    .post(auth, (req, res) => {
      CostCenter.create({
        name: req.body.name,
        is_enabled: req.body.is_enabled,
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, costCenter) => {
        if (err) {
          res.send(err);
        }
        res.json(costCenter);
      });
    });

  router.route('/cost-center/:id')
    .get(auth, (req, res) => {
      CostCenter.findOne({
        '_id': req.params.id
      }, (err, costCenter) => {
        if (err) {
          res.send(err);
        }
        res.send(costCenter)
      })
    })

    .put(auth, (req, res) => {
      CostCenter.findOneAndUpdate({
        '_id': req.params.id
      }, {
          $set: {
            name: req.body.name,
            is_enabled: req.body.is_enabled
          }
        }, {
          new: true
        }, (err, costCenter) => {
          if (err) {
            res.send(err)
          }
          res.send(costCenter)
        })
    })

    .delete(auth, (req, res) => {
      CostCenter.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'CostCenter Deleted',
          'status': true
        })
      })
    })
}
