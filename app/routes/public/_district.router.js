import District from '../../models/district.model';
import config from '../../../config/config.json'
import mongoose from 'mongoose';

export default (app, router, auth) => {
  router.route('/district')
    .get((req, res) => {
      District.find()
        .select({
          DISTRICTT_NAME: 1,
          DISTRICT_NO: 1
        })
        .sort({
          DISTRICTT_NAME: 1
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
