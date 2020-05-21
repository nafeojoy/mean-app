import Publisher from '../../models/publisher.model';
import config from '../../../config/config.json';
import {
  getPublishers
} from './api.service.js';
import Product from '../../models/product.model';

export default (app, router, cache, jwt) => {
  router.route('/publishers')
    .get(
      (req, res, next) => {

        let reqLang = req.cookies.lang;
        var cacheKeyName = 'publishers-' + reqLang;

        let paginationHeader = req.headers['bz-pagination'];
        if (paginationHeader) {
          cacheKeyName = cacheKeyName + '-page-' + paginationHeader;
        }

        res.express_redis_cache_name = cacheKeyName;
        next();
      },
      cache.route(),
      (req, res) => {
        let paginationHeader = req.headers['bz-pagination'];
        let pageNum = parseInt(paginationHeader);
        let count = 0;
        Publisher.count()
          .exec().
        then(total => {
            count = total;
            return getPublishersOnScrol(req)
          })
          .then((publisher) => {
            res.json({
              count: count,
              data: publisher
            })
          })
      })



  function getPublishersOnScrol(req) {

    let reqLang = req.cookies.lang || req.headers["lang"] || "bn";

    let pageNum = 1;
    let itemsPerPage = 12 //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 5;
    if (req.headers['app-device']) {
      let device = JSON.parse(req.headers['app-device']);
      reqLang = device.lang;
      itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }

    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$logo." + size;
    let paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
      pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
      return new Promise(function (resolve, reject) {
        Publisher.aggregate(
            [{
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
          .exec().then(publishers => {
            resolve(publishers)
          }).catch(err => {
            reject(err);
          })
      });
    } else {

      return new Promise(function (resolve, reject) {
        Publisher.aggregate(
            [{
                $match: {
                  "lang.code": reqLang,
                  'is_featured': true,
                  "is_enabled": true
                }
              },
              {
                $unwind: "$lang"
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
          .exec().then(publishers => {

            if (publishers.length < 1) {
              Publisher.aggregate(
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
                      $unwind: "$lang"
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
                .exec().then(publishers => {
                  resolve(publishers)

                })

            } else {
              resolve(publishers)
            }



          }).catch(err => {
            reject(err);
          })
      });
    }
  }

  router.route('/publishers/:search_text')
    .get((req, res) => {
      let size = req.cookies.deviceName == 'desktop' ? '250X360' : '42X60';
      let imageSize = "$image." + size;
      let publisherLogoSize = "$logo." + size;
      let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
      let itemPerPage = parseInt(req.cookies.itemForDevice);
      if (reqLang == config.DEFAULT_LANGUAGE) {
        Publisher.aggregate([{
              $match: {
                'page_url': req.params.search_text
              }
            },
            {
              $project: {
                _id: "$_id",
                name: "$name",
                phone: "$phone",
                email: "$email",
                address: "$address",
                website: "$website",
                reviews: "$reviews",
                image: publisherLogoSize,
                seo_url: "$seo_url",
                description: "$description"
              }
            }
          ])
          .exec()
          .then(publisher => {
            if (publisher.length && publisher.length == 1) {
              return Product.aggregate([{
                    $match: {
                      "publisher": publisher[0]._id
                    }
                  },
                  {
                    $lookup: {
                      from: "authors",
                      localField: "author",
                      foreignField: "_id",
                      as: "author"
                    }
                  },
                  {
                    $lookup: {
                      from: "publishers",
                      localField: "publisher",
                      foreignField: "_id",
                      as: "publisher"
                    }
                  },
                  // { $unwind: "$author" },
                  {
                    $unwind: "$publisher"
                  },
                  {
                    $project: {
                      image: imageSize,
                      previous_price: "$previous_price",
                      price: "$price",
                      name: "$name",
                      seo_url: "$seo_url",
                      authorObj: {
                        name: {
                          $arrayElemAt: ["$author.name", 0]
                        },
                        seo_url: {
                          $arrayElemAt: ["$author.seo_url", 0]
                        }
                      },
                      publisher: {
                        name: "$publisher.name",
                        image: publisherLogoSize,
                        seo_url: "$publisher.seo_url",
                        description: "$publisher.description"
                      }
                    }
                  }
                ])
                .limit(itemPerPage)
                .exec()
                .then(products => {
                  res.json({
                    status: true,
                    data: publisher[0],
                    products: products
                  });
                })
            } else {
              res.json({
                status: false
              })
            }
          })
      } else {
        Publisher.aggregate([{
              $match: {
                'page_url': req.params.search_text
              }
            },
            {
              $project: {
                _id: "$_id",
                name: "$lang.content.name",
                phone: "$phone",
                email: "$email",
                address: "$address",
                website: "$website",
                reviews: "$reviews",
                image: publisherLogoSize,
                seo_url: "$seo_url",
                description: "$lang.content.description"
              }
            }
          ])
          .exec()
          .then(publisher => {
            if (publisher.length && publisher.length == 1) {
              return Product.aggregate([{
                    $match: {
                      "lang.code": reqLang,
                      "publisher": publisher[0]._id
                    }
                  },
                  {
                    $lookup: {
                      from: "authors",
                      localField: "author",
                      foreignField: "_id",
                      as: "author"
                    }
                  },
                  {
                    $lookup: {
                      from: "publishers",
                      localField: "publisher",
                      foreignField: "_id",
                      as: "publisher"
                    }
                  },
                  {
                    $unwind: "$lang"
                  },
                  // { $unwind: "$author" },
                  // { $unwind: "$author.lang" },
                  {
                    $unwind: "$publisher"
                  },
                  {
                    $unwind: "$publisher.lang"
                  },
                  {
                    $project: {
                      image: imageSize,
                      previous_price: "$previous_price",
                      price: "$price",
                      name: "$lang.content.name",
                      seo_url: "$seo_url",
                      authorObj: {
                        name: {
                          $arrayElemAt: [{
                            $arrayElemAt: ["$author.lang.content.name", 0]
                          }, 0]
                        },
                        seo_url: {
                          $arrayElemAt: ["$author.seo_url", 0]
                        }
                        // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$author.lang.content.seo_url", 0] }, 0] }
                      },
                      publisher: {
                        name: "$publisher.lang.content.name",
                        seo_url: "$publisher.seo_url",
                        // seo_url: "$publisher.lang.content.seo_url",
                        image: publisherLogoSize,
                        description: "$publisher.lang.content.description"
                      }
                    }
                  }
                ])
                .limit(itemPerPage)
                .exec()
                .then(products => {
                  res.json({
                    status: true,
                    data: publisher[0],
                    products: products
                  });
                })
            } else {
              res.json({
                status: false
              })
            }
          })
      }
    })


  router.route('/publishers/user-review/:id')
    .put((req, res) => {
      Publisher.findOne({
          '_id': req.params.id
        })
        .exec()
        .then((publisher) => {
          let token = req.cookies.token;
          jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
            if (err) {
              res.json({
                success: false,
                message: 'Please login first'
              });
            } else {
              let user = decoded; //user;
              if(!user._id){
                user = decoded._doc;
              }
              let reviewData = {
                user_id: user._id,
                username: user.name,
                first_name: user.first_name,
                last_name: user.last_name,
                review_at: new Date(),
                review_speech: req.body.speech,
              }

              publisher.reviews.push(reviewData);
              return publisher.save((err) => {
                if (err) {
                  res.send(err);
                }

                return res.send(publisher);
              });
            }
          })

        })
    });

}
