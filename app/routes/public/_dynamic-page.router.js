import DynamicPage from '../../models/dynamic-page.model';
import config from '../../../config/config.json';
import mongoose from 'mongoose';

export default (app, router, cache, jwt) => {


  router.route('/dynamic-page/:page_url')

    .get((req, res) => {
      DynamicPage.findOne({
          'content_url': req.params.page_url
        })
        .exec()
        .then(dynamicPage => {
          if (dynamicPage && dynamicPage._id) {
            res.json({
              status: true,
              content: dynamicPage
            });
          } else {
            res.json({
              status: false,
              message: "Invalid Page URL"
            })
          }
        })
        .catch(err => {
          res.json({
            status: false,
            message: "Invalid Page URL"
          })
        })
    })

  router.route('/dynamic-page')
    .get((req, res) => {
      let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
      let paginationHeader = req.headers['bz-pagination'];
      let pageNum = paginationHeader == undefined ? 1 : parseInt(paginationHeader);
      let itemsPerPage = parseInt(req.cookies.itemForDevice);
      let size = req.cookies.deviceName == 'desktop' ? '150X150' : '50X50';
      let imageSize = "$image." + size;

      DynamicPage.count((err, count) => {
        return count;
      }).then(count => {
        if (reqLang == config.DEFAULT_LANGUAGE) {
          DynamicPage.aggregate([{
                $sort: {
                  created_at: -1
                }
              },
              {
                $project: {
                  title: "$title",
                  content_url: "$content_url",
                  content: "$content",
                  created_at: "$created_at",
                  image: "$image"
                }
              }
            ])
            .skip(itemsPerPage * (pageNum - 1))
            .limit(itemsPerPage)
            .exec()
            .then(dynamicPage => {
              res.json({
                'count': count,
                'data': dynamicPage
              });
            })
            .catch(err => {
              res.json(err);
            })

        } else {
          DynamicPage.aggregate([{
                $match: {
                  "lang.code": reqLang
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              },
              {
                $unwind: "$lang"
              },
              {
                $project: {
                  title: "$lang.content.title",
                  content_url: "$content_url",
                  content: "$lang.content.content",
                  created_at: "$created_at",
                  image: "$image"

                }
              }
            ])
            .skip(itemsPerPage * (pageNum - 1))
            .limit(itemsPerPage)
            .exec()
            .then(dynamicPage => {
              res.json({
                'count': count,
                'data': dynamicPage
              });
            })
            .catch(err => {
              res.json(err);
            })
        }
      })
    })

  // router.route('/dynamic-page/:id')
  //     .get((req, res) => {
  //         let reqLang = req.cookies.lang;
  //         let size = req.cookies.deviceName == 'desktop' ? '150X150' : '50X50';
  //         let imageSize = "$image." + size;
  //         //console.log("WOrking");

  //         if (reqLang == config.DEFAULT_LANGUAGE) {
  //             DynamicPage.aggregate([
  //                 {
  //                     $match: {
  //                         '_id': mongoose.Types.ObjectId(req.params.id)
  //                     }
  //                 },
  //                 {
  //                     $project: {
  //                         title: "$title",
  //                         content: "$content",
  //                         created_at: "$created_at"
  //                     }
  //                 }
  //             ])
  //                 .exec()
  //                 .then(dynamicPage => {
  //                     if(dynamicPage.length){
  //                         res.json(dynamicPage[0]);
  //                     } else {
  //                         res.json(dynamicPage);
  //                     }
  //                 })
  //                 .catch(err => {
  //                     res.json(err);
  //                 })
  //         } else {
  //             DynamicPage.aggregate([
  //                 {
  //                     $match: {
  //                         "lang.code": reqLang, '_id': mongoose.Types.ObjectId(req.params.id)
  //                     }
  //                 },
  //                 { $unwind: "$lang" },
  //                 {
  //                     $project: {
  //                         title: "$lang.content.title",
  //                         content: "$lang.content.content",
  //                         created_at: "$created_at"
  //                     }
  //                 }
  //             ])
  //                 .exec()
  //                 .then(dynamicPage => {
  //                     if(dynamicPage.length){
  //                         res.json(dynamicPage[0]);
  //                     } else {
  //                         res.json(dynamicPage);
  //                     }
  //                 })
  //                 .catch(err => {
  //                     res.json(err);
  //                 })
  //         }
  //     })

}
