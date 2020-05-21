import News from '../../models/news.model';
import Category from '../../models/category.model';
import config from '../../../config/config.json'
import mongoose from 'mongoose';
import Product from "../../models/product.model";
import Order from "../../models/order.model";
import Purchase from "../../models/inventory-models/purchase.model";



export default (app, router, cache, jwt) => {



  /* #region  News ROUTES */


  router.route('/news')
    .get(
      (req, res, next) => {
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        var cacheKeyName = 'news-' + reqLang;
        let paginationHeader = req.headers['bz-pagination'];
        if (paginationHeader) {
          cacheKeyName = cacheKeyName + '-page-' + paginationHeader;
        } else {
          cacheKeyName = cacheKeyName + '-page-' + 1;
        }
        res.express_redis_cache_name = cacheKeyName
        next();
      },
      cache.route(),

      (req, res) => {
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        let paginationHeader = req.headers['bz-pagination'];
        let pageNum = paginationHeader == undefined ? 1 : parseInt(paginationHeader);
        let itemsPerPage = parseInt(req.cookies.itemForDevice) || 6;
        let size = req.cookies.deviceName == 'desktop' ? '150X150' : '50X50';
        let imageSize = "$image." + size;

        News.count((err, count) => {
          return count;
        }).then(count => {
          if (reqLang == config.DEFAULT_LANGUAGE) {
            News.aggregate([{
                  $sort: {
                    published_at: -1
                  }
                },
                {
                  $project: {
                    image: imageSize,
                    headline: "$headline",
                    content: "$content",
                    published_at: "$published_at"
                  }
                }
              ])
              .skip(itemsPerPage * (pageNum - 1))
              .limit(itemsPerPage)
              .exec()
              .then(news => {
                res.json({
                  'count': count,
                  'data': news
                });
              })
              .catch(err => {
                res.json(err);
              })
          } else {
            News.aggregate([{
                  $match: {
                    "lang.code": reqLang
                  }
                },
                {
                  $sort: {
                    published_at: -1
                  }
                },
                {
                  $unwind: "$lang"
                },
                {
                  $project: {
                    image: imageSize,
                    headline: "$lang.content.headline",
                    content: "$lang.content.content",
                    published_at: "$published_at"
                  }
                }
              ])
              .skip(itemsPerPage * (pageNum - 1))
              .limit(itemsPerPage)
              .exec()
              .then(news => {
                res.json({
                  'count': count,
                  'data': news
                });
              })
              .catch(err => {
                res.json(err);
              })
          }
        })
      })

  router.route('/news/:id')
    .get((req, res) => {

      let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
      let size = req.cookies.deviceName == 'desktop' ? '150X150' : '50X50';
      let imageSize = "$image." + size;
      if (reqLang == config.DEFAULT_LANGUAGE) {
        News.aggregate([{
              $match: {
                '_id': mongoose.Types.ObjectId(req.params.id)
              }
            },
            {
              $project: {
                image: imageSize,
                headline: "$headline",
                content: "$content",
                published_at: "$published_at"
              }
            }
          ])
          .exec()
          .then(news => {
            if (news.length) {
              res.json(news[0]);
            } else {
              res.json(news);
            }
          })
          .catch(err => {
            res.json(err);
          })
      } else {
        News.aggregate([{
              $match: {
                "lang.code": reqLang,
                '_id': mongoose.Types.ObjectId(req.params.id)
              }
            },
            {
              $unwind: "$lang"
            },
            {
              $project: {
                image: imageSize,
                headline: "$lang.content.headline",
                content: "$lang.content.content",
                published_at: "$published_at"
              }
            }
          ])
          .exec()
          .then(news => {
            if (news.length) {
              res.json(news[0]);
            } else {
              res.json(news);
            }
          })
          .catch(err => {
            res.json(err);
          })
      }
    })
  /* #endregion */

}
