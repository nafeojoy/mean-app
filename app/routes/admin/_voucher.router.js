import Voucher from '../../models/voucher.model';
import VoucherEntry from '../../models/voucher-entry.model';

export default (app, router, auth) => {
  router.route('/voucher-entry')
    .get(auth, (req, res) => {
      let pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 1;
      let data = new Object();
      Voucher.count()
        .exec()
        .then(count => {
          data.count = count;
          return Voucher.find()
            .skip((pageNo - 1) * 10)
            .limit(10)
            .sort({ created_at: 1 })
        })
        .then(vouchers => {
          data.vouchers = vouchers;
          data.success = true;
          res.json(data);
        })
        .catch(err => {
          res.json({ success: false, err: err, message: "Internal Server Error!" });
        })
    })

    .post(auth, (req, res) => {
      Voucher.findOne({ baf_no: req.body.baf_no })
        .exec()
        .then(vchr => {
          if (vchr && vchr._id) {
            res.json({ success: false, message: "BAF No. has already taken." });
          } else {
            Voucher.find({})
              .sort({ $natural: -1 })
              .limit(1)
              .exec()
              .then(lastVoucher => {
                return Voucher.create({
                  voucher_type: req.body.voucher_type,
                  baf_no: req.body.baf_no,
                  voucher_date: req.body.voucher_date,
                  fiscal_year: req.body.fiscal_year,
                  total_debit: req.body.total_debit,
                  total_credit: req.body.total_credit,
                  sum_of_debit_after_update: lastVoucher.length > 0 ? lastVoucher[0].sum_of_debit_after_update + req.body.total_debit : req.body.total_debit,
                  sum_of_credit_after_update: lastVoucher.length > 0 ? lastVoucher[0].sum_of_credit_after_update + req.body.total_credit : req.body.total_debit,
                  created_by: req.user._id,
                  updated_by: req.user._id
                })
              })
              .then(voucher => {
                return createVoucherEntry(req.body.entry, voucher);
              })
              .then(entries => {
                res.json({ success: true });
              })
              .catch(err => {
                res.json({ success: false, message: "Internal server error", err: err });
              })
          }
        })

    });

  function createVoucherEntry(data, voucher) {
    let entries = data.map(dt => {
      return new Promise((resolve, reject) => {
        VoucherEntry.create({
          voucher_id: voucher._id,
          account_id: dt.account_id,
          debit: dt.debit,
          credit: dt.credit,
          responsible_center: dt.responsible_center,
          created_by: voucher.created_by,
          updated_by: voucher.created_by
        })
          .then(entry => {
            resolve(entry)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
    return Promise.all(entries);
  }

  router.route('/voucher/:id')
    .get(auth, (req, res) => {
      Voucher.findOne({
        '_id': req.params.id
      }, (err, voucher) => {
        if (err) {
          res.send(err);
        }
        res.send(voucher)
      })
    })

    .put(auth, (req, res) => {
      Voucher.findOneAndUpdate({
        '_id': req.params.id
      }, {
          $set: {
            title: req.body.title,
            code: req.body.code,
            symbol_left: req.body.symbol_left,
            symbol_right: req.body.symbol_right,
            value: req.body.value,
            decimal_place: req.body.decimal_place,
            is_enabled: req.body.is_enabled,
            order: req.body.order
          }
        }, {
          new: true
        }, (err, voucher) => {
          if (err) {
            res.send(err)
          }
          res.send(voucher)
        })
    })

    .delete(auth, (req, res) => {
      Voucher.remove({
        _id: req.params.id
      }, (err, data) => {
        if (err) {
          res.send(err)
        }
        res.send({
          'message': 'Voucher Deleted',
          'status': true
        })
      })
    })
}
