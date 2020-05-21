import Banner from '../../models/banner.model';
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

  router.route('/banner/redis-flush')
    .put((req, res) => {
      const shell = require('shelljs');
      if (shell.exec('/usr/src/boibazar/redis-flush.sh')) {
        res.json({
          success: true
        })
      } else {
        res.json({
          success: false
        })
      }

    })


  router.route('/banner')
    .get((req, res) => {
      let cond = new Object();
      if (req.query.status != 'all') {
        cond['is_enabled'] = req.query.status;
      }
      Banner.find(cond)
        .sort({
          'priority': 1
        })
        .exec()
        .then(banners => {
          res.json(banners)
        })
        .catch(err => {
          res.send([]);
        })
    })

    .post(auth, (req, res) => {
      Banner.create({
        is_enabled: req.body.is_enabled,
        image: req.body.image,
        priority: req.body.priority,
        click_url: req.body.click_url,
        created_by: req.user._id,
        created_at: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, banner) => {
        if (err) {
          res.send(err);
        }
        res.json(banner);
      });
    });

  // const path = require('path');
  // app.use(cors());

  // const upload = multer({
  //   storage: multer.diskStorage({
  //     destination: 'uploads/banner/',
  //     filename: (req, file, cb) => {
  //       let ext = path.extname(file.originalname);
  //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  //     }
  //   })
  // });

  // router.post('/upload/banner', upload.any(), (req, res) => {
  //   res.json(req.files.map(file => {
  //     let ext = path.extname(file.originalname);
  //     return {
  //       originalName: file.originalname,
  //       filename: file.filename
  //     }
  //   }));
  // });

  router.route('/banner/:id')
    .get(auth, (req, res) => {
      Banner.findOne({
        '_id': req.params.id
      }, (err, banner) => {
        if (err) {
          res.send(err);
        }
        res.send(banner)
      })
    })

    .put(auth, (req, res) => {
      Banner.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          is_enabled: req.body.is_enabled,
          click_url: req.body.click_url,
          image: req.body.image,
          priority: req.body.priority,
          updated_by: req.user._id,
          updated_at: new Date()
        }
      }, {
        new: true
      }, (err, banner) => {
        if (err) {
          res.send(err)
        }
        res.send(banner)
      })
    })

    .delete(auth, (req, res) => {
      Banner.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Banner Deleted',
          'status': true
        })
      })
    })
}
