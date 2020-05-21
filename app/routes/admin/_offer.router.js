import Offer from '../../models/offer.model';

export default (app, router, auth) => {
  router.route('/offer')
    .get((req, res, next) => {
      Offer.find((err, offers) => {
        if (err) {
          res.send(err)
        }
        res.json(offers)
      })
    })

    .post(auth, (req, res) => {
      Offer.create({
        name: req.body.name,
        image: req.body.image,
        created_by: req.user._id,
        created_at: new Date()
      }, (err, offer) => {
        if (err) {
          res.send(err);
        }
        res.json(offer);
      });
    });

  router.route('/offer/:id')
    .get(auth, (req, res) => {
      Offer.findOne({
        '_id': req.params.id
      }, (err, offer) => {
        if (err) {
          res.send(err);
        }
        res.send(offer)
      })
    })

    .put(auth, (req, res) => {
      Offer.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          name: req.body.name,
          image: req.body.image
        }
      }, {
        new: true
      }, (err, offer) => {
        if (err) {
          res.send(err)
        }
        res.send(offer)
      })
    })

    .delete(auth, (req, res) => {
      Offer.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Offer Deleted',
          'status': true
        })
      })
    })
}
