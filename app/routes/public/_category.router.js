import Category from '../../models/category.model';
import Product from '../../models/product.model';
import config from '../../../config/config.json';

import {
  getFeatureCategories,
  getMenuCategories,
  getCategoryTabs
} from './api.service.js';

export default (app, router, cache) => {
  router.route('/categories')
    .get(
      // (req, res, next) => {
      //   let reqLang = req.cookies.lang;
      //   var cacheKeyName = 'categories-' + reqLang;

      //   let featured = parseInt(req.query.featured);
      //   if (featured == 1) {
      //     cacheKeyName = cacheKeyName + '-feature-1';
      //   } else if (featured == 0) {
      //     cacheKeyName = cacheKeyName + '-feature-0';
      //   }

      //   let paginationHeader = req.headers['bz-pagination'];
      //   if (paginationHeader) {
      //     cacheKeyName = cacheKeyName + '-page-' + paginationHeader;
      //   }

      //   res.express_redis_cache_name = cacheKeyName;
      //   next();
      // },
      // cache.route(),

      (req, res) => {

        let featured = parseInt(req.query.featured);


   

        if (featured == 0) {
          getMenuCategories(req).then((menuCategories) => {
            res.json(menuCategories);
          })

        } else if (featured == 1) {
          Category.count()
            .exec()
            .then(count => {
              getFeatureCategories(req)
                .then((data) => {
                  res.json({
                    count: count,
                    data: data
                  });
                })
            })
        } else {
          res.json({
            'status': 'error',
            'message': 'category not found'
          })
        }
      });

  router.route('/categories/tabs')
    .get((req, res) => {
      getCategoryTabs(req).then((categoryTabs) => {
          res.json(categoryTabs);
        })
        .catch(err => {
          res.send(err)
        })
    });


}
