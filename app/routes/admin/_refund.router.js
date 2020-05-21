import Refund from '../../models/refund.model';
import mongoose from 'mongoose';
import {
    getDateOfThirtyDayAgo,
    getDatesOfRange
} from './admin-api.service';

export default (app, router, auth) => {


    router.route('/refund-request')
        .post((req, res) => {
            Refund.create({
                order_no: req.body.order_no,
                refund_amount: req.body.refund_amount,
                refund_reason: req.body.refund_reason,
                refund_comment: req.body.refund_comment,
                preferred_method: req.body.preferred_method,
                customer_mobile: req.body.customer_mobile,
                admin_name: req.body.admin_name,
                created_by_admin: req.body.created_by_admin,
                requested_at: new Date()
            }, (err, refund) => {
                if (err) {
                    res.json({
                        success: false,
                        data: err
                    })
                } else {
                    res.json({
                        success: true,
                        data: refund
                    })
                }
            })
        })


    router.route('/refund-execute/refund-list/')
        .post((req, res) => {

            let criteria = req.body;

            // console.log(criteria)
            // console.log('------')

            //Object.keys(criteria).length

            if (Object.keys(criteria).length) {
                let cond = new Object();
                criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
                var lte_date = new Date(criteria.from_date);
                lte_date.setHours(0, 0, 0, 0);
                var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
                gte_date.setHours(23, 59, 59, 999);
            }

            let search_criteria = {
                order_no: { $exists: true }
            }

            if (!Object.keys(criteria).length || criteria.not_executed) {
                search_criteria['payer_name'] = {
                    $exists: false
                }
            } else if (criteria && criteria.executed) {
                search_criteria['payer_name'] = {
                    $exists: true
                }
            }



            if (criteria.from_date && criteria.to_date) {
                search_criteria['requested_at'] = {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }



            //  console.log(search_criteria)



            Refund.find(search_criteria)
                .sort({
                    _id: -1
                })
                .limit(50)
                .exec((err, refund) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json({
                            'data': refund
                        })
                    }
                })

        })

    router.route('/refund-execute/:id')
        .get((req, res) => {

            Refund.findOne({
                    _id: req.params.id
                })
                .exec((err, refund) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json({
                            'data': refund
                        })
                    }
                })

        })

    router.route('/refund-execute/update')
        .put((req, res) => {
            let execute_data = req.body;
            // console.log('execute_data')
            // console.log(execute_data)

            Refund.update({
                    _id: execute_data.refund_id
                }, {
                    $set: {
                        payer_name: execute_data.payer_name,
                        'payment_info.ssl_ref_id': execute_data.ssl_ref_id,
                        'payment_info.bkash_tran_id': execute_data.bkash_tran_id,
                        'payment_info.bkash_from_no': execute_data.bkash_from_no,
                        'payment_info.bkash_to_no': execute_data.bkash_to_no,
                        executed_at: execute_data.executed_at,
                        updated_at: new Date(),
                        'is_executed': true
                    }
                })
                .then(refund => {
                    res.json({
                        success: true,
                        'data': refund
                    })
                })
                .catch(err => {
                    res.json({
                        success: false,
                        'date': err
                    })
                })



            // Refund.findOne({
            //         _id: req.params.id
            //     })
            //     .exec((err, refund) => {
            //         if (err) {
            //             res.send(err)
            //         } else {
            //             res.json({
            //                 'data': refund
            //             })
            //         }
            //     })

        })

}