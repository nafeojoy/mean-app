import Attributes from '../../models/attributes.model';

export default (app, router, auth) => {
  router.route('/attributes')
    .get((req, res, next) => {
      Attributes.find((err, attributes) => {
        if (err) {
          res.send(err)
        }
        res.json(attributes)
      })
    }) 

    .post(auth, (req, res) => {
      Attributes.create({
        name: req.body.name,
        lang: req.body.lang,
        is_featured: req.body.is_featured,
        featured_order: req.body.featured_order,
        is_enabled: req.body.is_enabled,
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, attributes) => {
        if (err) {
          //console.log(err);
          res.send(err);
        }
        res.json(attributes);
      });
    });


  router.route('/featured_attributes')
    .get((req, res) => {
      Attributes.find()
        .where('is_featured').equals(true)
        .sort({
          featured_order: 1
        })
        .exec((err, attributes) => {
          if (err)
            res.send(err);

          res.json(attributes)
        })
    })

    .post(auth, (req, res) => {
      var featured_attributes = req.body;
      updateAttribute(featured_attributes).then(result => {
        res.json({
          success: true
        })
      }).catch(err => {
        res.json({
          message: err.message
        })
      })

    })
  router.route('/featured_attributes/:id')
    .put((req, res) => {
      Attributes.findOne({
          "_id": req.params.id
        })
        .exec((err, attribute) => {
          // attribute.is_featured= req.body.is_featured;
          // attribute.featured_order= req.body.featured_order;
          attribute.is_featured = false;
          attribute.featured_order = 0;
          return attribute.save((err) => {
            if (err)
              res.send(err)

            res.json({
              status: true
            });
          })
        })
    })

  function updateAttribute(attributes) {
    var attributePromises = attributes.map((attributeObj, i) => {
      return new Promise((resolve, reject) => {
        Attributes.findOne({
            '_id': attributeObj._id
          })
          .exec((err, attribute) => {
            attribute.is_featured = true;
            attribute.featured_order = (i + 1);
            attribute.save((err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            })
          })
      })
    })
    return Promise.all(attributePromises);
  }

  router.route('/attributes/:id')
    .get((req, res) => {
      Attributes.findOne({
        '_id': req.params.id
      }, (err, attribute) => {
        if (err) {
          res.send(err);
        }
        res.send(attribute)
      })
    })

    .put(auth, (req, res) => {
      Attributes.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          name: req.body.name,
          lang: req.body.lang,
          is_featured: req.body.is_featured,
          featured_order: req.body.featured_order,
          is_enabled: req.body.is_enabled,
          updated_by: req.user._id
        }
      }, {
        new: true
      }, (err, attribute) => {
        if (err) {
          res.send(err)
        }
        res.send(attribute)
      })
    })

    .delete(auth, (req, res) => {
      Attributes.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'attributes Deleted',
          'status': true
        })
      })
    })


  router.route('/attributes/search/v1')
    .get((req, res) => {
      var pageNum = 1,
        itemsPerPage = 10;

      var terms = req.query.search;
      if (req.query.page) {
        pageNum = req.query.page;
      }
      if (req.query.limit) {
        itemsPerPage = req.query.limit;
      }

      let expression = '.*' + terms + '.*';
      let searchConditions = {
        "name": {
          $regex: expression,
          $options: 'i'
        }
      };

      Attributes.find(searchConditions)
        .count((err, count) => {
          return count
        })
        .then(count => {
          Attributes.find(searchConditions)
            .skip(itemsPerPage * (pageNum - 1))
            .limit(itemsPerPage)
            .exec((err, attributes) => {
              if (err)
                res.send(err);
              else
                res.json({
                  'items': attributes,
                  'count': count
                });
            })
        })
        .catch(err => {
          res.send(err);
        })
    });
}
