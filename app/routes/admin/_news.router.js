import News from '../../models/news.model';
import {
  uploader
} from './upload.service'
import {
  getNextSequence,
  imageIndex
} from './sequence.service';

export default (app, router, auth) => {


  //Use This as http://localhost:4000/admin/api/news
  router.route('/news')
    .get((req, res) => {
      News.find((err, news) => {
        if (err) {
          res.send(err)
        }
        res.json(news)
      })
    })

    .post(auth, (req, res) => {
      News.create({
        headline: req.body.headline,
        image: req.body.image,
        import_id: req.body.image && req.body.image['150X150'] ? parseInt(req.body.image['150X150'].split('/')[4]) : undefined,
        published_at: new Date(),
        content: req.body.content,
        lang: req.body.lang,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, news) => {
        if (err) {
          res.send(err);
        } else {
          if (!news.image) {
            getNextSequence('news_import_id').then(seq => {
              news.import_id = seq;
              news.save(err => {
                if (err) {
                  res.send(err);
                } else {
                  res.json(news);
                }
              })
            })
          } else {
            res.json(news);
          }
        }
      });
    });

  // router.route('/news-upload')
  //   .post((req, res) => {
  //     getNextSequence('news_import_id')
  //       .then(seq => {
  //         uploader(req, 'news', seq, imageIndex(seq), imageSizes()).then(result => {
  //           res.json(result);
  //         })
  //       })
  //   })

  // router.route('/news-update')
  //   .post((req, res) => {
  //     let seq = parseInt(req.query.import_id)
  //     uploader(req, 'news', seq, imageIndex(seq), imageSizes()).then(result => {
  //       res.json(result);
  //     })
  //   })



  //Use This as http://localhost:4000/admin/api/news/<id>
  router.route('/news/:id')
    .get((req, res) => {
      News.findOne({
          '_id': req.params.id
        })
        .exec((err, news) => {
          if (err)
            res.send(err);
          else
            res.json(news);
        })
    })

    .put(auth, (req, res) => {
      News.findOne({
        '_id': req.params.id
      }, (err, news) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          news.headline = req.body.headline;
          news.image = req.body.image ? req.body.image : news.image;
          news.content = req.body.content;;
          news.lang = req.body.lang;
          news.updated_at = new Date();
          news.updated_by = req.user._id
        }
        return news.save((err) => {
          if (err)
            res.send(err);

          return res.send(news);
        });
      })
    })
    .delete(auth, (req, res) => {
      News.remove({
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
