import Testimonial from '../../models/testimonial.model';



export default (app, router, jwt) => {
  router.route('/testimonial')
    .get((req, res) => {
      let size = req.cookies.deviceName == 'desktop' ? '150X150' : '50X50';
      let imageSize = "$image." + size;
      Testimonial.aggregate(
          [{
              $match: {
                "is_enabled": true
              }
            },
            {
              $project: {
                name: "$name",
                image: imageSize,
                occupation: "$occupation",
                designation: "$designation",
                speech: "$speech",
                speech_at: "$speech_at",
              }
            }
          ]
        )
        .sort({
          order: -1
        })
        .limit(5)
        .exec((err, testimonial) => {
          if (err) {
            res.send(err)
          }
          res.json(testimonial);
        })
    })


}
