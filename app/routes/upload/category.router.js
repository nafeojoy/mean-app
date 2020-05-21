import cors from 'cors';
import multer from 'multer';

import {
    getNextSequence,
    imageIndex
} from '../admin/sequence.service';

import {
	uploader
} from '../admin/upload.service';

export default (app, router, auth) => {

    const path = require('path');
	app.use(cors());

	const upload = multer({
		storage: multer.diskStorage({
			destination: 'uploads/category/banner/',
			filename: (req, file, cb) => {
				let ext = path.extname(file.originalname);
				cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
			}
		})
	});

	router.post('/category/banner', upload.any(), (req, res) => {
		res.json(req.files.map(file => {
			let ext = path.extname(file.originalname);
			return {
				originalName: file.originalname,
				filename: file.filename
			}
		}));
	});

	router.route('/category-upload')
		.post((req, res) => {
			getNextSequence('category_import_id')
				.then(seq => {
					uploader(req, 'category', seq, imageIndex(seq), imageSizes()).then(result => {
						res.json(result);
					})
				})
		})

	router.route('/category-update')
		.post((req, res) => {
			let seq = parseInt(req.query.import_id)
			uploader(req, 'category', seq, imageIndex(seq), imageSizes()).then(result => {
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