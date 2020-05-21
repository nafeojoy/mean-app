import VideoContent from '../../models/video_content.model';
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

  router.route('/video')
    .get((req, res) => {
      let cond = new Object();
      if (req.query.status != 'all') {
        cond['is_enabled'] = req.query.status;
      }
      VideoContent.find(cond)
        .sort({ 'priority': 1 })
        .exec()
        .then(videoContents => {
          res.json(videoContents)
        })
        .catch(err => {
          res.send([]);
        })
    })

    .post(auth, (req, res) => {
      VideoContent.create({
        is_enabled: req.body.is_enabled,
        title: req.body.title,
        video_url: req.body.video_url,
        video_thumbnail_path: req.body.video_thumbnail_path,
        expiry_date: req.body.expiry_date,
        priority: req.body.priority,
        created_by: req.user._id,
        created_at: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, videoContent) => {
        if (err) {
          res.send(err);
        }
        res.json(videoContent);
      });
    });

  // const path = require('path');
  // app.use(cors());

  // const upload = multer({
  //   storage: multer.diskStorage({
  //     destination: 'uploads/video/',
  //     filename: (req, file, cb) => {
  //       let ext = path.extname(file.originalname);
  //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  //     }
  //   })
  // });

  // router.post('/upload/video', upload.any(), (req, res) => {
  //   res.json(req.files.map(file => {
  //     let ext = path.extname(file.originalname);
  //     return {
  //       originalName: file.originalname,
  //       filename: file.filename
  //     }
  //   }));
  // });

  router.route('/video/:id')
    .get(auth, (req, res) => {
      VideoContent.findOne({
        '_id': req.params.id
      }, (err, videoContent) => {
        if (err) {
          res.send(err);
        }
        res.send(videoContent)
      })
    })

    .put(auth, (req, res) => {
      VideoContent.findOneAndUpdate({
        '_id': req.params.id
      }, {
          $set: {
            is_enabled: req.body.is_enabled,
            video_url: req.body.video_url,
            title: req.body.title,
            video_thumbnail_path: req.body.video_thumbnail_path,
            expiry_date: req.body.expiry_date,
            priority: req.body.priority,
            updated_by: req.user._id,
            updated_at: new Date()
          }
        }, {
          new: true
        }, (err, videoContent) => {
          if (err) {
            res.send(err)
          }
          res.send(videoContent)
        })
    })

    .delete(auth, (req, res) => {
      VideoContent.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'VideoContent Deleted',
          'status': true
        })
      })
    })
}
