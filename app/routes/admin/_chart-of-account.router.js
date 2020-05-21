import ChartOfAccount from '../../models/chart-of-account.model';
import CostCenter from '../../models/cost-center.model';

export default (app, router, auth, logger) => {

  router.route('/chart-of-account')
    .get(auth, (req, res) => {
      var root = {};
      ChartOfAccount.findOne({
        parent: {
          $exists: false
        }
      })
        .exec()
        .then(parentChartOfAccount => {
          root = parentChartOfAccount;
          return ChartOfAccount.find({
            parent: parentChartOfAccount._id
          })
        })
        .then(childs => {
          if (childs.length > 0) {
            var chartOfAccountes = [];
            var newRoot = {
              _id: root._id,
              name: root.name,
              hasChildren: true
            }
            chartOfAccountes.push(newRoot);
            res.json(chartOfAccountes);
          } else {
            var chartOfAccountes = [];
            var newRoot = {
              _id: root._id,
              name: root.name,
              hasChildren: false
            }
            chartOfAccountes.push(newRoot);
            res.json(chartOfAccountes);
          }
        })
        .catch(err => {
          // req.log.info(err);
          res.send(err);
        })
    })

    .post(auth, (req, res) => {
      if (req.body.parent._id) {
        ChartOfAccount.count()
          .exec((err, total) => {
            if (!err) {
              var newChartOfAccount = new ChartOfAccount();
              var nextPosition = total + 1;
              newChartOfAccount.account_code = req.body.account_code;
              newChartOfAccount.name = req.body.name;
              newChartOfAccount.voucher_type = req.body.voucher_type;
              newChartOfAccount.note = req.body.note;
              newChartOfAccount.parent = req.body.parent._id;
              newChartOfAccount.is_enabled = req.body.is_enabled;
              newChartOfAccount.position = req.body.position ? req.body.position : nextPosition;
              newChartOfAccount.created_by = req.user._id;
              newChartOfAccount.updated_by = req.user._id
              newChartOfAccount.save(err => {
                if (!err) {
                  ChartOfAccount.update({ _id: newChartOfAccount.parent }, { $set: { is_leaf: false } })
                    .exec()
                    .then(prnt => {
                      res.json(newChartOfAccount);
                    })
                } else {
                  res.json({ message: "Internal Server error.", err: err })
                }
              })
            }
          })
      } else {
        res.json({ message: "Invalid request" })
      }
    });

  router.route('/chart-of-account/detail/:id')
    .get((req, res) => {
      ChartOfAccount.findOne({
        '_id': req.params.id
      })
        .select({ name: 1, account_code: 1, voucher_type: 1, note: 1, is_enabled: 1 })
        .populate({
          path: 'parent',
          select: "name account_code"
        })
        .exec((err, chartOfAccounte) => {
          if (err)
            res.send(err);
          else {
            res.json(chartOfAccounte);
          }
        })
    })


  router.route('/chart-of-account/:id')
    .get((req, res) => {
      ChartOfAccount.find({
        'parent': req.params.id
      })
        .select({
          name: 1
        })
        .exec((err, chartOfAccountes) => {
          if (err)
            res.send(err);
          else {
            checkHasChildren(chartOfAccountes)
              .then(newParents => {
                res.json(newParents);
              })
          }
        })
    })

    .put(auth, (req, res) => {
      ChartOfAccount.findOne({
        '_id': req.params.id
      }, (err, newChartOfAccount) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          newChartOfAccount.account_code = req.body.account_code;;
          newChartOfAccount.name = req.body.name;
          newChartOfAccount.voucher_type = req.body.voucher_type;
          newChartOfAccount.is_enabled = req.body.is_enabled;
          newChartOfAccount.note = req.body.note;
          newChartOfAccount.created_at = new Date();
          newChartOfAccount.updated_at = new Date();
          newChartOfAccount.created_by = req.user._id;
          newChartOfAccount.updated_by = req.user._id
        }
        return newChartOfAccount.save((err) => {
          if (err)
            res.send(err);
          else
            return res.send(newChartOfAccount);
        });
      })
    })

    .delete(auth, (req, res) => {
      ChartOfAccount.find({
        '_id': req.params.id
      })
        .exec()
        .then(chartOfAccount => {
          return deleteChartOfAccountRecursively(chartOfAccount)
        })
        .then(status => {
          res.json({
            is_delete: true
          });
        })
        .catch(err => {
          res.json({
            status: false
          });
        })
    });

  router.route('/chart-of-account/leaf-account-and-cost/list')
    .get(auth, (req, res) => {
      let data = { success: true }
      ChartOfAccount.find({ is_leaf: true })
        .select({ name: 1, account: 1 })
        .exec()
        .then(accounts => {
          data.accounts = accounts;
          return CostCenter.find({ is_enabled: true })
        })
        .then(costcenters => {
          data.costcenters = costcenters;
          res.json(data)
        })
        .catch(err => {
          res.json({ success: false, message: "Internal server error.", err: err });
        })
    })


  router.route('/chartOfAccount/root/childs')
    .get(auth, (req, res) => {
      let user = req.user;
      if (user.role.name == 'Development') {
        ChartOfAccount.find()
          .exec()
          .then(chartOfAccount => {
            checkHasChildren(chartOfAccount).then(newParents => {
              res.json(newParents);
            })
          })

      } else {
        Role.findOne({
          '_id': user.role._id
        })
          .populate({
            path: 'full_generation'
          })
          .exec()
          .then(role => {
            let ids = role.full_generation;
            checkHasChildren(ids).then(newParents => {
              res.json(newParents);
            })
          })
      }

    });


  function checkHasChildren(list) {
    var newChartOfAccounts = list.map(listObj => {
      return new Promise((resolve, reject) => {
        ChartOfAccount.find()
          .where('parent').equals(listObj._id)
          .exec()
          .then((childs, err) => {
            if (!err) {
              if (childs && Array.isArray(childs) && childs.length > 0) {
                var newObj = {
                  name: listObj.name,
                  text: listObj.name,
                  path: listObj.path,
                  parent: listObj.parent,
                  data: listObj.data,
                  permissions: listObj.permissions,
                  _id: listObj._id,
                  left: listObj.left,
                  right: listObj.right,
                  hasChildren: true
                }
                resolve(newObj);
              } else {
                var newObj = {
                  name: listObj.name,
                  text: listObj.name,
                  path: listObj.path,
                  parent: listObj.parent,
                  data: listObj.data,
                  permissions: listObj.permissions,
                  _id: listObj._id,
                  left: listObj.left,
                  right: listObj.right,
                  hasChildren: false
                }
                resolve(newObj);
              }
            } else {
              ////console.log(err);
              reject(err);
            }
          })
      })
    })
    return Promise.all(newChartOfAccounts);
  }




}
