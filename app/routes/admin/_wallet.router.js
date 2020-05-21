import Subscriber from '../../models/subscriber.model';
import Order from '../../models/order.model';
import Wallet from '../../models/wallet.model';
import {
    getDateString
} from '../public/api.service.js';
import mongoose from 'mongoose';

export default (app, router, auth) => {
    router.route('/wallet-adjustment/subscriber-query/:param')
        .get((req, res) => {
            let searchParam = new RegExp(req.params.param, "i");

            Subscriber.find({
                    $and: [
                        // {

                        //     is_close: false,
                        //     is_deactive: false,
                        //     is_verified: true
                        // },
                        // {
                        //     $or: [
                        //         { provider: 'local_mail' },
                        //         { provider: 'local_phone' }
                        //     ]

                        // },
                        {
                            $or: [
                                { username: searchParam },
                                { first_name: searchParam },
                                { phone_number: searchParam },
                                { referral_code: req.params.param },
                                { email: searchParam }
                            ]
                        }
                    ]

                })
                .exec()
                .then(subscribers => {
                    if (subscribers) {
                        res.json({
                            success: true,
                            message: "Subscribers found",
                            data: subscribers
                        })
                    } else {
                        res.json({
                            success: false,
                            message: "Subscribers Not found"
                        })
                    }
                })
        })


    router.route('/wallet-adjustment/wallet-list')
        .get((req, res) => {


            Wallet.aggregate([{
                        $lookup: {
                            from: "subscribers",
                            localField: 'created_by',
                            foreignField: '_id',
                            as: 'subscriber'
                        }
                    }

                ])
                .sort({
                    _id: -1
                })
                .limit(50)
                .exec((err, wallet) => {
                    if (err) {
                        res.send(err);

                    } else {
                        res.json({
                            'data': wallet
                        })
                    }
                })

        })



    router.route('/wallet-adjustment/update')
        .put((req, res) => {
            console.log(req.body)
            let sub_id = req.body.subscriber_id;
            let orderNo = req.body.wallet_info.order_no;
            let cardNo = req.body.wallet_info.card_no;
            let comment = req.body.wallet_info.comment;
            let transNo = 'wa-' + (new Date().getTime());
            let paymentType = req.body.payment_type;

            if (req.body.collection_type == 'Credit') {
                if (orderNo) {
                    Order.findOne({
                            order_no: orderNo
                        })
                        .then(order => {
                            if (order) {
                                let prevPaid = order.payment_collection.total_paid;
                                let crAmount = req.body.wallet_info.cr_amount;
                                let currentPaid = prevPaid + crAmount;
                                let payableAmount = order.payable_amount;

                                if (payableAmount >= crAmount) {
                                    Wallet.create({
                                            transaction_no: transNo,
                                            created_at: getDateString(new Date()),
                                            wallet_amount: req.body.wallet_info.cr_amount,
                                            collection_type: 'cr',
                                            cr_amount: req.body.wallet_info.cr_amount,
                                            payment_type: paymentType,
                                            order_no: orderNo,
                                            created_by: sub_id,
                                            created_by_admin: req.body.user_info.id,
                                            is_validated: true,
                                            comment: comment
                                        })
                                        .then(wallet => {
                                            Subscriber.findOne({
                                                    _id: mongoose.Types.ObjectId(sub_id)
                                                })
                                                .exec()
                                                .then(subscriber => {
                                                    if (subscriber) {
                                                        let cos = {
                                                            wallet_trans_id: wallet._id,
                                                            wallet_amount: req.body.wallet_info.cr_amount,
                                                            cr_amount: req.body.wallet_info.cr_amount,
                                                            is_available: true,
                                                            is_used: false
                                                        };
                                                        subscriber.cr_balance_status.push(cos);
                                                        subscriber.save();
                                                        res.json({
                                                            success: true,
                                                            data: subscriber,
                                                            message: "User Wallet is Credited Successfully"
                                                        })
                                                    } else {
                                                        res.json({
                                                            success: true,
                                                            data: subscriber,
                                                            message: "Failed"
                                                        })
                                                    }
                                                })
                                        })
                                } else if (payableAmount < crAmount) {
                                    res.json({
                                        success: false,
                                        message: "You can not over pay Order Value"
                                    })
                                }
                            } else {
                                res.json({
                                    success: false,
                                    message: "Order Not found"
                                })
                            }
                        })
                } else {
                    Wallet.create({
                            transaction_no: transNo,
                            created_at: getDateString(new Date()),
                            wallet_amount: req.body.wallet_info.cr_amount,
                            collection_type: 'cr',
                            cr_amount: req.body.wallet_info.cr_amount,
                            payment_type: paymentType,
                            card_no: cardNo,
                            created_by: sub_id,
                            created_by_admin: req.body.user_info.id,
                            is_validated: true,
                            comment: comment
                        })
                        .then(wallet => {
                            Subscriber.findOne({
                                    _id: mongoose.Types.ObjectId(sub_id)
                                })
                                .exec()
                                .then(subscriber => {
                                    if (subscriber) {
                                        let cos = {
                                            wallet_trans_id: wallet._id,
                                            wallet_amount: req.body.wallet_info.cr_amount,
                                            cr_amount: req.body.wallet_info.cr_amount,
                                            is_available: true,
                                            is_used: false
                                        };
                                        subscriber.cr_balance_status.push(cos);
                                        subscriber.save();
                                        res.json({
                                            success: true,
                                            data: subscriber,
                                            message: "User Wallet is Credited Successfully"
                                        })
                                    } else {
                                        res.json({
                                            success: true,
                                            data: subscriber,
                                            message: "Failed"
                                        })
                                    }
                                })
                        })
                }
            } else if (req.body.collection_type == 'Debit') {
                Order.findOne({
                        order_no: orderNo
                    })
                    .then(order => {
                        if (order) {
                            let prevPaid = order.payment_collection.total_paid;
                            let drAmount = req.body.wallet_info.dr_amount;
                            let currentPaid = prevPaid + drAmount;
                            let payableAmount = order.payable_amount;

                            if (payableAmount == currentPaid) {
                                order.payment_collection.is_full_collected = true;
                                order.is_paid = true;
                                order.payment_collection.total_paid = currentPaid;
                                order.payment_collection.due_amount = payableAmount - currentPaid;
                                order.wallet_amount = parseInt(order.wallet_amount) + parseInt(drAmount);
                                order.save(function(err, ord) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            data: err
                                        })
                                    } else {
                                        Wallet.create({
                                                transaction_no: transNo,
                                                created_at: getDateString(new Date()),
                                                wallet_amount: (-1) * drAmount,
                                                collection_type: 'dr',
                                                dr_amount: drAmount,
                                                order_no: orderNo,
                                                created_by: sub_id,
                                                created_by_admin: req.body.user_info.id,
                                                payment_type: paymentType,
                                                is_validated: true
                                            })
                                            .then(wallet => {

                                                Subscriber.findOne({
                                                        _id: mongoose.Types.ObjectId(sub_id)
                                                    })
                                                    .exec()
                                                    .then(subscriber => {
                                                        if (subscriber) {
                                                            let cos = {
                                                                wallet_trans_id: wallet._id,
                                                                wallet_amount: (-1) * drAmount,
                                                                dr_amount: drAmount,
                                                                is_available: true,
                                                                is_used: true
                                                            };
                                                            subscriber.cr_balance_status.push(cos);
                                                            subscriber.save();
                                                        }
                                                        res.json({
                                                            success: true,
                                                            data: subscriber,
                                                            message: "User Wallet amount is debited and Order is fully paid"
                                                        })
                                                    })
                                            })
                                    }
                                })

                            } else if (payableAmount < currentPaid) {
                                res.json({
                                    success: false,
                                    message: "You can not over pay Order Value"
                                })
                            } else {
                                order.payment_collection.is_full_collected = false;
                                order.is_paid = false;
                                order.payment_collection.total_paid = currentPaid;
                                order.payment_collection.due_amount = payableAmount - currentPaid;
                                order.wallet_amount = parseInt(order.wallet_amount) + parseInt(drAmount);
                                order.save(function(err, ord) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            data: err
                                        })
                                    } else {
                                        Wallet.create({
                                                transaction_no: transNo,
                                                created_at: getDateString(new Date()),
                                                wallet_amount: (-1) * drAmount,
                                                collection_type: 'dr',
                                                dr_amount: drAmount,
                                                payment_type: paymentType,
                                                order_no: orderNo,
                                                created_by: sub_id,
                                                created_by_admin: req.body.user_info.id,
                                                is_validated: true
                                            })
                                            .then(wallet => {
                                                Subscriber.findOne({
                                                        _id: mongoose.Types.ObjectId(sub_id)
                                                    })
                                                    .exec()
                                                    .then(subscriber => {
                                                        if (subscriber) {
                                                            let cos = {
                                                                wallet_trans_id: wallet._id,
                                                                wallet_amount: (-1) * drAmount,
                                                                dr_amount: drAmount,
                                                                is_available: true,
                                                                is_used: true
                                                            };
                                                            subscriber.cr_balance_status.push(cos);
                                                            subscriber.save();
                                                        }
                                                        res.json({
                                                            success: true,
                                                            data: subscriber,
                                                            message: "User Wallet amount is debited and Order is Partially paid"
                                                        })
                                                    })
                                            })
                                    }
                                })
                            }

                        } else {
                            res.json({
                                success: false,
                                message: "Order Not Found"
                            })
                        }

                    })
            }
        })
}