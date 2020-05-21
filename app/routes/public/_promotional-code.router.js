import Wallet from "../../models/wallet.model";
import PromotionalCode from "../../models/promotional-code.model";
import Order from "../../models/order.model";
import Subscriber from "../../models/subscriber.model";

import {
    exec
} from "shelljs";

export default (app, router, auth) => {
    router.route("/promotional-code/:code")
        .get(auth, (req, res) => {
            var initialCode = req.params.code;
            var promoCode = initialCode.toUpperCase();
            var referCode = initialCode;
            var totalPrice = req.headers['total_price'];
            var requestingSubscriber = req.headers['sub_id'];
            let user = req.user;

            PromotionalCode.findOne({
                    promo_code: promoCode
                })
                .exec()
                .then(promo => {
                    let promoCount = 0;
                    if (promo) {

                        //Generic Check
                        if (promo.is_generic) {
                            let promoId = promo._id;
                            Order.count({
                                    promo_id: promoId,
                                    created_by: user._id
                                })
                                .exec()
                                .then(count => {
                                    if (count > 0) {
                                        res.json({
                                            success: false,
                                            message: "You already used this Promo Code"
                                        });
                                    } else {
                                        if (promo && promo._id && promo.is_active) {
                                            let today = new Date();
                                            if (today <= new Date(promo.end_date)) {
                                                res.json({
                                                    success: true,
                                                    data: promo,
                                                    type: "promo",
                                                    count: count
                                                });
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Promo Code is expired"
                                                });
                                            }
                                        } else {
                                            res.json({
                                                success: false,
                                                message: "Promo Code is Invalid"
                                            });
                                        }
                                    }
                                })

                        } else {
                            let promoId = promo._id;
                            Order.count({
                                    promo_id: promoId
                                })
                                .exec()
                                .then(coun => {
                                    if (coun < 3) {
                                        Order.findOne({
                                                $and: [{
                                                    promo_id: promoId
                                                }]
                                            })
                                            .exec()
                                            .then(order => {
                                                if (order) {
                                                    if (order.created_by == user._id) {
                                                        if (promo && promo._id && promo.is_active) {
                                                            let today = new Date();
                                                            if (today <= new Date(promo.end_date)) {
                                                                res.json({
                                                                    success: true,
                                                                    data: promo,
                                                                    type: "promo",
                                                                    count: order
                                                                });
                                                            } else {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Promo Code is expired"
                                                                });
                                                            }
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Promo Code is Invalid"
                                                            });
                                                        }
                                                    } else {
                                                        res.json({
                                                            success: false,
                                                            message: "Promo Code is already used by someone else"
                                                        });
                                                    }
                                                } else {
                                                    if (promo && promo._id && promo.is_active) {
                                                        let today = new Date();
                                                        if (today <= new Date(promo.end_date)) {
                                                            res.json({
                                                                success: true,
                                                                data: promo,
                                                                type: "promo",
                                                                count: order
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Promo Code is expired"
                                                            });
                                                        }
                                                    } else {
                                                        res.json({
                                                            success: false,
                                                            message: "Promo Code is Invalid"
                                                        });
                                                    }
                                                }
                                            });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "Promo Code is already used 3 times"
                                        });
                                    }
                                });
                        }
                    } else {
                        //Referral Code Region
                        if (true) {

                            Subscriber.findOne({
                                    referral_code: referCode
                                }, {
                                    _id: 1
                                })
                                .exec()
                                .then(refer => {
                                    if (refer && (refer._id != requestingSubscriber)) {
                                        Order.findOne({
                                                created_by: requestingSubscriber
                                            })
                                            .exec()
                                            .then(checkOrder => {
                                                console.log(checkOrder)
                                                if (checkOrder) {
                                                    res.json({
                                                        success: false,
                                                        message: "Sorry, you are not a new user!"
                                                    });
                                                } else {
                                                    res.json({
                                                        success: true,
                                                        data: {
                                                            discount: Math.round(totalPrice * .05),
                                                            referral_code: referCode
                                                        },
                                                        type: "refer"
                                                    });

                                                }
                                            })
                                    } else if (refer._id == requestingSubscriber) {
                                        res.json({
                                            success: false,
                                            message: "You can not use your own referral code"
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "Promo/Referral Code is Invalid"
                                        });
                                    }
                                })
                                .catch(err => {
                                    res.send({
                                        success: false,
                                        message: "Invalid Promo Code"
                                    });
                                })

                        } else {
                            res.json({
                                success: false,
                                message: "Order Value should be minimum of 600"
                            });
                        }


                    }
                })
                .catch(err => {
                    console.log(err);
                    res.send({
                        success: false,
                        message: "Invalid Promo Code"
                    });
                });
        });

    // 'bbr'  + new Date().getTime()

    // router.route('/promotional-code/:id')

    //     .get((req, res) => {
    //         PromotionalCode.findOne({ '_id': req.params.id })
    //             .exec((err, promotionalCode) => {
    //                 if (err)
    //                     res.send(err);
    //                 else
    //                     res.json(promotionalCode);
    //             })
    //     })

    //     .put(auth, (req, res) => {
    //         PromotionalCode.findOne({
    //             '_id': req.params.id
    //         }, (err, promotionalCode) => {
    //             if (err)
    //                 res.send(err);
    //             if (req.body._id) {
    //                 promotionalCode.is_active = req.body.is_active;
    //                 promotionalCode.promo_code = req.body.promo_code;
    //                 promotionalCode.discount = req.body.discount;
    //                 promotionalCode.target_no = req.body.target_no;
    //                 promotionalCode.applied_no = req.body.applied_no;
    //                 promotionalCode.start_date = req.body.start_date;
    //                 promotionalCode.end_date = req.body.end_date;
    //                 promotionalCode.updated_by = req.body.updated_by;
    //                 promotionalCode.updated_at = new Date()

    //             }
    //             return promotionalCode.save((err) => {
    //                 if (err) {
    //                     ////console.log("Error");
    //                     res.send(err);
    //                 }

    //                 return res.send(PromotionalCode);
    //             });
    //         })
    //     })


    // Wallet.create({
    //         transaction_no: 'bbr' + new Date().getTime(),
    //         created_at: new Date(),
    //         wallet_amount: Math.round(totalPrice * .05),
    //         cr_amount: Math.round(totalPrice * .05),
    //         collection_type: "cr",
    //         payment_type: "referral",
    //         created_by: refer._id,
    //         is_validated: true
    //     })
    //     .then(wallet => {
    //         Subscriber.findOne({
    //                 _id: refer._id
    //             })
    //             .exec()
    //             .then(subUp => {
    //                 if (subUp) {
    //                     let cos = {
    //                         wallet_trans_id: wallet._id,
    //                         wallet_amount: req.body.amount,
    //                         cr_amount: Math.round(totalPrice * .05),
    //                         is_available: true,
    //                         is_used: false
    //                     };
    //                     subUp.cr_balance_status.push(cos);
    //                     subUp.save()
    //                         .then(result => {
    //                             res.json({
    //                                 success: true,
    //                                 data: {
    //                                     discount: Math.round(totalPrice * .05),
    //                                     referral_code: referCode
    //                                 },
    //                                 type: "refer"
    //                             });
    //                         })
    //                 } else {
    //                     res.json({
    //                         success: false,
    //                         message: "Sorry, Something went wrong!"
    //                     });
    //                 }
    //             });
    //     })
    //     .catch(err => {
    //         res.json({
    //             success: false,
    //             data: 'Catch'
    //         })
    //     })
};