
import {
    getNextSequence,
    imageIndex
} from '../admin/sequence.service';

import {
    authorUploader
} from '../admin/author-upload.service';

export default (app, router, auth) => {

    router.route('/author-upload')
        .post((req, res) => {
            getNextSequence('author_import_id')
                .then(seq => {
                    authorUploader(req, 'author', seq, imageIndex(seq), imageSizes()).then(result => {
                        res.json(result);
                    })
                })
        })

    router.route('/author-update')
        .post((req, res) => {
            let seq = parseInt(req.query.import_id)
            authorUploader(req, 'author', seq, imageIndex(seq), imageSizes()).then(result => {
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