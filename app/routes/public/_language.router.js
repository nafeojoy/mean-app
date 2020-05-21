import Language from '../../models/language.model';
import config from '../../../config/config.json'

export default (app, router) => {
  router.route('/languages')
    .get((req, res) => {
      Language.find()
        .select({
          name: 1,
          code: 1
        })
        .exec((err, language) => {
          if (err)
            res.send(err);
          else
            res.json(language)
        })
    })
}
