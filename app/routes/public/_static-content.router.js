import StaticContent from '../../models/static-content.model';
import config from '../../../config/config.json';

export default (app, router, jwt) => {
  router.route('/static-content')
    /*Provide only list of static pages title and content_url 
    to display list of static pages link in home page.*/
    .get((req, res) => {
      let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
      if (reqLang == config.DEFAULT_LANGUAGE) {
        StaticContent.find()
          .select({
            content_url: 1,
            title: 1
          })
          .exec((err, staticContent) => {
            if (err) {
              res.send(err)
            }
            res.json(staticContent);
          })
      } else {
        StaticContent.aggregate(
            [{
                $match: {
                  "lang.code": reqLang
                }
              },
              {
                $unwind: "$lang"
              },
              {
                $project: {
                  content_url: "$content_url",
                  title: "$lang.content.title",
                }
              }
            ]
          )
          .exec((err, staticContent) => {
            if (err) {
              res.send(err)
            }
            res.json(staticContent);
          })
      }

    })

  router.route('/static-content/:content_url')
    /*
    Use this API to get a specific content
    */
    .get((req, res) => {
      let req_content_url = req.params.content_url;
      let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
      if (reqLang == config.DEFAULT_LANGUAGE) {
        StaticContent.findOne()
          .select({
            content_url: 1,
            title: 1,
            meta_tag_title: 1,
            meta_tag_keywords: 1,
            meta_tag_description: 1,
            content: 1
          })
          .where('content_url').equals(req_content_url)
          .exec((err, staticContent) => {
            if (err) {
              res.send(err)
            }
            res.json(staticContent);
          })
      } else {
        StaticContent.aggregate(
            [{
                $match: {
                  "lang.code": reqLang,
                  "content_url": req_content_url
                }
              },
              {
                $unwind: "$lang"
              },
              {
                $project: {
                  content_url: "$content_url",
                  title: "$lang.content.title",
                  content: "$lang.content.content",
                  meta_tag_title: "$lang.content.meta_tag_title",
                  meta_tag_keywords: "$lang.content.meta_tag_keywords",
                  meta_tag_description: "$lang.content.meta_tag_description"
                }
              }
            ]
          )
          .exec((err, staticContent) => {
            if (err) {
              res.send(err)
            }
            staticContent = staticContent && Array.isArray(staticContent) && staticContent.length > 0 ? staticContent[0] : {};
            res.json(staticContent);
          })
      }
    })
}
