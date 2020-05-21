import Order from "../../models/order.model";
import OrderStatus from "../../models/order-status.model";
import Cart from "../../models/cart.model";
import Paymentrequest from "../../models/payment-request.model";
import Paymentresponse from "../../models/payment-response.model";
import WalletVoucher from '../../models/wallet-voucher.model';
import TempVoucher from "../../models/temp-voucher.model";

import mongoose from "mongoose";

import ShippingAddress from "../../models/shipping-address.model";
import {
    createPaymentrequestLog,
    createPaymentResponseLog
} from "./_order-payment.router";
import { getNextSequence, getDateString } from "./api.service.js";
import { sendMessage } from "./text-message.service";
import config from "../../../config/config.json";
import Subscriber from "../../models/subscriber.model";
import { parse } from "url";
export const freDeliveryOnlinePaymentActive = true;
export const amountOverFreeDelivery = 1;

export default (app, router, jwt) => {
    router.route("/order")
        .post((req, res) => {
            //console.log("this is calling");
            let walletId = undefined;

            if (req.body.wallet_id) {
                walletId = mongoose.Types.ObjectId(req.body.wallet_id);
            }

            let token = req.cookies.token || req.headers["token"];
            let order_data = {};
            let result_order = {};
            jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
                if (err) {
                    // //console.log("err")
                    // //console.log(err)
                    res.json({
                        success: false,
                        message: "Please login first"
                    });
                } else {
                    ////console.log("Order APPPPP")

                    let user = decoded; //user;
                    if (!user._id) {
                        user = decoded._doc;
                    }
                    checkTotalOrderToday(user._id, req.body.is_paid)
                        .then(result => {
                            if (result.status) {
                                if (!req.body.cart_id) {
                                    res.json({
                                        status: 404,
                                        message: "Please add item in your cart first"
                                    });
                                }
                                Cart.findOne({
                                    _id: req.body.cart_id
                                })
                                    .exec()
                                    .then(cart => {
                                        //   //console.log("cart");
                                        if (cart) {
                                            order_data.order_items = cart.products;
                                            return ShippingAddress.findOne({
                                                _id: req.body.address_id
                                            });
                                        } else {
                                            res.json({
                                                status: 404,
                                                message: "You have no item in your cart"
                                            });
                                        }
                                    })
                                    .then(delivery_address => {
                                        if (delivery_address) {
                                            if (delivery_address.carrier) {
                                                order_data.carrier = delivery_address.carrier;
                                            }
                                            order_data.delivery_address = delivery_address;

                                            return OrderStatus.findOne()
                                                .where("name")
                                                .equals("Pending")
                                                .exec();
                                        } else {
                                            res.json({
                                                status: 404,
                                                message: "Delivery address is invalid"
                                            });
                                        }
                                    })
                                    .then(status => {
                                        if (status) {
                                            let status_object = {
                                                status_id: status._id,
                                                status_name: status.name,
                                                updated_at: new Date()
                                            };
                                            getNextSequence("order_id")
                                                .then(seq => {
                                                    let total_book = 0;
                                                    let total_price = 0;
                                                    let payable_amount = 0;


                                                    if (!req.body.total_book ||
                                                        !req.body.total_price ||
                                                        !req.body.payable_amount
                                                    ) {
                                                        order_data.order_items.map(item => {
                                                            total_book += item.quantity;
                                                            total_price += item.quantity * item.price;
                                                        });
                                                        req.body.payable_amount =
                                                            parseInt(total_price, 10) + parseInt(req.body.delivery_charge, 10) + parseInt(req.body.wrapping_charge, 10) - parseInt(req.body.discount, 10);
                                                    } else {

                                                        req.body.payable_amount = parseInt(req.body.total_price, 10) + parseInt(req.body.delivery_charge, 10) + parseInt(req.body.wrapping_charge, 10) - parseInt(req.body.discount, 10);

                                                    }


                                                    let paid_amount;
                                                    if (req.body.wallet_amount > 0) {
                                                        if (req.body.wallet_amount == req.body.payable_amount) {
                                                            req.body.is_paid = true;
                                                            paid_amount = {
                                                                is_full_collected: true,
                                                                total_paid: req.body.wallet_amount,
                                                                collection_info: [{
                                                                    collected_amount: req.body.wallet_amount,
                                                                    collected_at: new Date(),
                                                                    gateway_ref: "5cc7de4f894ce5dff5be0afd"
                                                                }]
                                                            };
                                                        } else {
                                                            paid_amount = {
                                                                total_paid: req.body.wallet_amount,
                                                                collection_info: [{
                                                                    collected_amount: req.body.wallet_amount,
                                                                    collected_at: new Date(),
                                                                    gateway_ref: "5cc7de4f894ce5dff5be0afd"
                                                                }]
                                                            };
                                                        }
                                                    }
                                                    let public_cart_id = parseInt(req.headers["cart_id"])
                                                    
                                                    TempVoucher.findOne({
                                                        created_by : mongoose.Types.ObjectId(user._id),
                                                    }).then(temp_voucher_info =>{

                                                      //  console.log(public_cart_id);
                                                        if(temp_voucher_info != null){

                                                            setTimeout(() => {
                                                                TempVoucher.update({
                                                                    _id : mongoose.Types.ObjectId(temp_voucher_info._id),
                                                                }, {
                                                                    $set: {
                                                                        last_voucher_amount : temp_voucher_info.voucher_amount,
                                                                        order_no : seq,
                                                                        cart_id : public_cart_id,  
                                                                        is_active : false 
                                                                    }
                                                                }).exec()
                                                            }, 500)
    
    
                                                            setTimeout(() => {
                                                                WalletVoucher.update({
                                                                    created_by : mongoose.Types.ObjectId(temp_voucher_info.created_by),
                                                                }, {
                                                                    $set: {
                                                                        voucher_amount : temp_voucher_info.voucher_amount,
                                                                        last_voucher_amount : temp_voucher_info.voucher_amount,
                                                                    }
                                                                }).exec()
                                                            }, 500)
                                                        }
                                                    })

                                                    return Order.create({
                                                        order_no: seq,
                                                        order_string_date: getDateString(new Date()),
                                                        products: order_data.order_items,
                                                        delivery_charge: req.body.delivery_charge,
                                                        wrapping_charge: req.body.wrapping_charge,
                                                        wallet_id: walletId,
                                                        wallet_amount: req.body.wallet_amount,
                                                        total_book: req.body.total_book ?
                                                            req.body.total_book : total_book,
                                                        payable_amount: req.body.payable_amount ?
                                                            req.body.payable_amount : payable_amount,
                                                        total_price: req.body.total_price ?
                                                            req.body.total_price : total_price,
                                                        discount: req.body.discount,
                                                        promo_id: req.body.promo_id,
                                                        referral_code: req.body.referral_code,
                                                        current_order_status: status_object,
                                                        performed_order_statuses: [status_object],
                                                        delivery_address: order_data.delivery_address,
                                                        bkash_invoice_no: req.body.bkash_invoice_no,
                                                        bkash_payment_id: req.body.bkash_payment_id,
                                                        created_from: "web-" + req.device.type,
                                                        created_by: user._id,
                                                        payment_information: req.body.payment_information,
                                                        payment_collection: paid_amount,
                                                        is_paid: req.body.is_paid,
                                                        carrier: order_data.carrier
                                                    });
                                                })
                                                .then(order => {

                                                    let text_message = "Dear ";


                                                    if (order.delivery_address.sender_name) {
                                                        text_message = text_message.concat(
                                                            order.delivery_address.sender_name,
                                                            ", "
                                                        );
                                                    } else {
                                                        text_message = text_message.concat(
                                                            order.delivery_address.contact_name,
                                                            ", "
                                                        );
                                                    }


                                                    text_message = text_message.concat(
                                                        "Your order is placed successfully. Order ID#",
                                                        " "
                                                    );
                                                    text_message = text_message.concat(
                                                        order.order_no,
                                                        ". "
                                                    );
                                                    if (req.body.is_paid) {
                                                        text_message = text_message.concat(
                                                            "(Payment Tk " +
                                                            order.payable_amount +
                                                            " receieved).",
                                                            " "
                                                        );
                                                        let reqData = {
                                                            order_no: order.order_no,
                                                            req_url: "bKash",
                                                            req_payload: "bKash",
                                                            payable_amount: order.payable_amount,
                                                            request_at: new Date()
                                                        };
                                                        let resData = {
                                                            order_no: order.order_no,
                                                            response: "bKash",
                                                            response_at: new Date()
                                                        };
                                                        createPaymentrequestLog(reqData);
                                                        createPaymentResponseLog(resData);
                                                    }
                                                    if (!req.body.bkash_invoice_no) {
                                                        text_message = text_message.concat(
                                                            "We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                                            " "
                                                        );
                                                    }

                                                    if (order.delivery_address.sender_mobile) {
                                                        sendMessage({
                                                            phone_numbers: [
                                                                order.delivery_address.sender_mobile
                                                            ],
                                                            sms_for_order: {
                                                                order_id: order._id,
                                                                order_status: "Pending"
                                                            },
                                                            text: text_message,
                                                            sms_sent_for: "create_customer_order"
                                                        });
                                                    } else {
                                                        sendMessage({
                                                            phone_numbers: [
                                                                order.delivery_address.phone_number
                                                            ],
                                                            sms_for_order: {
                                                                order_id: order._id,
                                                                order_status: "Pending"
                                                            },
                                                            text: text_message,
                                                            sms_sent_for: "create_customer_order"
                                                        });

                                                    }
                                                    result_order = order;
                                                    if (req.body.referral_code) {
                                                        Subscriber.findOne({
                                                            referral_code: req.body.referral_code
                                                        })
                                                            .exec()
                                                            .then(refer => {
                                                                if (refer) {
                                                                    let cos = {
                                                                        order_id: order._id,
                                                                        cr_amount: 20,
                                                                        is_available: false,
                                                                        is_used: false
                                                                    };
                                                                    refer.cr_balance_status.push(cos);
                                                                    refer.save();
                                                                }
                                                            });
                                                    }

                                                    return Cart.remove({
                                                        _id: req.body.cart_id
                                                    },
                                                        (err, message) => {
                                                            if (err) res.send(err);
                                                            else {
                                                                res.send({
                                                                    status: 200,
                                                                    data: result_order,
                                                                    message: "Order submitted succesfully"
                                                                });
                                                            }

                                                        }
                                                    );
                                                })
                                                .catch(err => {
                                                    //console.log(err);
                                                    res.json({
                                                        status: 4041,
                                                        message: "Internal error, Please try after sometime"
                                                    });
                                                });
                                        } else {
                                            //console.log("Order status not found");
                                            res.json({
                                                status: 405,
                                                message: "Internal error, Please try after sometime"
                                            });
                                        }
                                    });
                            } else {
                                res.json({
                                    status: 404,
                                    message: "You can not order more then 10 on a single day"
                                });
                            }
                        })
                        .catch(err => {
                            res.json({
                                status: 404,
                                message: "You can not order more then 10 on a single day"
                            });
                        });
                }
            });
        })

        .put((req, res) => {//for bKash Update

            let token = req.cookies.token || req.headers["token"];
            let order_no = req.cookies.order_no || req.headers["order_no"];
            let paymentMessage = '';

            let order_data = {};
            let result_order = {};
            jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: "Please login first"
                    });
                } else {
                    Order.findOne({
                        order_no: order_no
                    },
                        (err, order) => {
                            if (err) {
                                res.send(err);
                            } else {
                                //---------

                                if (req.body.bkash_payment_id != 'failedBkash') {
                                    let totalPaid = parseInt(order.payment_collection.total_paid);
                                    let transactonCost = (1.5 * (req.body.payment_collection.total_paid / 100));

                                    if (req.body.payment_collection) {
                                        let collectionInfo = order.payment_collection.collection_info;
                                        let new_info = {
                                            collected_amount: req.body.payment_collection.collection_info[0].collected_amount,
                                            transaction_cost: transactonCost,
                                            collected_at: new Date(),
                                            gateway_ref: "5ae54e80d055af76056b5aa9"
                                        };

                                        collectionInfo.push(new_info);

                                        if (req.body.payment_collection.is_full_collected) {
                                            order.is_paid = req.body.is_paid;
                                        }

                                        totalPaid = parseInt(order.payment_collection.total_paid) + parseInt(req.body.payment_collection.total_paid);

                                        order.bkash_invoice_no = req.body.bkash_invoice_no;
                                        order.bkash_payment_id = req.body.bkash_payment_id;
                                        order.payment_information = req.body.payment_information;
                                        order.payment_collection = req.body.payment_collection;
                                        order.payment_collection.total_paid = totalPaid;
                                        order.payment_collection.collection_info = collectionInfo;

                                        if (order.total_price >= amountOverFreeDelivery) {
                                            order.delivery_charge = freDeliveryOnlinePaymentActive ? 0 : 40;
                                            order.payable_amount =
                                                parseInt(order.total_price, 10) -
                                                parseInt(order.discount, 10) +
                                                parseInt(order.wrapping_charge, 10) +
                                                parseInt(order.delivery_charge, 10)
                                        }
                                    }

                                    //------------
                                    order.save()
                                        .then(order => {

                                            if (order) {
                                                let text_message = "Dear ";
                                                text_message = text_message.concat(
                                                    order.delivery_address.contact_name,
                                                    ", "
                                                );
                                                text_message = text_message.concat(
                                                    "Your order is placed successfully. Order ID#",
                                                    " "
                                                );
                                                text_message = text_message.concat(order.order_no, ". ");
                                                if (req.body.is_paid) {

                                                    paymentMessage = "Payment succesful";
                                                    text_message = text_message.concat(
                                                        "(Payment Tk " +
                                                        order.payable_amount +
                                                        "receieved).",
                                                        " "
                                                    );
                                                    let reqData = {
                                                        order_no: order.order_no,
                                                        req_url: "bKash",
                                                        req_payload: "bKash",
                                                        payable_amount: order.payable_amount,
                                                        request_at: new Date()
                                                    };
                                                    let resData = {
                                                        order_no: order.order_no,
                                                        response: "bKash",
                                                        response_at: new Date()
                                                    };
                                                    createPaymentrequestLog(reqData);
                                                    createPaymentResponseLog(resData);
                                                } else {
                                                    text_message = text_message.concat(
                                                        "Payment Tk " +
                                                        order.payable_amount +
                                                        "failed unfortunately.",
                                                        " "
                                                    );

                                                    let reqData = {
                                                        order_no: order.order_no,
                                                        req_url: "bKash",
                                                        req_payload: "bKash",
                                                        payable_amount: order.payable_amount,
                                                        request_at: new Date()
                                                    };
                                                    createPaymentrequestLog(reqData);
                                                    paymentMessage = "Payment failed"
                                                }

                                                text_message = text_message.concat(
                                                    "We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                                    " "
                                                );

                                                sendMessage({
                                                    phone_numbers: [order.delivery_address.phone_number],
                                                    sms_for_order: {
                                                        order_id: order._id,
                                                        order_status: "Pending"
                                                    },
                                                    text: text_message,
                                                    sms_sent_for: "create_customer_order"
                                                });

                                                res.send({
                                                    status: 200,
                                                    data: order,
                                                    message: paymentMessage
                                                });
                                            } else {
                                                res.send({
                                                    status: 500,
                                                    message: "Payment failed"
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            res.send({
                                                status: 500,
                                                message: "Payment failed"
                                            });
                                        });

                                } else {
                                    res.send({
                                        status: 500,
                                        message: "Payment failed"
                                    });
                                }


                            }

                        }
                    );
                }
            });
        });

    function checkTotalOrderToday(subscriber_id, is_paid) {
        return new Promise((resolve, reject) => {
            if (!is_paid) {
                var lte_date = new Date();
                lte_date.setHours(0, 0, 0, 0);
                var gte_date = new Date();
                gte_date.setHours(23, 59, 59, 999);

                let date_filter = {
                    $lte: new Date(gte_date),
                    $gt: new Date(lte_date)
                };

                Order.count({
                    created_by: subscriber_id,
                    order_at: date_filter
                })
                    .exec()
                    .then(total_order => {
                        if (total_order > 10) {
                            resolve({
                                status: false
                            });
                        } else {
                            resolve({
                                status: true
                            });
                        }
                    })
                    .catch(err => {
                        ////console.log(err);
                        reject({
                            status: false
                        });
                    });
            } else {
                resolve({
                    status: true
                });
            }
        });
    }

    //for bKash Update
    router.route("/order-change/:id").put((req, res) => {
        //console.log(req.params.id)
        //console.log(req.body.bkash_invoice_no)

        Order.findOne({
            _id: req.params.id
        })
            .exec()
            .then(order => {
                // if (req.body.payment_info) {
                //   order.is_paid = req.body.is_paid;
                //   order.payment_information = req.body.payment_info;
                //   order.payment_collection = req.body.payment_collection;

                //   // order.is_paid = req.body.payment_collection?req.body.payment_collection.is_full_collected:false; //
                // }
                // order.bkash_invoice_no = req.body.bkash_invoice_no;
                // order.bkash_payment_id = req.body.bkash_payment_id;

                console.log('req.body')
                console.log(req.body)

                let totalPaid = parseInt(order.payment_collection.total_paid);
                if (req.body.payment_collection) {
                    let collectionInfo = order.payment_collection.collection_info;
                    let transactonCost = (1.5 * (req.body.payment_collection.total_paid / 100));
                    let new_info = {
                        collected_amount: req.body.payment_collection.total_paid,
                        transaction_cost: transactonCost,
                        collected_at: new Date(),
                        gateway_ref: "5ae54e80d055af76056b5aa9"
                    };
                    collectionInfo.push(new_info);

                    if (req.body.payment_collection.is_full_collected) {
                        order.is_paid = req.body.is_paid;
                    }

                    totalPaid = parseInt(order.payment_collection.total_paid) + parseInt(req.body.payment_collection.total_paid);

                    order.bkash_invoice_no = req.body.bkash_invoice_no;
                    order.bkash_payment_id = req.body.bkash_payment_id;
                    order.payment_information = req.body.payment_information;
                    order.payment_collection = req.body.payment_collection;
                    order.payment_collection.total_paid = totalPaid;
                    order.payment_collection.transaction_cost = transactonCost;
                    order.payment_collection.collection_info = collectionInfo;


                    if (order.total_price >= amountOverFreeDelivery) {
                        order.delivery_charge = freDeliveryOnlinePaymentActive ? 0 : 40;
                        order.payable_amount =
                            parseInt(order.total_price) -
                            parseInt(order.discount) +
                            parseInt(order.wrapping_charge) +
                            parseInt(order.delivery_charge)
                    }
                }


                order.save(err => {
                    if (!err) {
                        //Send Msg-----------------

                        if (req.body.is_paid) {
                            let text_message = "Dear ";

                            if (order.delivery_address.sender_name) {
                                text_message = text_message.concat(
                                    order.delivery_address.sender_name,
                                    ", "
                                );
                            } else {
                                text_message = text_message.concat(
                                    order.delivery_address.contact_name,
                                    ", "
                                );
                            }

                            text_message = text_message.concat(
                                "(Payment Tk " +
                                order.payable_amount +
                                " receieved).",
                                " "
                            );
                            text_message = text_message.concat(
                                " We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                " "
                            );
                            let reqData = {
                                order_no: order.order_no,
                                req_url: "bKash",
                                req_payload: "bKash",
                                payable_amount: order.payable_amount,
                                request_at: new Date()
                            };
                            let resData = {
                                order_no: order.order_no,
                                response: "bKash",
                                response_at: new Date()
                            };
                            createPaymentrequestLog(reqData);
                            createPaymentResponseLog(resData);

                            if (order.delivery_address.sender_mobile) {

                                sendMessage({
                                    phone_numbers: [order.delivery_address.sender_mobile],
                                    sms_for_order: {
                                        order_id: order._id,
                                        order_status: "Pending"
                                    },
                                    text: text_message,
                                    sms_sent_for: "create_customer_order"
                                });
                            } else {

                                sendMessage({
                                    phone_numbers: [order.delivery_address.phone_number],
                                    sms_for_order: {
                                        order_id: order._id,
                                        order_status: "Pending"
                                    },
                                    text: text_message,
                                    sms_sent_for: "create_customer_order"
                                });
                            }

                        }

                        //Send Msg End-----------------

                        res.json({
                            success: true,
                            data: order
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                });
            });
    });

    router.route("/guest-order")
        .post((req, res) => {
            ////console.log("I am GUEST ORDER API")

            let cartId;
            // //console.log(req.headers['cart_id']);

            let carrierId = {};
            let order_data = {};
            let result_order = {};
            if (!req.cookies.cart_id && !req.headers["cart_id"]) {
                res.json({
                    status: 404,
                    message: "Please add item in your cart first"
                });
                return false;
            } else {
                if (req.headers["cart_id"]) {
                    cartId = req.headers["cart_id"];
                } else {
                    cartId = req.cookies.cart_id;
                }
                Cart.findOne({
                    cart_id: parseInt(cartId)
                })
                    .exec()
                    .then(cart => {
                        if (cart) {
                            order_data.order_items = cart.products;
                            order_data.delivery_address = req.body.delivery_address;
                            if (req.body.delivery_address.carrier_id) {
                                carrierId = req.body.delivery_address.carrier_id;
                            }

                            return OrderStatus.findOne()
                                .where("name")
                                .equals("Pending")
                                .exec();
                        } else {
                            res.json({
                                status: 404,
                                message: "You have no item in your cart"
                            });
                        }
                    })
                    .then(status => {
                        if (status) {
                            let status_object = {
                                status_id: status._id,
                                status_name: status.name,
                                updated_at: new Date()
                            };

                            getNextSequence("order_id")
                                .then(seq => {
                                    return Order.create({
                                        order_no: seq,
                                        order_string_date: getDateString(new Date()),
                                        products: order_data.order_items,
                                        delivery_charge: req.body.delivery_charge,
                                        wrapping_charge: req.body.wrapping_charge,
                                        total_price: req.body.total_price,
                                        total_book: req.body.total_book,
                                        payable_amount: req.body.payable_amount,
                                        discount: req.body.discount,
                                        promo_id: req.body.promo_id,
                                        referral_code: req.body.referral_code,
                                        current_order_status: status_object,
                                        performed_order_statuses: [status_object],
                                        delivery_address: order_data.delivery_address,
                                        created_from: "web-" + req.device.type,
                                        bkash_invoice_no: req.body.bkash_invoice_no,
                                        bkash_payment_id: req.body.bkash_payment_id,
                                        is_guest_order: true,
                                        payment_information: req.body.payment_information,
                                        payment_collection: req.body.payment_collection,
                                        is_paid: req.body.is_paid,
                                        carrier: carrierId
                                    });
                                })
                                .then(order => {
                                    let text_message = "Dear ";

                                    if (order.delivery_address.sender_name) {
                                        text_message = text_message.concat(
                                            order.delivery_address.sender_name,
                                            ", "
                                        );
                                    } else {
                                        text_message = text_message.concat(
                                            order.delivery_address.contact_name,
                                            ", "
                                        );
                                    }

                                    text_message = text_message.concat(
                                        "Your order is placed successfully. Order ID#",
                                        " "
                                    );
                                    text_message = text_message.concat(order.order_no, ". ");
                                    if (req.body.is_paid) {
                                        text_message = text_message.concat(
                                            "(Payment Tk " +
                                            order.payable_amount +
                                            " receieved).",
                                            " "
                                        );
                                        let reqData = {
                                            order_no: order.order_no,
                                            req_url: "bKash",
                                            req_payload: "bKash",
                                            payable_amount: order.payable_amount,
                                            request_at: new Date()
                                        };
                                        let resData = {
                                            order_no: order.order_no,
                                            response: "bKash",
                                            response_at: new Date()
                                        };
                                        createPaymentrequestLog(reqData);
                                        createPaymentResponseLog(resData);
                                    }
                                    if (!req.body.bkash_invoice_no) {
                                        text_message = text_message.concat(
                                            "We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                            " "
                                        );
                                    }

                                    if (order.delivery_address.sender_mobile) {
                                        sendMessage({
                                            phone_numbers: [order.delivery_address.sender_mobile],
                                            sms_for_order: {
                                                order_id: order._id,
                                                order_status: "Pending"
                                            },
                                            text: text_message,
                                            sms_sent_for: "create_customer_order"
                                        });
                                    } else {
                                        sendMessage({
                                            phone_numbers: [order.delivery_address.phone_number],
                                            sms_for_order: {
                                                order_id: order._id,
                                                order_status: "Pending"
                                            },
                                            text: text_message,
                                            sms_sent_for: "create_customer_order"
                                        });
                                    }


                                    result_order = order;
                                    return Cart.remove({
                                        cart_id: cartId
                                    },
                                        (err, message) => {
                                            if (err) res.send(err);
                                            else {
                                                res.send({
                                                    status: 200,
                                                    data: result_order,
                                                    message: "Order submitted succesfully"
                                                });
                                            }
                                        }
                                    );
                                })
                                .catch(err => {
                                    ////console.log(err);
                                });
                        } else {
                            res.json({
                                status: 406,
                                message: "Internal error, Please try after sometime"
                            });
                        }
                    });
            }
        })

        .put((req, res) => {
            let order_no = req.cookies.order_no || req.headers["order_no"];

            Order.findOne({
                order_no: order_no
            },
                (err, order) => {
                    if (err) res.send(err);


                    let totalPaid = parseInt(order.payment_collection.total_paid);
                    if (req.body.payment_collection) {
                        let collectionInfo = order.payment_collection.collection_info;
                        let new_info = {
                            collected_amount: req.body.currency_amount,
                            collected_at: new Date(),
                            gateway_ref: "5ae54e80d055af76056b5aa9"
                        };
                        collectionInfo.push(new_info);

                        if (req.body.payment_collection.is_full_collected) {
                            order.is_paid = req.body.is_paid;
                        }

                        totalPaid = parseInt(order.payment_collection.total_paid) + parseInt(req.body.payment_collection.total_paid);

                        order.bkash_invoice_no = req.body.bkash_invoice_no;
                        order.bkash_payment_id = req.body.bkash_payment_id;
                        order.payment_information = req.body.payment_information;
                        order.payment_collection = req.body.payment_collection;
                        order.payment_collection.total_paid = totalPaid;
                        order.payment_collection.collection_info = collectionInfo;

                        if (order.total_price >= amountOverFreeDelivery) {
                            order.delivery_charge = freDeliveryOnlinePaymentActive ? 0 : 40;
                            order.payable_amount =
                                parseInt(order.total_price, 10) -
                                parseInt(order.discount, 10) +
                                parseInt(order.wrapping_charge, 10) +
                                parseInt(order.delivery_charge, 10)
                        }
                    }



                    order.save().then(order => {
                        if (order) {
                            let text_message = "Dear ";

                            if (order.delivery_address.sender_name) {
                                text_message = text_message.concat(
                                    order.delivery_address.sender_name,
                                    ", "
                                );
                            } else {
                                text_message = text_message.concat(
                                    order.delivery_address.contact_name,
                                    ", "
                                );
                            }


                            text_message = text_message.concat(
                                "Your order is placed successfully. Order ID#",
                                " "
                            );
                            text_message = text_message.concat(order.order_no, ". ");
                            if (req.body.is_paid) {
                                text_message = text_message.concat(
                                    "(Payment Tk " +
                                    order.payable_amount +
                                    " receieved).",
                                    " "
                                );
                                let reqData = {
                                    order_no: order.order_no,
                                    req_url: "bKash",
                                    req_payload: "bKash",
                                    payable_amount: order.payable_amount,
                                    request_at: new Date()
                                };
                                let resData = {
                                    order_no: order.order_no,
                                    response: "bKash",
                                    response_at: new Date()
                                };
                                createPaymentrequestLog(reqData);
                                createPaymentResponseLog(resData);
                            }

                            text_message = text_message.concat(
                                "We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                " "
                            );

                            if (order.delivery_address.sender_mobile) {
                                sendMessage({
                                    phone_numbers: [order.delivery_address.sender_mobile],
                                    sms_for_order: {
                                        order_id: order._id,
                                        order_status: "Pending"
                                    },
                                    text: text_message,
                                    sms_sent_for: "create_customer_order"
                                });
                            } else {
                                sendMessage({
                                    phone_numbers: [order.delivery_address.phone_number],
                                    sms_for_order: {
                                        order_id: order._id,
                                        order_status: "Pending"
                                    },
                                    text: text_message,
                                    sms_sent_for: "create_customer_order"
                                });
                            }


                            res.send({
                                status: 200,
                                data: order,
                                message: "Payment succesful"
                            });
                        }
                        res.send({
                            status: 500,
                            message: "Payment failed"
                        });
                    });
                }
            );
        });

    router.route("/pre-order").post((req, res) => {
        let token = req.headers["token"];
        let sub_id = req.headers["sub_id"];

        OrderStatus.findOne()
            .where("name")
            .equals("PreOrder")
            .exec()
            .then(status => {
                let status_object = {
                    status_id: status._id,
                    status_name: status.name,
                    updated_at: new Date()
                };
                getNextSequence("order_id").then(seq => {
                    if (token) {
                        Order.create({
                            order_no: seq,
                            order_string_date: getDateString(new Date()),
                            products: req.body.book,
                            delivery_charge: req.body.delivery_charge,
                            wrapping_charge: req.body.wrapping_charge,
                            total_price: req.body.total_price,
                            total_book: req.body.total_book,
                            payable_amount: req.body.payable_amount,
                            discount: req.body.discount,
                            promo_id: req.body.promo_id,
                            referral_code: req.body.referral_code,
                            current_order_status: status_object,
                            performed_order_statuses: [status_object],
                            delivery_address: req.body.delivery_address,
                            created_from: "web-" + req.device.type,
                            created_by: sub_id,
                            is_guest_order: false
                        },
                            (err, order) => {
                                if (err) {
                                    res.json({
                                        success: false
                                    });
                                } else {
                                    let text_message = "Dear ";
                                    text_message = text_message.concat(
                                        order.delivery_address.contact_name,
                                        ", "
                                    );
                                    text_message = text_message.concat(
                                        "Your Pre-order has been receieved successfully. Order ID#",
                                        " "
                                    );
                                    text_message = text_message.concat(order.order_no, ". ");
                                    text_message = text_message.concat(
                                        "We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                        " "
                                    );
                                    sendMessage({
                                        phone_numbers: [order.delivery_address.phone_number],
                                        sms_for_order: {
                                            order_id: order._id,
                                            order_status: "Pending"
                                        },
                                        text: text_message,
                                        sms_sent_for: "pre_order"
                                    });

                                    res.json({
                                        success: true,
                                        order_no: order.order_no
                                    });
                                }
                            }
                        );
                    } else {
                        Order.create({
                            order_no: seq,
                            order_string_date: getDateString(new Date()),
                            products: req.body.book,
                            delivery_charge: req.body.delivery_charge,
                            wrapping_charge: req.body.wrapping_charge,
                            total_price: req.body.total_price,
                            total_book: req.body.total_book,
                            payable_amount: req.body.payable_amount,
                            discount: req.body.discount,
                            promo_id: req.body.promo_id,
                            referral_code: req.body.referral_code,
                            current_order_status: status_object,
                            performed_order_statuses: [status_object],
                            delivery_address: req.body.delivery_address,
                            created_from: "web-" + req.device.type,
                            is_guest_order: true
                        },
                            (err, order) => {
                                if (err) {
                                    res.json({
                                        success: false
                                    });
                                } else {
                                    //console.log('query')
                                    //console.log(order)
                                    let text_message = "Dear ";
                                    text_message = text_message.concat(
                                        order.delivery_address.contact_name,
                                        ", "
                                    );
                                    text_message = text_message.concat(
                                        "Your Pre-order has been receieved successfully. Order ID#",
                                        " "
                                    );
                                    text_message = text_message.concat(order.order_no, ". ");
                                    text_message = text_message.concat(
                                        "We will call you soon. Track your order: https://bit.ly/2ZCR7jE",
                                        " "
                                    );
                                    sendMessage({
                                        phone_numbers: [order.delivery_address.phone_number],
                                        sms_for_order: {
                                            order_id: order._id,
                                            order_status: "Pending"
                                        },
                                        text: text_message,
                                        sms_sent_for: "pre_order"
                                    });

                                    res.json({
                                        success: true,
                                        order_no: order.order_no
                                    });
                                }
                            }
                        );
                    }
                });
            });
    });
};