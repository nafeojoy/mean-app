import WeightClass from '../../models/weight-class.model';

export default (app, router, auth) => {
  router.route('/weight-class')
    .get(auth, (req, res, next) => {
      WeightClass.find((err, weightClasses) => {
        if (err) {
          res.send(err)
        }
        res.json(weightClasses)
      })
    })

    .post(auth, (req, res) => {
      WeightClass.create({
        title: req.body.title,
        unit: req.body.unit,
        value: req.body.value,
        is_enabled: req.body.is_enabled
      }, (err, weightClass) => {
        if (err) {
          res.send(err);
        }
        res.json(weightClass);
      });
    });

  router.route('/weight-class/:id')
    .get(auth, (req, res) => {
      WeightClass.findOne({
        '_id': req.params.id
      }, (err, weightClass) => {
        if (err) {
          res.send(err);
        }
        res.send(weightClass)
      })
    })

    .put(auth, (req, res) => {
      WeightClass.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          title: req.body.title,
          unit: req.body.unit,
          value: req.body.value,
          is_enabled: req.body.is_enabled
        }
      }, {
        new: true
      }, (err, weightClass) => {
        if (err) {
          res.send(err)
        }
        res.send(weightClass)
      })
    })

    .delete(auth, (req, res) => {
      WeightClass.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'WeightClass Deleted',
          'status': true
        })
      })
    })
}
