import Author from '../../models/author.model';
import {
  isSeoUnique
} from './admin-api.service';
import {
  soundexSen
} from './product.service';

import {
  authorUploader
} from './author-upload.service';

import {
  getNextSequence,
  imageIndex
} from './sequence.service';

export default (app, router, auth, slug) => {
  router.route('/author')

    .post(auth, slug(Author), (req, res) => {
      Author.create({
        name: req.body.name,
        birth_at: req.body.birth_at,
        birth_place: req.body.birth_place,
        image: req.body.image,
        import_id: req.body.image && req.body.image['120X175'] ? parseInt(req.body.image['120X175'].split('/')[4]) : undefined,
        is_featured: req.body.is_featured,
        featured_order: req.body.featured_order,
        occupation: req.body.occupation,
        nationality: req.body.nationality,
        awards: req.body.awards,
        died_at: req.body.died_at,
        description: req.body.description,
        meta_tag_title: req.body.meta_tag_title,
        meta_tag_description: req.body.meta_tag_description,
        meta_tag_keywords: req.body.meta_tag_keywords,
        lang: req.body.lang,
        seo_url: req.slug.seo_url,
        created_by: req.user._id,
        soundex_code: soundexSen(req.body.name),
        updated_by: req.user._id
      }, (err, author) => {
        if (err) {
          res.send(err);
        } else {
          if (!author.image) {
            getNextSequence('author_import_id').then(seq => {
              author.import_id = seq;
              author.save(err => {
                if (err) {
                  res.send(err);
                } else {
                  res.json(author);
                }
              })
            })
          } else {
            res.json(author);
          }
        }
      });

    })

    .get((req, res, next) => {
      var pageNum = 1,
        itemsPerPage = 10;
      var paginationHeader = req.headers['bz-pagination'];
      if (paginationHeader) {
        var params = paginationHeader.split(',');
        pageNum = parseInt(params[0]);
        itemsPerPage = parseInt(params[1]);
      }

      var featurePaginationHeader = req.headers['bz-feature-pagination'];
      if (featurePaginationHeader) {
        pageNum = parseInt(featurePaginationHeader);
      }

      Author.count((err, count) => {
        return count
      }).then(count => {
        let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
        let imageSize = "$image." + size;

        Author.aggregate(
          [{
            $project: {
              name: "$name",
              image: "$image",
              import_id: "$import_id",
              is_featured: "$is_featured",
              featured_order: "$featured_order",
              sngImage: imageSize,
              lang: "$lang",
              description: "$description",
              occupation: "$occupation",
              nationality: "$nationality",
              birth_place: "$birth_place",
              birth_at: "$birth_at",
              died_at: "$died_at",
              awards: "$awards",
              book_list: "$book_list",
              seo_url: "$seo_url",
              meta_tag_title: "$meta_tag_title",
              meta_tag_description: "$meta_tag_description",
              meta_tag_keywords: "$meta_tag_keywords"
            }
          },
          {
            $sort: {
              name: 1
            }
          }
          ]
        )
          .skip(itemsPerPage * (pageNum - 1))
          .limit(itemsPerPage)
          .exec((err, authors) => {
            if (err) {
              res.send(err);
            } else {
              res.json({
                'items': authors,
                'count': count
              });
            }
          });
      }).catch(err => {
        res.send(err);
      });
    });


  router.route('/author-upload')
    .post((req, res) => {
      getNextSequence('author_import_id')
        .then(seq => {
          authorUploader(req, 'author', seq, imageIndex(seq), imageSizes()).then(result => {
            res.json(result);
          })
        })
    })

  router.route('/author/order-create/author-search/:terms')
    .get((req, res) => {
      let expression = '.*' + req.params.terms + '.*';
      Author.aggregate(
        [{
          $match: {
            $or: [{
              "lang.content.name": {
                $regex: expression,
                $options: 'i'
              }
            },
            {
              "name": {
                $regex: expression,
                $options: 'i'
              }
            }
            ]
          }
        },
        {
          $project: {
            name: "$name",
            seo_url: "$seo_url"
          }
        }
        ]
      )
        .limit(50)
        .exec((err, authors) => {
          if (err)
            res.send(err);
          else
            res.json({
              'author': authors
            });
        })
    })

  router.route('/seo-update/author/:id')
    .put(auth, (req, res) => {
      isSeoUnique(Author, req.body.seo_url, req.body.lang[0].content.seo_url, req.params.id)
        .then(output => {
          if (output.duplicate) {
            res.json(output)
          } else {
            Author.findOne({
              '_id': req.params.id
            }, (err, author) => {
              //console.log(req.body.lang[0])
              if (err)
                res.send(err);
              if (author._id) {
                author.meta_tag_title = req.body.meta_tag_title;
                author.meta_tag_description = req.body.meta_tag_description;
                author.meta_tag_keywords = req.body.meta_tag_keywords;
                author.seo_url = req.body.seo_url;
                author.lang = [{
                  code: 'bn',
                  content: {
                    name: author.lang[0].content.name,
                    description: author.lang[0].content.description,
                    meta_tag_title: req.body.lang[0].content.meta_tag_title,
                    meta_tag_description: req.body.lang[0].content.meta_tag_description,
                    meta_tag_keywords: req.body.lang[0].content.meta_tag_keywords,
                    seo_url: req.body.lang[0].content.seo_url
                  }
                }];
                author.updated_by = req.user._id;
                author.updated_at = new Date();
              }
              return author.save((err) => {
                if (err) {
                  res.send(err);
                } else {
                  return res.send(author);
                }
              });
            })
          }
        })
    })

  router.route('/author-update')
    .post((req, res) => {
      let seq = parseInt(req.query.import_id)
      authorUploader(req, 'author', seq, imageIndex(seq), imageSizes()).then(result => {
        res.json(result);
      })
    })

  router.route('/author/:id')
    .get((req, res) => {
      Author.findOne({
        '_id': req.params.id
      })
        .exec((err, author) => {
          if (err)
            res.send(err);
          else
            res.json(author);
        })
    })
    .put(auth, (req, res) => {
      Author.findOne({
        '_id': req.params.id
      }, (err, author) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          req.body.lang[0].content.seo_url = author.lang[0].content.seo_url;
          author.name = req.body.name;
          author.birth_at = req.body.birth_at;
          author.birth_place = req.body.birth_place;
          author.image = req.body.image;
          author.occupation = req.body.occupation;
          author.nationality = req.body.nationality;
          author.is_featured = req.body.is_featured;
          author.featured_order = req.body.featured_order;
          author.awards = req.body.awards;
          author.died_at = req.body.died_at;
          author.description = req.body.description;
          author.meta_tag_title = req.body.meta_tag_title == undefined ? author.meta_tag_title : req.body.meta_tag_title;
          author.meta_tag_description = req.body.meta_tag_description == undefined ? author.meta_tag_description : req.body.meta_tag_description;
          author.meta_tag_keywords = req.body.meta_tag_keywords == undefined ? author.meta_tag_keywords : req.body.meta_tag_keywords;
          author.lang = req.body.lang;
          author.soundex_code = soundexSen(req.body.name);
          author.updated_by = req.user._id
        }
        return author.save((err) => {
          if (err)
            res.send(err);

          return res.send(author);
        });
      })
    })
    .delete(auth, (req, res) => {
      Author.remove({
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

  router.route('/author/search/v1')
    .get((req, res) => {
      var pageNum = 1,
        itemsPerPage = 50;

      var terms = req.query.search;
      if (req.query.page) {
        pageNum = req.query.page;
      }
      if (req.query.limit) {
        itemsPerPage = 50; //req.query.limit;
      }

      let expression = '.*' + terms + '.*';
      let searchConditions = {
        "name": {
          $regex: expression,
          $options: 'i'
        },
        "is_enabled": true
      };

      Author.find(searchConditions)
        .count((err, count) => {
          return count
        })
        .then(count => {
          Author.find(searchConditions)
            .skip(itemsPerPage * (pageNum - 1))
            .limit(itemsPerPage)
            .exec((err, authors) => {
              if (err)
                res.send(err);
              else
                res.json({
                  'items': authors,
                  'count': count
                });
            })
        })
        .catch(err => {
          res.send(err);
        })
    });


  router.route('/featured_author')
    .get((req, res) => {
      let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
      let imageSize = "$image." + size;
      Author.aggregate(
        [{
          $match: {
            'is_featured': true
          }
        },
        {
          $sort: {
            featured_order: 1
          }
        },
        {
          $project: {
            name: "$name",
            image: imageSize,
            description: "$description",
            occupation: "$occupation",
            nationality: "$nationality",
            birth_place: "$birth_place",
            birth_at: "$birth_at",
            died_at: "$died_at",
            awards: "$awards",
          }
        }
        ]
      )
        .exec((err, authors) => {
          if (err) {
            res.send(err);
          } else {
            res.json(authors);
          }
        });
    })


    .post(auth, (req, res) => {
      var featured_authors = req.body;
      updateAuthors(featured_authors).then(result => {
        res.json({
          success: true
        })
      }).catch(err => {
        res.json({
          message: err.message
        })
      })

    })

  router.route('/featured_author/:id')
    .put((req, res) => {
      Author.findOne({
        "_id": req.params.id
      })
        .exec((err, author) => {
          author.is_featured = false;
          author.featured_order = 0;
          // author.is_featured= req.body.is_featured;
          // author.featured_order= req.body.featured_order;
          return author.save((err) => {
            if (err)
              res.send(err)

            res.json({
              status: true
            });
          })
        })
    })

  function updateAuthors(authors) {
    var authorPromises = authors.map((authorObj, i) => {
      return new Promise((resolve, reject) => {
        Author.findOne({
          '_id': authorObj._id
        })
          .exec((err, author) => {
            author.is_featured = true;
            author.featured_order = (i + 1);
            author.save((err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            })
          })
      })
    })
    return Promise.all(authorPromises);
  }


  function imageSizes() {
    return {
      '120': {
        width: '120',
        height: '175',
        quality: 80,
        directory: '120X175'
      },
      '250': {
        width: '250',
        height: '360',
        type: false,
        quality: 80,
        directory: '250X360'
      }
    }
  }
}
