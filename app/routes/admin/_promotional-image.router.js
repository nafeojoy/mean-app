import PromotionalImage from '../../models/promotional-image.model';
import cors from 'cors';
import multer from 'multer';

export default (app, router, auth) => {
  router.route('/promotional-image')
    .get((req, res, next) => {
      PromotionalImage.find((err, promotionalImages) => {
        if (err) {
          res.send(err)
        }
        res.json(promotionalImages)
      })
    })

    .post(auth, (req, res) => {
      PromotionalImage.create({
        is_enabled: req.body.is_enabled,
        image: req.body.image,
        created_by: req.user._id,
        created_at: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
      }, (err, promotionalImage) => {
        if (err) {
          res.send(err);
        }
        res.json(promotionalImage);
      });
    });

  const path = require('path');
  app.use(cors());

  // const upload = multer({
  //   storage: multer.diskStorage({
  //     destination: 'uploads/promotional-image/',
  //     filename: (req, file, cb) => {
  //       let ext = path.extname(file.originalname);
  //       cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  //     }
  //   })
  // });

  // router.post('/upload/promotional-image', upload.any(), (req, res) => {
  //   res.json(req.files.map(file => {
  //     let ext = path.extname(file.originalname);
  //     return {
  //       originalName: file.originalname,
  //       filename: file.filename
  //     }
  //   }));
  // });

  router.route('/promotional-image/:id')
    .get(auth, (req, res) => {
      PromotionalImage.findOne({
        '_id': req.params.id
      }, (err, promotionalImage) => {
        if (err) {
          res.send(err);
        }
        res.send(promotionalImage)
      })
    })

    .put(auth, (req, res) => {
      PromotionalImage.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          is_enabled: req.body.is_enabled,
          image: req.body.image,
          updated_by: req.user._id,
          updated_at: new Date()
        }
      }, {
        new: true
      }, (err, promotionalImage) => {
        if (err) {
          res.send(err)
        }
        res.send(promotionalImage)
      })
    })

    .delete(auth, (req, res) => {
      PromotionalImage.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'PromotionalImage Deleted',
          'status': true
        })
      })
    })
}
