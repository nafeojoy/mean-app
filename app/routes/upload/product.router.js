
import {
  getNextSequence,
  imageIndex
} from '../admin/sequence.service';

import {
  uploader
} from '../admin/upload.service';

import {
  previewUploader
} from '../admin/preview-upload.service';

import {
  backCoverUploader
} from '../admin/backcover-upload.service';

import Product from '../../models/product.model';

export default (app, router, auth) => {

  router.route('/product-upload')
    .post((req, res) => {
      getNextSequence('product_import_id')
        .then(seq => {
          uploader(req, 'product', seq, imageIndex(seq), imageSizes()).then(result => {
            res.json(result);
          })
        })
    })

  router.route('/product-update')
    .post((req, res) => {
      let seq = parseInt(req.query.import_id)
      uploader(req, 'product', seq, imageIndex(seq), imageSizes()).then(result => {
        res.json(result);
      })
    })

  router.route('/product-preview/update')
    .post(auth, (req, res) => {
      let seq = parseInt(req.query.import_id);
      let page_num = parseInt(req.query.page_num);
      Product.findOne({
        import_id: seq
      })
        .exec()
        .then(item => {
          if (item && item._id) {
            let imgs = new Object();
            previewUploader(req, 'product', seq, imageIndex(seq), page_num, previewImageSizes())
              .then(result => {
                imgs = result;
                return hasPreviewImagePage(seq, page_num)
              })
              .then(hasPage => {
                if (!hasPage.exist) {
                  item.preview_images.push({
                    image: imgs,
                    page_num: page_num,
                    uploaded_by: req.user._id,
                    uploaded_at: new Date()
                  });
                } else {
                  let rest_imges = item.preview_images.filter(itm => {
                    return itm.page_num != page_num;
                  })
                  rest_imges.push({
                    image: imgs,
                    page_num: page_num,
                    uploaded_by: req.user._id,
                    uploaded_at: new Date()
                  });
                  item.preview_images = rest_imges;
                }
                item.is_checked_after_last_update = false;
                item.save(err => {
                  res.json({
                    success: true,
                    item: item,
                    type: 'preview'
                  });
                })
              })
          } else {
            res.json({
              success: false
            });
          }
        })
    })

  router.route('/product-back-cover/update')
    .post(auth, (req, res) => {
      let seq = parseInt(req.query.import_id);
      Product.findOne({
        import_id: seq
      })
        .exec()
        .then(item => {
          if (item && item._id) {
            backCoverUploader(req, 'product', seq, imageIndex(seq), backImageSizes()).then(result => {
              result['uploaded_by'] = req.user._id;
              result['uploaded_at'] = new Date();
              item.back_cover_image = result;
              item.is_checked_after_last_update = false;
              item.save(err => {
                res.json({
                  success: true,
                  item: item,
                  type: 'back_cover'
                });
              })
            })
          } else {
            res.json({
              success: false
            });
          }
        })
    })

  function hasPreviewImagePage(import_id, page_num) {
    return new Promise((resolve, reject) => {
      Product.findOne({
        import_id: import_id,
        'preview_images.page_num': page_num
      })
        .exec()
        .then(result => {
          if (result && result._id) {
            resolve({
              exist: true
            });
          } else {
            resolve({
              exist: false
            })
          }
        })
        .catch(err => {
          resolve({
            error: true
          });
        })
    })
  }

  router.route('/product-frontcover/update')
    .post((req, res) => {
      let seq = parseInt(req.query.import_id);
      Product.findOne({
        import_id: seq
      })
        .exec()
        .then(item => {
          if (item && item._id) {
            uploader(req, 'product', seq, imageIndex(seq), imageSizes()).then(result => {
              result['uploaded_at'] = new Date();
              item.image = result;
              item.is_checked_after_last_update = false;
              item.save(err => {
                res.json({
                  success: true,
                  item: item,
                  type: 'fron_cover'
                });
              })
            })
          } else {
            res.json({
              success: false
            });
          }
        })
    })

  function backImageSizes() {
    return {
      '120': {
        width: '120',
        height: '175',
        quality: 100,
        directory: '120X175'
      },
      '250': {
        width: '250',
        height: '360',
        type: false,
        quality: 100,
        directory: '250X360'
      }
    }
  }

  function previewImageSizes() {
    return {
      '650': {
        width: '650',
        height: '800',
        quality: 100,
        directory: '650X800'
      },
      '1200': {
        width: '1200',
        height: '1600',
        type: false,
        quality: 100,
        directory: '1200X1600'
      }
    }
  }

  function imageSizes() {
    return {
      '120': {
        width: '120',
        height: '175',
        quality: 100,
        directory: '120X175'
      },
      '250': {
        width: '250',
        height: '360',
        type: false,
        quality: 100,
        directory: '250X360'
      }
    }
  }

}