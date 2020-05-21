import Customerquery from '../../models/customer-query.model';
import {
  getNextSequence
} from "../public/api.service";
import mongoose from 'mongoose';

export default (app, router, auth) => {
  router.route('/customer-query')
    .get((req, res) => {
      Customerquery.find()
        .select({
          query: 1,
          name: 1,
          phone_number: 1,
          created_from: 1,
          query_at: 1,
          message: 1
        })
        .sort({
          query_at: -1
        })
        .limit(10)
        .exec()
        .then(query => {
          res.json(query);
        })
        .catch(err => {
          res.send(err);
        })
    })
    .post((req, res) => {
      getNextSequence("customer_query_no")
        .then(seq => {
          Customerquery.create({
            name: req.body.name,
            query_no: seq,
            phone_number: req.body.phone_number,
            message: req.body.message,
            query: {
              book_name: req.body.book,
              author: req.body.author
            },
            created_from: req.body.from,
            query_at: new Date()
          }, (err, query) => {
            if (err)
              res.json({
                success: false
              });
            else
              res.json({
                success: true
              });
          })
        })
    })

  router.route('/customer-query/search-query/:text')
    .get((req, res) => {
      let search = req.params.text;
      Customerquery.find({
          query_no: req.params.text
        })
        .exec()
        .then(queries => {
          res.json(queries);
        })
    })

  router.route('/customer-query/comment/:id')
    .get((req, res) => {
      Customerquery.findOne({
          _id: req.params.id
        })
        .select({
          comment: 1
        })
        .exec()
        .then(comment => {
          res.json(comment);
        })
        .catch(err => {
          res.send(err);
        })
    })

    .put(auth, (req, res) => {
      Customerquery.findOne({
          _id: req.params.id
        })
        .exec()
        .then(qry => {
          if (qry && qry) {
            qry.comment.unshift({
              name: req.user.local.username,
              user: req.user._id,
              comment_at: new Date(),
              speech: req.body.comment
            })

            qry.save(err => {
              if (!err) {
                res.json({
                  success: true,
                  comment: qry.comment
                });
              } else {
                res.json({
                  success: false
                })
              }
            })
          }
        })
        .catch(err => {
          res.send(err);
        })
    })

  router.route('/customer-query/:answer_status')
    .get((req, res) => {
      let result = new Object();
      let page_no = req.query.page_no ? parseInt(req.query.page_no) : 1;
      Customerquery.find({
          answered: req.params.answer_status
        })
        .select({
          query_at: 1,
          query_no: 1,
          query: 1,
          name: 1,
          phone_number: 1,
          answered: 1,
          message: 1,
          created_from: 1
        })
        .sort({
          query_at: -1
        })
        .skip(10 * (page_no - 1))
        .limit(10)
        .exec()
        .then(queries => {
          result.queries = queries;
          return Customerquery.aggregate([{
            $group: {
              _id: '$answered',
              count: {
                $sum: 1
              }
            }
          }])
        })
        .then(count_result => {
          result.count_result = count_result;
          res.json(result);
        })
        .catch(err => {
          res.send(err);
        })
    })

  router.route('/customer-query/update-status/:id')
    .put(auth, (req, res) => {
      Customerquery.update({
          _id: req.params.id
        }, {
          $set: {
            answered: true,
            mark_as_done_by: req.user._id,
            mark_as_done_at: new Date()
          }
        })
        .exec()
        .then(result => {
          if (result.ok) {
            res.json({
              success: true
            });
          } else {
            res.json({
              success: false,
              message: 'Failed, internal server error occured'
            });
          }
        })
        .catch(err => {
          res.json({
            success: false,
            message: 'Failed, internal server error occured'
          });
        })
    })

}
