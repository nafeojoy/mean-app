import Thana from '../../models/thana.model';
import config from '../../../config/config.json'
import mongoose from 'mongoose';

export default (app, router, auth) => {
  router.route('/thana/:district_id')
    .get((req, res) => {
      Thana.find({
          F_DISTRICT_NO: req.params.district_id
        })
        .select({
          THANA_NAME: 1,
          AREA_NAMES:1,
          CARRIER:1,
          POST_CODES:1
        })
        .sort({
          THANA_NAME: 1
        })
        .exec()
        .then(districts => {
          res.json(districts)
        })
        .catch(err => {
          res.send(err)
        })
    })

}
