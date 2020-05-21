
import Purchase from '../../models/inventory-models/purchase.model';

export default (app, router, auth) => {

  router.route('/account-report/purchase')
    .post((req, res) => {
      res.json({ success: true, data: [] });
    })

  router.route('/account-report/stock')
    .post((req, res) => {

    })

  router.route('/account-report/expense')
    .post((req, res) => {

    })

  router.route('/account-report/collection')
    .post((req, res) => {

    })

}
