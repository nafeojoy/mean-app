import DynamicPage from '../../models/dynamic-page.model';
import cors from 'cors';
import multer from 'multer';
export default (app, router, auth) => {

  router.route('/dynamic-page')
    .get((req, res) => {
      DynamicPage.find((err, dynamicPage) => {
        if (err) {
          res.send(err)
        }
        res.json(dynamicPage)
      })
    })

    .post(auth, (req, res) => {
      DynamicPage.create({
        title: req.body.title,
        content_url: req.body.content_url,
        content: req.body.content,
        meta_tag_title: req.body.meta_tag_title,
        meta_tag_description: req.body.meta_tag_description,
        meta_tag_keywords: req.body.meta_tag_keywords,
        lang: req.body.lang,
        image: req.body.image,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, dynamicPage) => {
        if (err) {
          res.send(err);
        }
        res.json(dynamicPage);
      });
    });

  // const path = require('path');
  // app.use(cors());

  // const upload = multer({
  //   storage: multer.diskStorage({
  //     destination: 'uploads/article/',
  //     filename: (req, file, cb) => {
  //       let ext = path.extname(file.originalname);
  //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  //     }
  //   })
  // });

  // router.post('/upload/article', upload.any(), (req, res) => {
  //   res.json(req.files.map(file => {
  //     let ext = path.extname(file.originalname);
  //     return {
  //       originalName: file.originalname,
  //       filename: file.filename
  //     }
  //   }));
  // });

  router.route('/dynamic-page/:id')

    .get((req, res) => {
      DynamicPage.findOne({
          '_id': req.params.id
        })
        .exec((err, dynamicPage) => {
          if (err)
            res.send(err);
          else
            res.json(dynamicPage);
        })
    })

    .put(auth, (req, res) => {
      DynamicPage.findOne({
        '_id': req.params.id
      }, (err, dynamicPage) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          dynamicPage.title = req.body.title;
          dynamicPage.content_url = req.body.content_url;
          dynamicPage.content = req.body.content;
          dynamicPage.meta_tag_title = req.body.meta_tag_title;
          dynamicPage.meta_tag_description = req.body.meta_tag_description;
          dynamicPage.meta_tag_keywords = req.body.meta_tag_keywords;
          dynamicPage.lang = req.body.lang;
          dynamicPage.image = req.body.image;
          dynamicPage.updated_at = new Date();
          dynamicPage.updated_by = req.user._id
        }
        return dynamicPage.save((err) => {
          if (err)
            res.send(err);

          return res.send(dynamicPage);
        });
      })
    })
    .delete(auth, (req, res) => {
      DynamicPage.remove({
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
