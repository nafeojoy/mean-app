import Banner from '../../models/banner.model';
import PromotionalImage from '../../models/promotional-image.model';

export default (app, router, jwt) => {
  router.route('/active-slider-images')
    .get((req, res) => {
      let res_result = new Object({
        success: true
      });
      Banner.find({
          is_enabled: true
        })
        .sort({ 'priority': 1 })
        .exec()
        .then(banners => {
          res_result.banners = banners;
          return PromotionalImage.find({
            is_enabled: true
          }).limit(2)
        })
        .then(promotionalImage => {
          res_result.promotionalImages = promotionalImage;
          res.json(res_result);
        })
        .catch(err => {
          res.json({
            success: false,
            err: err
          })
        })
    })
}
