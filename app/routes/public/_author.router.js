import Author from '../../models/author.model';
import Product from '../../models/product.model';

import config from '../../../config/config.json'
import {
  getAuthors
} from './api.service.js';
 
export default (app, router, cache) => {
  router.route('/authors')
    .get(
      (req, res, next) => {
        let reqLang = req.cookies.lang;
        var cacheKeyName = 'authors-' + reqLang;

        let paginationHeader = req.headers['bz-pagination'];
        if (paginationHeader) {
          cacheKeyName = cacheKeyName + '-page-' + paginationHeader;
        }

        res.express_redis_cache_name = cacheKeyName
        next();
      },
      cache.route(),
      (req, res) => {
        //     let paginationHeader = req.headers['bz-pagination'];
        //     let pageNum = parseInt(paginationHeader);
        //     getAuthors(req).then((author) => {
        //         res.json(author);
        //     })
        // })



        let paginationHeader = req.headers['bz-pagination'];

        let pageNum = parseInt(paginationHeader);
        let count = 0;
        Author.count()
          .exec().
        then(total => {
            count = total;
            return getAuthorsOnScrol(req)
          })
          .then((authors) => {
            res.json({
              count: count,
              data: authors
            })
          })

      })

  router.route('/featured-author')
    .get((req, res) => {

      Product.find({
          'author': req.headers['author_id'],
          preview_images: {
            $exists: true,
            $not: {
              $size: 0
            }
          }
        })
        .select({
          name: 1,
          lang: 1,
          seo_url: 1
        })
        .limit(30)
        .exec()
        .then(products => {
          res.json(products)
        })


    })


  function getAuthorsOnScrol(req) {


    let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
    let pageNum = 1;
    let itemsPerPage = 12 //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 5;
    if (req.headers['app-device']) {
      let device = JSON.parse(req.headers['app-device']);
      reqLang = device.lang;
      itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }

    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    let paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
      pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
      return new Promise(function (resolve, reject) {
        Author.aggregate(
            [{
                $match: {
                  "is_enabled": true
                }
              },
              {
                $sort: {
                  featured_order: 1,
                  name: 1
                }
              },
              {
                $project: {
                  image: imageSize,
                  name: "$name",
                  seo_url: "$seo_url",
                  description: {
                    $substrCP: ["$description", 0, 60]
                  }
                }
              }
            ]
          )
          .skip(itemsPerPage * (pageNum - 1))
          .limit(itemsPerPage)
          .exec().then(authors => {
            resolve(authors)
          }).catch(err => {
            reject(err);
          })
      });
    } else {
      return new Promise(function (resolve, reject) {


        
        Author.aggregate(
            [{
                $match: {
                  "lang.code": reqLang,
                  'is_featured': true,
                  "is_enabled": true
                }
              },
              {
                $sort: {
                  featured_order: 1,
                  name: 1
                }
              },
              {
                $unwind: "$lang"
              },
              {
                $project: {
                  image: imageSize,
                  name: "$lang.content.name",
                  seo_url: "$seo_url",
                  description: {
                    $substrCP: ["$lang.content.description", 0, 60]
                  }
                }
              }
            ]
          )

          .skip(itemsPerPage * (pageNum - 1))
          .limit(itemsPerPage)
          .exec().then(authors => {


            if (authors.length < 1) {
              Author.aggregate(
                  [{
                      $match: {
                        "lang.code": reqLang,
                        $or: [{
                            'is_featured': false
                          },
                          {
                            'is_featured': {
                              $exists: false
                            }
                          }
                        ],
                        "is_enabled": true
                      }
                    },
                    {
                      $sort: {
                        featured_order: 1,
                        name: 1
                      }
                    },
                    {
                      $unwind: "$lang"
                    },
                    {
                      $project: {
                        image: imageSize,
                        name: "$lang.content.name",
                        seo_url: "$seo_url",
                        description: {
                          $substrCP: ["$lang.content.description", 0, 60]
                        }
                      }
                    }
                  ]
                )

                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(authors => {

                  resolve(authors)
                })

            } else {
              resolve(authors)

            }

          }).catch(err => {
            reject(err);
          })
      });
    }
  }
}
