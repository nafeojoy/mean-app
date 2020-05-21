import Language from '../../models/language.model';

export default (app, router, auth) => {
  router.route('/language')
    .get((req, res, next) => {
      Language.find((err, languages) => {
        if (err) {
          res.send(err)
        }
        res.json(languages)
      })
    })

    .post(auth, (req, res) => {
      Language.create({
        name: req.body.name,
        code: req.body.code,
        locale: req.body.locale,
        is_enabled: req.body.is_enabled,
        order: req.body.order
      }, (err, language) => {
        if (err) {
          res.send(err);
        }
        res.json(language);
      });
    });

  router.route('/language/:id')
    .get(auth, (req, res) => {
      Language.findOne({
        '_id': req.params.id
      }, (err, language) => {
        if (err) {
          res.send(err);
        }
        res.send(language)
      })
    })

    .put(auth, (req, res) => {
      Language.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          name: req.body.name,
          code: req.body.code,
          locale: req.body.locale,
          is_enabled: req.body.is_enabled,
          order: req.body.order
        }
      }, {
        new: true
      }, (err, language) => {
        if (err) {
          res.send(err)
        }
        res.send(language)
      })
    })

    .delete(auth, (req, res) => {
      Language.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Language Deleted',
          'status': true
        })
      })
    })
}
