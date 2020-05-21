import UploadedImages from '../../models/uploaded-images.model';
import cors from 'cors';
import multer from 'multer';

export default (app, router, auth) => {
  router.route('/uploaded-images')
    .get((req, res, next) => {
      UploadedImages.find((err, uploadedImages) => {
        if (err) {
          res.send(err)
        }
        res.json(uploadedImages)
      })
    })

    .post(auth, (req, res) => {
      UploadedImages.create({
        is_enabled: req.body.is_enabled,
        image: req.body.image,
        click_url: req.body.click_url,
        created_by: req.user._id,
        created_at: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, uploadedImage) => {
        if (err) {
          res.send(err);
        }
        res.json(uploadedImage);
      });
    });

  const path = require('path');
  app.use(cors());

  // const upload = multer({
  //   storage: multer.diskStorage({
  //     destination: 'uploads/uploaded-images/',
  //     filename: (req, file, cb) => {
  //       let ext = path.extname(file.originalname);
  //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  //     }
  //   })
  // });

  // router.post('/upload/uploaded-images', upload.any(), (req, res) => {
  //   res.json(req.files.map(file => {
  //     let ext = path.extname(file.originalname);
  //     return {
  //       originalName: file.originalname,
  //       filename: file.filename
  //     }
  //   }));
  // });

  router.route('/uploaded-images/:id')
    .get(auth, (req, res) => {
      UploadedImages.findOne({
        '_id': req.params.id
      }, (err, uploadedImage) => {
        if (err) {
          res.send(err);
        }
        res.send(uploadedImage)
      })
    })

    .put(auth, (req, res) => {
      UploadedImages.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          is_enabled: req.body.is_enabled,
          click_url: req.body.click_url,
          image: req.body.image,
          updated_by: req.user._id,
          updated_at: new Date()
        }
      }, {
        new: true
      }, (err, uploadedImage) => {
        if (err) {
          res.send(err)
        }
        res.send(uploadedImage)
      })
    })

    .delete(auth, (req, res) => {
      UploadedImages.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Uploaded Images Deleted',
          'status': true
        })
      })
    })
}
