import Customerquery from '../../models/customer-query.model';
import mongoose from 'mongoose';
import {
  getNextSequence
} from './api.service';

export default (app, router, logger) => {
  router.route('/customer-query')
    .post((req, res) => {
      getNextSequence("customer_query_no")
        .then(seq => {
          Customerquery.create({
            name: req.body.name,
            query_no: seq,
            phone_number: req.body.phone_number,
            message: req.body.message,
            answered: false,
            query: {
              book_name: req.body.book,
              author: req.body.author
            },
            created_from: "Public Site",
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
}
