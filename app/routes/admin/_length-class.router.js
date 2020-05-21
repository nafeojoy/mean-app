import LengthClass from '../../models/length-class.model';

export default (app, router, auth) => {
  router.route('/length-class')
    .get(auth, (req, res, next) => {
      LengthClass.find((err, lengthClasses) => {
        if (err) {
          res.send(err)
        }
        res.json(lengthClasses)
      })
    })

    .post(auth, (req, res) => {
      LengthClass.create({
        title: req.body.title,
        unit: req.body.unit,
        value: req.body.value,
        is_enabled: req.body.is_enabled
      }, (err, lengthClass) => {
        if (err) {
          res.send(err);
        }
        res.json(lengthClass);
      });
    });

  router.route('/length-class/:id')
    .get(auth, (req, res) => {
      LengthClass.findOne({
        '_id': req.params.id
      }, (err, lengthClass) => {
        if (err) {
          res.send(err);
        }
        res.send(lengthClass)
      })
    })

    .put(auth, (req, res) => {
      LengthClass.findOneAndUpdate({
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
      }, (err, lengthClass) => {
        if (err) {
          res.send(err)
        }
        res.send(lengthClass)
      })
    })

    .delete(auth, (req, res) => {
      LengthClass.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'LengthClass Deleted',
          'status': true
        })
      })
    })
}
