import Testimonial from '../../models/testimonial.model';
import {
  uploader
} from './upload.service';
import {
  getNextSequence,
  imageIndex
} from './sequence.service';

export default (app, router, auth) => {

  router.route('/testimonial')
    .get((req, res) => {
      let size = req.cookies.deviceName == 'desktop' ? '300X300' : '300X300';
      let imageSize = "$image." + size;
      Testimonial.aggregate(
          [{
            $project: {
              name: "$name",
              image: imageSize,
              speech_at: "$speech_at",
              email: "$email"
            }
          }]
        )
        .exec((err, testimonial) => {
          if (err) {
            res.send(err)
          }
          res.json(testimonial);
        })
    })

    .post(auth, (req, res) => {
      Testimonial.create({
        name: req.body.name,
        image: req.body.image,
        import_id: req.body.image && req.body.image['300X300'] ? parseInt(req.body.image['300X300'].split('/')[4]) : undefined,
        occupation: req.body.occupation,
        designation: req.body.designation,
        email: req.body.email,
        speech: req.body.speech,
        speech_at: new Date(),
        is_enabled: true,
        order: req.body.order,
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, testimonial) => {
        if (err) {
          res.send(err);
        } else {
          if (!testimonial.image) {
            getNextSequence('testimonial_import_id').then(seq => {
              testimonial.import_id = seq;
              testimonial.save(err => {
                if (err) {
                  res.send(err);
                } else {
                  res.json(testimonial);
                }
              })
            })
          } else {
            res.json(testimonial);
          }
        }
      });
    });

  // router.route('/testimonial-upload')
  //   .post((req, res) => {
  //     getNextSequence('testimonial_import_id')
  //       .then(seq => {
  //         uploader(req, 'testimonial', seq, imageIndex(seq), imageSizes()).then(result => {
  //           res.json(result);
  //         })
  //       })
  //   })


  // router.route('/testimonial-update')
  //   .post((req, res) => {
  //     let seq = parseInt(req.query.import_id)
  //     uploader(req, 'testimonial', seq, imageIndex(seq), imageSizes()).then(result => {
  //       res.json(result);
  //     })
  //   })


  router.route('/testimonial/:id')

    .get((req, res) => {
      Testimonial.findOne({
          '_id': req.params.id
        })
        .exec((err, testimonial) => {
          if (err)
            res.send(err);
          else
            res.json(testimonial);
        })
    })

    .put(auth, (req, res) => {
      Testimonial.findOne({
        '_id': req.params.id
      }, (err, testimonial) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          testimonial.name = req.body.name;
          testimonial.image = req.body.image;
          testimonial.occupation = req.body.occupation;
          testimonial.designation = req.body.designation;
          testimonial.email = req.body.email;
          testimonial.speech = req.body.speech;
          testimonial.speech_at = req.body.speech_at;
          testimonial.is_enabled = req.body.is_enabled;
          testimonial.order = req.body.order;
          testimonial.updated_at = new Date();
          testimonial.updated_by = req.user._id
        }
        return testimonial.save((err) => {
          if (err)
            res.send(err);

          return res.send(testimonial);
        });
      })
    })
    .delete(auth, (req, res) => {
      Testimonial.remove({
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


  // function imageSizes() {
  //   return {
  //     '50': {
  //       width: '50',
  //       height: '50',
  //       quality: 80,
  //       directory: '50X50'
  //     },
  //     '150': {
  //       width: '150',
  //       height: '150',
  //       quality: 80,
  //       directory: '150X150'
  //     },
  //     '300': {
  //       width: '300',
  //       height: '300',
  //       quality: 80,
  //       directory: '300X300'
  //     }
  //   }
  // }
}
