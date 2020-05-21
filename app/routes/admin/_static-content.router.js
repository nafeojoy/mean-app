import StaticContent from '../../models/static-content.model';
export default (app, router, auth) => {

  router.route('/static-content')
    .get((req, res) => {
      StaticContent.find((err, staticContent) => {
        if (err) {
          res.send(err)
        }
        res.json(staticContent)
      })
    })

    .post(auth, (req, res) => {
      StaticContent.create({
        title: req.body.title,
        content_url: req.body.content_url,
        content: req.body.content,
        meta_tag_title: req.body.meta_tag_title,
        meta_tag_description: req.body.meta_tag_description,
        meta_tag_keywords: req.body.meta_tag_keywords,
        lang: req.body.lang,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, staticContent) => {
        if (err) {
          res.send(err);
        }
        res.json(staticContent);
      });
    });

  router.route('/static-content/:id')

    .get((req, res) => {
      StaticContent.findOne({
          '_id': req.params.id
        })
        .exec((err, staticContent) => {
          if (err)
            res.send(err);
          else
            res.json(staticContent);
        })
    })

    .put(auth, (req, res) => {
      StaticContent.findOne({
        '_id': req.params.id
      }, (err, staticContent) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          staticContent.title = req.body.title;
          staticContent.content_url = req.body.content_url;
          staticContent.content = req.body.content;
          staticContent.meta_tag_title = req.body.meta_tag_title;
          staticContent.meta_tag_description = req.body.meta_tag_description;
          staticContent.meta_tag_keywords = req.body.meta_tag_keywords;
          staticContent.lang = req.body.lang;
          staticContent.updated_at = new Date();
          staticContent.updated_by = req.user._id
        }
        return staticContent.save((err) => {
          if (err)
            res.send(err);

          return res.send(staticContent);
        });
      })
    })
    .delete(auth, (req, res) => {
      StaticContent.remove({
        _id: req.params.id
      }, (err, restData) => {
        if (err)
          res.send(err);
        else
          res.send({
            "message": "Data Deleted",
            "status": 1
          });
      });
    });

}
