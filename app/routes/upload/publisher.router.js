
import {
    getNextSequence,
    imageIndex
} from '../admin/sequence.service';

import {
    uploader
  } from '../admin/logo-upload.service';

export default (app, router, auth) => {

    router.route('/publisher-upload')
    .post((req, res) => {
      getNextSequence('publisher_import_id')
        .then(seq => {
          uploader(req, 'publisher', seq, imageIndex(seq), imageSizes()).then(result => {
            res.json(result);
          })
        })
    })

  router.route('/publisher-update')
    .post((req, res) => {
      let seq = parseInt(req.query.import_id)
      uploader(req, 'publisher', seq, imageIndex(seq), imageSizes()).then(result => {
        res.json(result);
      })
    })

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