import BlogContent from '../../models/blog_content.model';
import cors from 'cors';
import multer from 'multer';

export default (app, router, auth) => {
 

  router.route('/image-up')
    .post((req, res, next) => {
      let base64Data = req.body.img.split(',')[1];
      require("fs").writeFile("out.png", base64Data, 'base64', function (err) {
        //console.log(err);
      });
    })

  router.route('/blog')
    .get((req, res) => {
      let cond = new Object();
      if (req.query.status != 'all') {
        cond['is_enabled'] = req.query.status;
      }
      BlogContent.find(cond)
        .sort({ 'priority': 1 })
        .exec()
        .then(blogContents => {
          res.json(blogContents)
        })
        .catch(err => {
          res.send([]);
        })
    })

    .post(auth, (req, res) => {
      BlogContent.create({
        is_enabled: req.body.is_enabled,
        title: req.body.title,
        blog_url: req.body.blog_url,
        blog_text: req.body.blog_text,
        blog_thumbnail_path: req.body.blog_thumbnail_path,
        expiry_date: req.body.expiry_date,
        priority: req.body.priority,
        created_by: req.user._id,
        created_at: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, blogContent) => {
        if (err) {
          res.send(err);
        }
        res.json(blogContent);
      });
    });

  const path = require('path');
  app.use(cors());

  // const upload = multer({
  //   storage: multer.diskStorage({
  //     destination: 'uploads/blog/',
  //     filename: (req, file, cb) => {
  //       let ext = path.extname(file.originalname);
  //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  //     }
  //   })
  // });

  // router.post('/upload/blog', upload.any(), (req, res) => {
  //   res.json(req.files.map(file => {
  //     let ext = path.extname(file.originalname);
  //     return {
  //       originalName: file.originalname,
  //       filename: file.filename
  //     }
  //   }));
  // });

  router.route('/blog/:id')
    .get(auth, (req, res) => {
      BlogContent.findOne({
        '_id': req.params.id
      }, (err, blogContent) => {
        if (err) {
          res.send(err);
        }
        res.send(blogContent)
      })
    })

    .put(auth, (req, res) => {
      BlogContent.findOneAndUpdate({
        '_id': req.params.id
      }, {
          $set: {
            is_enabled: req.body.is_enabled,
            blog_url: req.body.blog_url,
            blog_text: req.body.blog_text,
            title: req.body.title,
            blog_thumbnail_path: req.body.blog_thumbnail_path,
            expiry_date: req.body.expiry_date,
            priority: req.body.priority,
            updated_by: req.user._id,
            updated_at: new Date()
          }
        }, {
          new: true
        }, (err, blogContent) => {
          if (err) {
            res.send(err)
          }
          res.send(blogContent)
        })
    })

    .delete(auth, (req, res) => {
      BlogContent.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'BlogContent Deleted',
          'status': true
        })
      })
    })
}
