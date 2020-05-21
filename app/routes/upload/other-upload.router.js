
import {
  getNextSequence,
  imageIndex
} from '../admin/sequence.service';

import {
  uploader
} from '../admin/upload.service';
import cors from 'cors';
import multer from 'multer';

export default (app, router, auth) => {

  const path = require('path');
  app.use(cors());

  const upload_banner = multer({
    storage: multer.diskStorage({
      destination: 'uploads/banner/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/banner', upload_banner.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  const upload_blog = multer({
    storage: multer.diskStorage({
      destination: 'uploads/blog/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/upload/blog', upload_blog.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  router.route('/news-upload')
    .post((req, res) => {
      getNextSequence('news_import_id')
        .then(seq => {
          uploader(req, 'news', seq, imageIndex(seq), imageSizes()).then(result => {
            res.json(result);
          })
        })
    })

  router.route('/news-update')
    .post((req, res) => {
      let seq = parseInt(req.query.import_id)
      uploader(req, 'news', seq, imageIndex(seq), imageSizes()).then(result => {
        res.json(result);
      })
    })

  const promotional_upload = multer({
    storage: multer.diskStorage({
      destination: 'uploads/promotional-image/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/promotional-image', promotional_upload.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  router.route('/testimonial-upload')
    .post((req, res) => {
      getNextSequence('testimonial_import_id')
        .then(seq => {
          uploader(req, 'testimonial', seq, imageIndex(seq), imageSizes()).then(result => {
            res.json(result);
          })
        })
    })


  router.route('/testimonial-update')
    .post((req, res) => {
      let seq = parseInt(req.query.import_id)
      uploader(req, 'testimonial', seq, imageIndex(seq), imageSizes()).then(result => {
        res.json(result);
      })
    })

  const upld_upload = multer({
    storage: multer.diskStorage({
      destination: 'uploads/uploaded-images/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/uploaded-images', upld_upload.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  const vdo_upload = multer({
    storage: multer.diskStorage({
      destination: 'uploads/video/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/upload/video', vdo_upload.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  const offer_upload = multer({
    storage: multer.diskStorage({
      destination: 'uploads/offer/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/offer', offer_upload.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });

  const art_upload = multer({
    storage: multer.diskStorage({
      destination: 'uploads/article/',
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
      }
    })
  });

  router.post('/article', art_upload.any(), (req, res) => {
    res.json(req.files.map(file => {
      let ext = path.extname(file.originalname);
      return {
        originalName: file.originalname,
        filename: file.filename
      }
    }));
  });



  function imageSizes() {
    return {
      '150': {
        width: '150',
        height: '150',
        quality: 80,
        directory: '150X150'
      },
      '300': {
        width: '300',
        height: '300',
        quality: 80,
        directory: '300X300'
      }
    }
  }

}