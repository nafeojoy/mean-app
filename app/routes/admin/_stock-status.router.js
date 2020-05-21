import StockStatus from '../../models/stock-status.model';
import Language from '../../models/language.model';

export default (app, router, auth) => {
  router.route('/stock-status')
    .get(auth, (req, res, next) => {
      StockStatus.find((err, stockStatus) => {
        if (err) {
          res.send(err)
        }
        res.json(stockStatus)
      })
    })

    .post(auth, (req, res) => {
      Language.find({
          is_enabled: 1
        })
        .exec()
        .then(languages => {
          var stockStatus = new StockStatus();
          languages.forEach(function (lang) {
            stockStatus.set('name.' + lang.code, req.body.name[lang.code]);
          });
          stockStatus.is_enabled = req.body.is_enabled;

          stockStatus.save((err, stockStatus) => {
            if (err) {
              res.send(err);
            }
            res.json(stockStatus);
          });
        })
        .catch(err => {
          res.send(err);
        });
    });

  router.route('/stock-status/:id')
    .get(auth, (req, res) => {
      StockStatus.findOne({
        '_id': req.params.id
      }, (err, stockStatus) => {
        if (err) {
          res.send(err);
        }
        res.send(stockStatus)
      })
    })

    .put(auth, (req, res) => {
      Language.find({
          is_enabled: 1
        })
        .exec()
        .then(languages => {
          let updateValues = {
            name: {}
          };
          languages.forEach(function (lang) {
            updateValues.name[lang.code] = req.body.name[lang.code];
          });
          updateValues.is_enabled = req.body.is_enabled;

          return updateValues;
        })
        .then(updateValues => {
          StockStatus.findOneAndUpdate({
            '_id': req.params.id
          }, {
            $set: updateValues
          }, {
            new: true
          }, (err, stockStatus) => {
            if (err) {
              res.send(err)
            }
            res.send(stockStatus)
          })
        })
        .catch(err => {
          res.send(err);
        })

    })

    .delete(auth, (req, res) => {
      StockStatus.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Stock Status Deleted',
          'status': true
        })
      })
    })
}
