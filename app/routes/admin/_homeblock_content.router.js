import HomeblockContent from '../../models/homeblock_content.model';
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

  router.route('/homeblock')
    .get((req, res) => {
      let cond = new Object();
      if (req.query.status != 'all') {
        cond['is_enabled'] = req.query.status;
      }
      HomeblockContent.find(cond)
        .sort({ 'priority': 1 })
        .exec()
        .then(homeblockContents => {
          res.json(homeblockContents)
        })
        .catch(err => {
          res.send([]);
        })
    })

    .post(auth, (req, res) => {
      HomeblockContent.create({
        is_enabled: req.body.is_enabled,
        title: req.body.title,
        homeblock_url: req.body.homeblock_url,
        homeblock_thumbnail_path: req.body.homeblock_thumbnail_path,
        expiry_date: req.body.expiry_date,
        priority: req.body.priority,
        created_by: req.user._id,
        created_at: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, homeblockContent) => {
        if (err) {
          res.send(err);
        }
        res.json(homeblockContent);
      });
    });

  const path = require('path');
  app.use(cors());

  const upload = multer({
    storage: multer.diskStorage({
      destination: 'uploads/homeblock/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/upload/homeblock', upload.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  router.route('/homeblock/:id')
    .get(auth, (req, res) => {
      HomeblockContent.findOne({
        '_id': req.params.id
      }, (err, homeblockContent) => {
        if (err) {
          res.send(err);
        }
        res.send(homeblockContent)
      })
    })

    .put(auth, (req, res) => {
      HomeblockContent.findOneAndUpdate({
        '_id': req.params.id
      }, {
          $set: {
            is_enabled: req.body.is_enabled,
            homeblock_url: req.body.homeblock_url,
            title: req.body.title,
            homeblock_thumbnail_path: req.body.homeblock_thumbnail_path,
            expiry_date: req.body.expiry_date,
            priority: req.body.priority,
            updated_by: req.user._id,
            updated_at: new Date()
          }
        }, {
          new: true
        }, (err, homeblockContent) => {
          if (err) {
            res.send(err)
          }
          res.send(homeblockContent)
        })
    })

    .delete(auth, (req, res) => {
      HomeblockContent.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'HomeblockContent Deleted',
          'status': true
        })
      })
    })
}
