import Order from '../../models/order.model';
import Product from '../../models/product.model';
import Subscriber from '../../models/subscriber.model';
import ShippingAddress from '../../models/shipping-address.model';
import StockSummary from '../../models/inventory-models/stock-summary.model';
import Stock from '../../models/inventory-models/stock.model'
import {
    getNextSequence,
    getDateString
} from '../public/api.service.js';
import OrderStatus from '../../models/order-status.model';
import {
    stockEntry,
    updateStockSummary
} from './inventory/inventory.service';
import {
    getDateOfThirtyDayAgo,
    getDatesOfRange
} from './admin-api.service';

import {
    updateEcourier,
    updateOrderBookAvailibilityStatus,
    updateOrderBookAvailibilityStatusSync,
    updateReferralWallet,
    updateSalamiWallet,
    getOrderAgingInfo,
    sendEmail,
    sendSms,
    saveOrderLog
} from './order.service';

import {
    sendMessage,
} from './text-message.service';

import mongoose from 'mongoose';




// let text_message = "Dear ";
// text_message = text_message.concat(order.delivery_address.contact_name, ". ");
// text_message = text_message.concat("Your order has been receieved successfully. Your Order ID is", " ");
// text_message = text_message.concat(order.order_no, ". ");
// text_message = text_message.concat("One of our customer representative will call you soon. Thank You", " ");
// sendMessage({ phone_numbers: [order.delivery_address.phone_number], sms_for_order:{order_id: order._id, order_status: 'Pending'}, text: text_message, sms_sent_for:"create_customer_order" })


export default (app, router, auth) => {
    router.route('/order')
        .post(auth, (req, res) => {
            OrderStatus.findOne()
                .where('name').equals('Pending')
                .exec()
                .then(status => {
                    let status_object = {
                        status_id: status._id,
                        status_name: status.name,
                        updated_at: new Date()
                    }

                    getNextSequence('order_id')
                        .then(seq => {
                            return Order.create({
                                order_no: seq,
                                order_string_date: getDateString(new Date()),
                                products: req.body.products,
                                delivery_charge: req.body.delivery_charge,
                                paument_method: 'Cash on Delivery',
                                total_book: req.body.total_book,
                                payable_amount: req.body.payable_amount,
                                total_price: req.body.total_price,
                                discount: req.body.discount,
                                current_order_status: status_object,
                                wrapping_charge: req.body.wrapping_charge,
                                performed_order_statuses: [status_object],
                                delivery_address: req.body.delivery_address,
                                created_from: req.body.created_from,
                                created_by: req.user._id
                            })
                        })
                        .then(order => {

                            if (req.body.send_sms) {

                                let detectContactName = "Sir/Madam";
                                if (order.delivery_address.contact_name.charCodeAt(0) < 2000) {
                                    var tempName = order.delivery_address.contact_name;
                                    var temp = tempName.split(" ");
                                    detectContactName = temp[temp.length - 1];
                                }

                                let text_message = `Dear ${detectContactName}, Your order is placed successfully. Order ID# ${order.order_no}. We will call you soon. Track your order: https://bit.ly/2ZCR7jE`;

                                sendMessage({
                                    phone_numbers: [order.delivery_address.phone_number],
                                    sms_for_order: {
                                        order_id: order._id,
                                        order_status: 'Pending'
                                    },
                                    text: text_message,
                                    sms_sent_for: "create_customer_order"
                                })
                            }
                            if (req.body.delivery_address && req.body.delivery_address.new_customer) {
                                createSubscriber(req.body.delivery_address);
                            }
                            res.send({
                                success: true,
                                "message": "Order submitted succesfully",
                                _id: order.order_id
                            })
                        })
                        .catch(err => {
                            res.send({
                                success: false,
                                "message": "Order submitt failed"
                            })
                        })
                })
        })

    router.route('/order/get-order-age/by-status/:status_name')
        .get((req, res) => {
            let curDate = new Date();
            let condition = {};
            if (req.params.status_name == 'OutStock') {
                condition = {
                    'current_order_status.status_name': "PreOrder",
                    'products.is_out_of_stock': true,
                    'is_partially_processed': false
                }
            } else if (req.params.status_name == 'OutPrint') {
                condition = {
                    'current_order_status.status_name': "PreOrder",
                    'products.is_out_of_print': true,
                    'is_partially_processed': false
                }
            } else {
                condition = {
                    'current_order_status.status_name': req.params.status_name
                }
            }
            Order.aggregate([{
                $match: condition
            },
            {
                $project: {
                    consumed: {
                        $trunc: {
                            $divide: [{
                                $subtract: [curDate, "$order_at"]
                            },
                                86400000
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    age: {
                        $switch: {
                            branches: [{
                                case: { $lte: ["$consumed", 1] },
                                then: "one"
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 2] },
                                        { $gt: ["$consumed", 1] }
                                    ]
                                },
                                then: "two"
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 3] },
                                        { $gt: ["$consumed", 2] }
                                    ]
                                },
                                then: "three"
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 4] },
                                        { $gt: ["$consumed", 3] }
                                    ]
                                },
                                then: "four"
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 23] },
                                        { $gt: ["$consumed", 4] }
                                    ]
                                },
                                then: "five"
                            }
                            ],
                            default: "default"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$age',
                    count: { $sum: 1 }
                }
            }
            ])
                .exec()
                .then(data => {
                    res.json(data);
                })
                .catch(err => {
                    res.json(err);
                })

        })


    function createSubscriber(data) {
        let newSubscriber = new Subscriber();
        newSubscriber.first_name = data.contact_name;
        newSubscriber.username = data.phone_number;
        newSubscriber.is_verified = true;
        newSubscriber.created_by_admin = true;
        newSubscriber.email = '';
        newSubscriber.phone_number = data.phone_number;
        newSubscriber.referral_code = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
        newSubscriber.provider = 'local_admin';
        newSubscriber.password = newSubscriber.generateHash("123qwe");
        newSubscriber.address = data.address;
        newSubscriber.save((err) => {
            if (!err) {
                //console.log("New customer Created!");
                ShippingAddress.create({
                    contact_name: data.contact_name,
                    district: data.district,
                    thana: data.thana,
                    address: data.address,
                    phone_number: data.phone_number,
                    alter_phone: data.alter_phone,
                    created_by: newSubscriber._id
                })
                    .then(address => {
                        //  console.log("New Address created!");
                    })
            }
        })
    }

    router.route('/order/order_by_phone/:phone_number')
        .get((req, res) => {
            Order.find({
                'delivery_address.phone_number': req.params.phone_number
            })
                .sort({
                    order_no: -1
                })
                .exec()
                .then(orders => {
                    res.json(orders);
                })
                .catch(err => {
                    res.json([])
                })
        })

    router.route('/order/confirmed-order/book-list')
        .get(auth, (req, res) => {
            Order.aggregate([{
                $match: { 'current_order_status.status_name': 'Confirmed' }
            }, {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: '$products.publisher',
                    orders: {
                        $push: "$order_no"
                    },
                    books: {
                        $push: {
                            name: "$products.name",
                            price: "$products.price",
                            quantity: "$products.quantity",
                        }
                    }
                }
            }, {
                $lookup: {
                    from: "publishers",
                    localField: '_id',
                    foreignField: '_id',
                    as: 'publisher'
                }
            }, {
                $unwind: '$publisher'
            }, {
                $project: {
                    publisher: "$publisher.name",
                    orders: "$orders",
                    books: "$books"
                }
            }, {
                $sort: {
                    'publisher': 1
                }
            }
            ])
                .exec()
                .then(orders => {
                    res.json(orders);
                })
                .catch(err => {
                    res.json(err);
                })
        })


    router.route('/order/confirmed/with-purchase')
        .get(auth, (req, res) => {
            Order.find({
                'current_order_status.status_name': 'Confirmed',
                'is_partially_processed': false,
                'is_purchase_order_created': req.query.is_purchase_order_created
            })
                .populate({
                    path: 'carrier'
                })
                .populate({
                    path: 'created_by'
                })
                .populate({
                    path: 'products.product_id',
                    select: 'seo_url current_offer'
                })
                .populate({
                    path: 'customer_contact_info.other_contact_history.contact_by',
                    select: 'first_name last_name'
                })
                .sort({
                    order_at: -1
                })
                .exec()
                .then(result => {
                    res.json({ success: true, data: result })
                })
                .catch(err => {
                    res.json({ success: false, data: [], err: err });
                })
        })

    router.route('/order/:status')
        .get(auth, (req, res) => {
            let itemsPerPage = req.query.itemsPerPage || 10;
            let pageNum = req.query.page_no || 1;
            let req_output = new Object();
            if (req.params.status == 'All') {
                Order.count()
                    .exec()
                    .then(count => {
                        req_output.count = count;
                        return Order.find()
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order;
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })
            } else if (req.params.status == 'BackOrder') {
                Order.count({
                    is_partially_processed: true,
                    is_sibling: false,
                    is_partial_process_completd: false
                })
                    .exec()
                    .then(count => {
                        req_output.count = count;
                        return Order.find({
                            is_partially_processed: true,
                            is_sibling: false,
                            is_partial_process_completd: false
                        })
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order;
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })
            } else if (req.params.status == 'IndianBooks' || req.params.status == 'Emergency') {
                let cond = {};

                if (req.params.status == 'IndianBooks') {
                    cond = {
                        'indian_book_available': true,
                        'current_order_status.status_name': { $ne: "Cancelled" }
                    }
                } else {
                    cond = {
                        'is_emergency': true,
                        'current_order_status.status_name': { $ne: "Cancelled" }
                    }
                }

                Order.count(cond)
                    .exec()
                    .then(count => {
                        req_output.count = count;
                        return Order.find(cond)
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })


            } else if (req.params.status == 'PreOrder' || req.params.status == 'OutStock' || req.params.status == 'OutPrint') {

                let cond = {};
                if (req.params.status == 'OutStock') {
                    cond = {
                        'current_order_status.status_name': "PreOrder",
                        'products.is_out_of_stock': true,
                        'is_partially_processed': false
                    }
                } else if (req.params.status == 'OutPrint') {
                    cond = {
                        'current_order_status.status_name': "PreOrder",
                        'products.is_out_of_print': true,
                        'is_partially_processed': false
                    }
                } else {
                    cond = {
                        'current_order_status.status_name': "PreOrder",
                        'products.is_out_of_stock': false,
                        'products.is_out_of_print': false,
                        'is_partially_processed': false
                    }
                }

                Order.count(cond)
                    .exec()
                    .then(count => {
                        req_output.count = count;
                        return Order.find(cond)
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })
            } else {
                let cond = {
                    'current_order_status.status_name': req.params.status,
                    'is_partially_processed': false
                }
                Order.count(cond)
                    .exec()
                    .then(count => {
                        req_output.count = count;
                        return Order.find(cond)
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })
            }

        })

    router.route('/order/getorder-by-orderno/:order_no')
        .get((req, res) => {
            Order.findOne({
                order_no: req.params.order_no
            })
                .exec((err, order) => {
                    if (err)
                        res.json({
                            found: false
                        });
                    else {
                        if (order && order._id) {
                            if (order.payment_collection && (order.payable_amount == order.payment_collection.total_paid)) {
                                res.json({
                                    found: true,
                                    message: "Already paid!"
                                });
                            } else {
                                res.json({
                                    found: true,
                                    order: order
                                });
                            }
                        } else {
                            res.json({
                                found: false,
                                message: "Invalid Order Number!"
                            });
                        }
                    }

                })
        })

    router.route('/order/mis/get-order-books/:order_id')
        .get((req, res) => {

            let result = new Object();
            //let cond = req.params.order_id;

            Order.aggregate([{
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.order_id)
                }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "stocksummaries",
                    localField: "products.product_id",
                    foreignField: "product_id",
                    as: "products.stocks"
                }
            },
            {
                $group: {
                    _id: {
                        order_no: "$order_no",
                        order_at: "$order_at"
                    },
                    products: {
                        $push: {
                            product_id: "$products.product_id",
                            name: "$products.name",
                            author: "$products.author",
                            publisher: "$products.publisher",
                            required_qty: "$products.quantity",
                            sales_price: "$products.price",
                            is_out_of_stock: '$products.is_out_of_stock',
                            arrives_in_stock: "$products.arrives_in_stock",
                            is_out_of_print: "$products.is_out_of_print",
                            is_info_delay: "$products.is_info_delay",
                            info_delayed: "$products.info_delayed",
                            stock_qty: {
                                $arrayElemAt: [{
                                    $map: {
                                        input: "$products.stocks",
                                        as: "stock",
                                        in: {
                                            $subtract: [{ $sum: ['$$stock.opening_stock', '$$stock.total_purchase', '$$stock.total_cancel', '$$stock.total_return'] }, { $ifNull: ["$$stock.total_sales", 0] }]
                                        }
                                    }
                                }, 0]
                            }
                        }
                    }
                }
            }
            ])
                // .skip((pageNo - 1) * 10)
                //  .limit(50)
                .exec()
                .then(orders => {
                    console.log(orders)
                    result.data = orders
                    //   return Order.count({ 'current_order_status.status_name': 'Confirmed' })
                    // })
                    // .then(count => {
                    //   result.count = count;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    console.log(err)

                    res.send({ success: false, err: err });
                })

            // res.json({
            //     order_id: req.params.order_id,
            //     suck: 'shotti'
            // })

        })

    router.route('/order/mis/get-aging-data')
        .get((req, res) => {
            let result = new Object();
            let mail_result = new Object();
            let sms_result = new Object();

            getOrderAgingInfo('Pending')
                .then(Pending => {
                    result['Pending'] = Pending;
                    mail_result['Pending'] = getMailRes(Pending);
                    sms_result['Pending'] = getSMSRes(Pending);
                    return getOrderAgingInfo('Confirmed')
                })
                .then(Confirmed => {
                    result['Confirmed'] = Confirmed;
                    mail_result['Confirmed'] = getMailRes(Confirmed);
                    sms_result['Confirmed'] = getSMSRes(Confirmed);
                    return getOrderAgingInfo('Dispatch')
                })
                .then(Dispatch => {
                    result['Dispatch'] = Dispatch;
                    mail_result['Dispatch'] = getMailRes(Dispatch);
                    sms_result['Dispatch'] = getSMSRes(Dispatch);
                    return getOrderAgingInfo('pending_payment')
                })
                .then(pending_payment => {
                    result['pending_payment'] = pending_payment;
                    sms_result['pending_payment'] = getSMSRes(pending_payment);
                    mail_result['pending_payment'] = getMailRes(pending_payment);
                    if (!req.query.sendasmail) {
                        res.json({ success: true, data: result });
                    } else {
                        sendEmail(mail_result);
                        sendSms(sms_result, mail_result);
                        res.json(sms_result);
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

        .post(auth, (req, res) => {
            let pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 1;
            let orders_id = req.body.ids.map(id => { return mongoose.Types.ObjectId(id) });
            Order.find({ _id: { $in: orders_id } })
                .select({ order_at: 1, order_no: 1, total_book: 1, payable_amount: 1, delivery_address: 1 })
                .skip((pageNo - 1) * 10)
                .limit(10)
                .exec()
                .then(result => {
                    res.json({ success: true, data: result })
                })
                .catch(err => {
                    res.json({ success: false, err: err })
                })
        })

    function getMailRes(arr) {
        let obj = new Object();
        arr.map(a => {
            obj[a._id] = a.count;
        })
        return obj;
    }

    function getSMSRes(arr) {
        let total = 0;
        arr.map(a => {
            total += a.count;
        })
        return total;
    }

    router.route('/order/get-paid-order-by-orderno/:order_no')
        .get((req, res) => {
            Order.findOne({
                order_no: req.params.order_no
            })
                .exec((err, order) => {
                    if (err)
                        res.json({
                            found: false
                        });
                    else {
                        if (order && order._id) {
                            if (order.is_paid && order.bkash_payment_id && order.bkash_payment_id != 'failedBkash') {
                                res.json({
                                    found: true,
                                    order: order
                                });
                            } else {
                                res.json({
                                    found: true,
                                    message: "Order is not Paid By bKash!"
                                });
                            }
                        } else {
                            res.json({
                                found: false,
                                message: "Invalid Order Number!"
                            });
                        }
                    }

                })
        })


    router.route('/ready-for-dispatch/aging-data')
        .get((req, res) => {
            let result = new Object();
            getOrderAgingInfo('Confirmed')
                .then(Confirmed => {
                    result['Confirmed'] = Confirmed;
                    res.json({ success: true, data: result });
                })
                .catch(err => {
                    res.json({
                        success: false,
                        err: err
                    })
                })
        })

    router.route('/dispatch-waiting-order')
        .post((req, res) => {
            let pageNo = req.body.pageNo ? parseInt(req.body.pageNo) : 1;
            let result = new Object();

            let cond = {
                'current_order_status.status_name': 'Confirmed'
            }

            if (req.body.order_no) {
                cond['order_no'] = parseInt(req.body.order_no);
            }

            if (req.body.start_date && req.body.end_date) {
                let lte_date = new Date(req.body.start_date);
                lte_date.setHours(0, 0, 0, 0);
                let gte_date = new Date(req.body.end_date);
                gte_date.setHours(23, 59, 59, 999);
                cond['order_at'] = {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }

            if (req.body.order_ids) {
                cond = {};
                cond = {
                    '_id': { $in: req.body.order_ids }
                }
            }

            // console.log(req.body.order_ids)

            Order.find(cond)
                .exec()
                .then(orders => {
                    return getOrderAvailabilityStatus(orders)
                })
                .then(ords => {
                    if (req.body.order_ids) {
                        result.data = ords;
                    } else {
                        let from = (pageNo - 1) * 10;
                        let to = from + 10;
                        let sorted = ords.sort(function (a, b) {
                            return a.stock_availibility - b.stock_availibility;
                        });
                        result.data = sorted.slice(from, to);
                    }

                    return Order.count(cond)
                })
                .then(count => {
                    result.count = count;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

    function getOrderAvailabilityStatus(orders) {
        let ordrs = orders.map(order => {
            return new Promise((resolve, reject) => {
                setStatus(order.products)
                    .then(status => {
                        let ord_products = order.products.map(pr => {
                            let new_pr = new Object();
                            new_pr.product_id = pr.product_id;
                            new_pr.processed = pr.processed;
                            new_pr.stock_qty = pr.stock_qty;
                            new_pr.allocated_qty = pr.allocated_qty;
                            new_pr.price = pr.price;
                            new_pr.name = pr.name;
                            new_pr.image = pr.image;
                            new_pr.send = pr.send;
                            new_pr.author = pr.author;
                            new_pr.publisher = pr.publisher;
                            new_pr.purchase_order_created = pr.purchase_order_created;
                            new_pr.is_out_of_stock = pr.is_out_of_stock;
                            new_pr.arrives_in_stock = pr.arrives_in_stock;
                            new_pr.is_out_of_print = pr.is_out_of_print;
                            new_pr.is_info_delay = pr.is_info_delay;
                            new_pr.info_delayed = pr.info_delayed;
                            new_pr.act_quantity = pr.quantity;
                            new_pr.quantity = pr.quantity - (pr.processed ? pr.processed : 0);
                            return new_pr;
                        })
                        resolve({
                            _id: order._id,
                            payment_collection: order.payment_collection,
                            customer_contact_info: order.customer_contact_info,
                            current_order_status: order.current_order_status,
                            is_paid: order.is_paid,
                            total_price: order.total_price,
                            discount: order.discount,
                            delivery_charge: order.delivery_charge,
                            wrapping_charge: order.wrapping_charge,
                            wallet_amount: order.wallet_amount,
                            payable_amount: order.payable_amount,
                            total_book: order.total_book,
                            order_no: order.order_no,
                            order_string_date: order.order_string_date,
                            act_product: ord_products,
                            products: ord_products.filter(product => {
                                return product.quantity > 0
                            }),
                            performed_order_statuses: order.performed_order_statuses,
                            delivery_address: order.delivery_address,
                            created_from: order.created_from,
                            order_at: order.order_at,
                            stock_availibility: status,
                            carrier: order.carrier
                        });
                    })
            })
        })
        return Promise.all(ordrs)
    }

    function setStatus(products) {
        return new Promise((resolve, reject) => {
            let is_not_all_zero = products.find(prod => { return prod.stock_qty > 0 });
            if (!is_not_all_zero) {
                resolve(4);
            } else {
                let has_one_zero = products.find(prod => { return prod.stock_qty < prod.quantity });
                if (has_one_zero) {
                    resolve(3);
                } else {
                    let has_one_unavailable = products.find(prod => { return prod.allocated_qty <= 0 });
                    if (has_one_unavailable) {
                        resolve(2);
                    } else {
                        resolve(1);
                    }
                }
            }
        })
    }

    function sortDispatchableOrder(orders, page) {
        return new Promise((resolve, reject) => {
            let items = orders.map(order => {
                let is_atleat_one_available = order.products.find(product => { return product.stock_qty >= product.quantity });
                let is_any_number_available = order.products.find(product => { return product.stock_qty > 0; });
                let is_atleat_one_unavailable = order.products.find(product => { return product.stock_qty < product.quantity });

                if ((is_atleat_one_available && is_atleat_one_unavailable) || is_any_number_available) {
                    order.existing_status = 1
                }

                if (is_atleat_one_available && !is_atleat_one_unavailable) {
                    order.existing_status = 2;
                }

                if (!is_atleat_one_available && is_atleat_one_unavailable && !is_any_number_available) {
                    order.existing_status = 0;
                }
                return order;
            })
            let sorted = items.sort(function (a, b) {
                return b.existing_status - a.existing_status;
            });
            let from = (page - 1) * 10;
            let to = from + 10;
            let limit = sorted.slice(from, to)
            resolve(limit);
        })
    }

    router.route('/back-order')
        .post((req, res) => {
            let pageNo = req.body.pageNo ? parseInt(req.body.pageNo) : 1;
            let result = new Object();
            let cond = {
                'current_order_status.status_name': 'BackOrder',
                'is_partial_process_completd': false
            }

            if (req.body.order_no) {
                cond['order_no'] = parseInt(req.body.order_no);
            }

            if (req.body.start_date && req.body.end_date) {
                let lte_date = new Date(req.body.start_date);
                lte_date.setHours(0, 0, 0, 0);
                let gte_date = new Date(req.body.end_date);
                gte_date.setHours(23, 59, 59, 999);
                cond['order_at'] = {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }

            Order.find(cond)
                .exec()
                .then(orders => {
                    return getOrderStockStatus(orders)
                })
                .then(ords => {
                    result.data = filterOrderProductForDispatch(ords);
                    return Order.count(cond)
                })
                .then(count => {
                    result.count = count;
                    return sortDispatchableOrder(result.data, pageNo)
                })
                .then(ordr => {
                    result.data = ordr;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
            // Order.find({
            //   'current_order_status.status_name': 'BackOrder',
            //   'is_partial_process_completd': false
            // })
            //   .exec()
            //   .then(orders => {
            //     getOrderStockStatus(orders)
            //       .then(ords => {
            //         let actual_products = filterOrderProductForDispatch(ords);
            //         res.json(actual_products);
            //       })
            //   })
        })

    function filterOrderProductForDispatch(orders) {
        let filter_orders = orders.map(order => {
            order.act_product = order.products;
            order.products = order.products.filter(product => {
                return product.quantity > 0
            });
            return order;
        })
        return filter_orders;
    }


    router.route('/inshipment-waiting-order')
        .post((req, res) => {
            let pageNo = req.body.pageNo ? parseInt(req.body.pageNo) : 1;
            let result = new Object();
            let cond = {
                'current_order_status.status_name': 'Dispatch'
            }

            if (req.body.order_no) {
                cond['order_no'] = parseInt(req.body.order_no);
            }

            if (req.body.courier && req.body.courier != '') {
                cond['carrier'] = req.body.courier
            }

            if (req.body.start_date && req.body.end_date) {
                let lte_date = new Date(req.body.start_date);
                lte_date.setHours(0, 0, 0, 0);
                let gte_date = new Date(req.body.end_date);
                gte_date.setHours(23, 59, 59, 999);
                cond['order_at'] = {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }
            Order.count(cond)
                .exec()
                .then(count => {
                    result.count = count;
                    return Order.find(cond)
                        .populate({
                            path: 'carrier'
                        })
                        .populate({
                            path: 'products.product_id',
                            select: 'seo_url import_id purchase_history'
                        })
                        .skip(10 * (pageNo - 1))
                        .limit(10)
                })
                .then(orders => {
                    result.data = orders;
                    return getOrderByCourier('Dispatch')
                })
                .then(group => {
                    result.courier = group;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    res.json({ success: false, message: "Internal Server Problem", err: err });
                })
        })

    function getOrderByCourier(status) {
        return new Promise((resolve, reject) => {
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': 'Dispatch'
                }
            },
            {
                $group: {
                    _id: "$carrier",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "ordercarriers",
                    localField: '_id',
                    foreignField: '_id',
                    as: 'carrier'
                }
            },
            {
                $unwind: "$carrier"
            },
            {
                $project: {
                    carriar: "$carrier.name",
                    order_count: "$count"
                }
            }
            ])
                .exec()
                .then(results => {
                    resolve(results);
                })
                .catch(err => {
                    resolve(err);
                })
        })
    }

    router.route('/delivery-waiting-order')
        .post((req, res) => {
            let pageNo = req.body.pageNo ? parseInt(req.body.pageNo) : 1;
            let result = new Object();
            let cond = {
                'current_order_status.status_name': 'Inshipment'
            }

            if (req.body.order_no) {
                cond['order_no'] = parseInt(req.body.order_no);
            }

            if (req.body.start_date && req.body.end_date) {
                let lte_date = new Date(req.body.start_date);
                lte_date.setHours(0, 0, 0, 0);
                let gte_date = new Date(req.body.end_date);
                gte_date.setHours(23, 59, 59, 999);
                cond['order_at'] = {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }
            Order.count(cond)
                .exec()
                .then(count => {
                    result.count = count;
                    return Order.find(cond)
                        .populate({
                            path: 'carrier',
                            name: 'name phone'
                        })
                        .skip(10 * (pageNo - 1))
                        .limit(10)
                })
                .then(orders => {
                    result.data = orders;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    res.json({ success: false, message: "Internal Server Problem", err: err });
                })
        })

    router.route('/unpaid-carriar-cost-order/:id')
        .get((req, res) => {
            Order.find({
                $or: [{
                    'current_order_status.status_name': 'Delivered'
                },
                {
                    'current_order_status.status_name': 'OrderClosed'
                }
                ],
                'payment_collection.is_full_collected': true,
                'payment_collection.carrier_cost': 0,
                'carrier': mongoose.Types.ObjectId(req.params.id)
            })
                .exec()
                .then(orders => {
                    res.json(orders);
                })
        })

    router.route('/order/filter-order')
        .post(auth, (req, res) => {
            let req_output = new Object();
            let cond = new Object();
            let delayCond = new Object();
            let itemsPerPage = 10;
            let pageNum = req.body.pageNum;
            cond = {
                'current_order_status.status_name': req.body.status_name,
                'is_partially_processed': false
            }
            if (req.body.carrier && req.body.carrier != "") {
                cond.carrier = mongoose.Types.ObjectId(req.body.carrier);
            }

            if (req.body.delay_day && req.body.delay_day != "") {
                let difData = req.body.delay_day.split(',');
                if (difData[0] == 0) {
                    delayCond = {
                        'dayDif': {
                            '$lte': 2
                        }
                    }
                } else if (difData[0] == 7) {
                    delayCond = {
                        'dayDif': {
                            '$gte': 7
                        }
                    }
                } else {
                    delayCond = {
                        'dayDif': {
                            '$gt': difData[0],
                            '$lte': difData[1]
                        }
                    }
                }
            }
            Order.aggregate([{
                $match: cond
            },
            {
                $project: {
                    dayDif: {
                        $floor: {
                            "$divide": [{
                                $subtract: [new Date(), '$current_order_status.updated_at']
                            },
                            1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            },
            {
                $match: delayCond
            }
            ])
                .then(order => {
                    req_output.count = order.length;
                    let orders_id = order.map(ord => {
                        return ord._id
                    })
                    return Order.find({
                        _id: {
                            $in: orders_id
                        }
                    })
                        .populate({
                            path: 'carrier'
                        })
                        .populate({
                            path: 'created_by'
                        })
                        .populate({
                            path: 'products.product_id',
                            select: 'seo_url'
                        })
                        .populate({
                            path: 'customer_contact_info.other_contact_history.contact_by',
                            select: 'first_name last_name'
                        })
                        .sort({
                            order_at: 1
                        })
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                })
                .then(order => {
                    req_output.data = order
                    res.json(req_output);
                })
                .catch(err => {
                    //console.log(err);
                    res.json({
                        count: 0,
                        data: []
                    })
                })
        })

    router.route('/update-carriar-cost-order')
        .post(auth, (req, res) => {
            updateOrdersForCarrierCost(req.body.orders)
                .then(orders => {
                    res.json({
                        success: true
                    });
                })
                .catch(err => {
                    res.json({
                        success: false
                    });
                })
        })


    function updateOrdersForCarrierCost(orders) {
        let updated_orders = orders.map(order => {
            return new Promise((resolve, reject) => {
                Order.update({
                    _id: order._id
                }, {
                    $set: {
                        'payment_collection.carrier_cost': order.carrier_cost,
                        'carrier_cost': order.carrier_cost
                    }
                })
                    .exec()
                    .then(reslt => {
                        resolve(reslt);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(updated_orders);
    }

    // 

    router.route('/order-list-by-carrier/:id')
        .get((req, res) => {
            Order.aggregate([{
                $match: {
                    $or: [{
                        'current_order_status.status_name': 'Delivered'
                    },
                    {
                        'current_order_status.status_name': 'OrderClosed'
                    }
                    ],
                    'payment_collection.is_full_collected': false,
                    'is_paid': false,
                    'carrier': mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $project: {
                    carrier: "$carrier",
                    order_no: "$order_no",
                    order_at: "$order_at",
                    payable_amount: "$payable_amount",
                    total_paid: "$payment_collection.total_paid",
                    due_amount: {
                        $subtract: ["$payable_amount", "$payment_collection.total_paid"]
                    }
                }
            },
            {
                $sort: {
                    order_no: -1
                }
            }
            ])
                .exec()
                .then(orders => {
                    res.json(orders);
                })
        })

    router.route('/order/save/splited-order')
        .post(auth, (req, res) => {
            Order.findOne({ _id: req.body.parent_order, 'current_order_statuses.status_name': 'Dispatch' })
                .exec()
                .then(order => {
                    if (order && order._id) {
                        res.json({ success: true, message: "Already Dispatch" });
                    } else {
                        getNextSequence('order_id')
                            .then(seq => {
                                Order.create({
                                    order_no: seq,
                                    view: {
                                        is_unread: false
                                    },
                                    order_string_date: getDateString(new Date()),
                                    products: req.body.products,
                                    delivery_charge: req.body.delivery_charge,
                                    paument_method: req.body.paument_method,
                                    total_book: req.body.total_book,
                                    is_paid: req.body.is_paid,
                                    payable_amount: req.body.payable_amount,
                                    payment_collection: req.body.payment_collection,
                                    total_price: req.body.total_price,
                                    discount: req.body.discount,
                                    current_order_status: req.body.current_order_status,
                                    wrapping_charge: req.body.wrapping_charge,
                                    performed_order_statuses: req.body.performed_order_statuses,
                                    delivery_address: req.body.delivery_address,
                                    is_purchase_order_created: true,
                                    payment_information: req.body.payment_information,
                                    is_sibling: req.body.is_sibling,
                                    parent_order: req.body.parent_order,
                                    parent_order_no: req.body.parent_order_no,
                                    carrier: req.body.carrier_id,
                                    updated_by: req.user._id,
                                    created_from: 'Splited',
                                    created_at: new Date(),
                                    created_by: req.body.created_by
                                }, (err, order) => {

                                    let detectContactName = "Sir/Madam";
                                    if (order.delivery_address.contact_name.charCodeAt(0) < 2000) {
                                        var tempName = order.delivery_address.contact_name;
                                        var temp = tempName.split(" ");
                                        detectContactName = temp[temp.length - 1];
                                    }

                                    let text_message = `Dear ${detectContactName}, Due to unavailibility we are partially processing your order.Your new order no. with available books is ${order.order_no}. Thank you for choosing boibazar.com`

                                    sendMessage({
                                        phone_numbers: [order.delivery_address.phone_number],
                                        sms_for_order: {
                                            order_id: order._id,
                                            order_status: 'Splitting'
                                        },
                                        text: text_message,
                                        sms_sent_for: "splitting_customer_order"
                                    })


                                    Order.findOne({
                                        _id: order.parent_order
                                    })
                                        .exec()
                                        .then(p_order => {
                                            p_order.is_partially_processed = true;
                                            p_order.partially_processed_siblings.push(order._id);
                                            p_order.products = req.body.p_products;
                                            p_order.payment_collection = req.body.p_payment_collection;
                                            if (!req.body.is_back_order) {
                                                p_order.current_order_status = req.body.parent_current_order_status;
                                                p_order.performed_order_statuses.push(req.body.parent_current_order_status);
                                            }
                                            p_order.is_partial_process_completd = req.body.is_partial_process_completd;
                                            p_order.save(err => {
                                                if (!err) {
                                                    let sell_items = order.products.map(prd => {
                                                        return {
                                                            product_id: prd.product_id,
                                                            product_name: prd.name,
                                                            sales_order_id: order._id,
                                                            sales_qty: prd.quantity,
                                                            sales_rate: prd.price,
                                                            sales_price: (prd.quantity * prd.price),
                                                            created_at: new Date(),
                                                            created_by: req.user._id
                                                        }
                                                    })
                                                    stockEntry(sell_items)
                                                        .then(result => {
                                                            return updateStockSummary(sell_items, 'total_sales', 'sales_qty')
                                                        })
                                                        .then(result => {
                                                            return updateOrderBookAvailibilityStatusSync()
                                                        })
                                                        .then(updt => {
                                                            res.json({ success: true });
                                                        })
                                                        .catch(err => {
                                                            res.send(err);
                                                        })
                                                }
                                            })
                                        })
                                })
                            })
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err })
                })
        })


    function getOrderStockStatus(orders) {
        var stkCompairedOrder = orders.map(order => {
            return new Promise((resolve, reject) => {
                getProductStockQty(order.products)
                    .then(prods => {
                        resolve({
                            _id: order._id,
                            order_no: order.order_no,
                            payment_collection: order.payment_collection,
                            performed_order_statuses: order.performed_order_statuses,
                            current_order_status: order.current_order_status,
                            payable_amount: order.payable_amount,
                            is_paid: order.is_paid,
                            is_partially_processed: order.is_partially_processed,
                            delivery_address: order.delivery_address,
                            paument_method: order.paument_method,
                            order_at: order.order_at,
                            total_book: order.total_book,
                            discount: order.discount,
                            payment_information: order.payment_information,
                            delivery_charge: order.delivery_charge,
                            wrapping_charge: order.wrapping_charge,
                            total_price: order.total_price,
                            created_by: order.created_by,
                            stock_availibility: order.stock_availibility,
                            products: prods.map(pr => {
                                pr.act_quantity = pr.quantity;
                                pr.quantity = pr.quantity - pr.processed;
                                return pr;
                            })
                        })
                    })
            })
        })
        return Promise.all(stkCompairedOrder);
    }

    router.route('/unprocessed-order')
        .get((req, res) => {
            let itemsPerPage = req.query.itemsPerPage || 10;
            let pageNum = req.query.page_no || 1;
            let order_dash_res = new Object();
            Order.aggregate([{
                $project: {
                    status_name: "$current_order_status.status_name",
                    status_id: "$current_order_status.status_id"
                }
            },
            {
                $group: {
                    _id: {
                        name: "$status_name",
                        id: "$status_id"
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
            ])
                .exec()
                .then(orders => {
                    order_dash_res.summary = orders;
                    return Order.count({
                        'current_order_status.status_name': 'Pending'
                    })
                })
                .then(count => {
                    order_dash_res.count = count;
                    return Order.find({
                        'current_order_status.status_name': 'Pending'
                    })
                        .select({
                            view: 1,
                            is_paid: 1,
                            payable_amount: 1,
                            order_no: 1,
                            order_at: 1,
                            total_book: 1,
                            current_order_status: 1,
                            products: 1,
                            delivery_address: 1,
                            discount: 1,
                            delivery_charge: 1,
                            wrapping_charge: 1,
                            customer_contact_info: 1,
                            total_price: 1,
                            payment_information: 1,
                            payment_collection: 1,
                            created_by: 1,
                            created_from: 1
                        })
                        .populate({
                            path: 'created_by'
                        })
                        .populate({
                            path: 'products.product_id',
                            select: 'seo_url'
                        })
                        .populate({
                            path: 'customer_contact_info.other_contact_history.contact_by',
                            select: "first_name last_name"
                        })
                        .populate({
                            path: 'payment_collection.collection_info.gateway_ref',
                            select: "name"
                        })
                        .populate({
                            path: 'payment_collection.collection_info.collected_by',
                            select: 'first_name last_name'
                        })
                        .sort({
                            order_no: -1
                        })
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                })
                .then(orders => {
                    order_dash_res.orders = orders;
                    //   return Order.count({
                    //     is_partially_processed: true,
                    //     is_sibling: false,
                    //     is_partial_process_completd: false
                    //   })
                    // })
                    // .then(backorder => {
                    //   order_dash_res.back_order = backorder;
                    res.json(order_dash_res);
                })
                .catch(err => {
                    res.send(err);
                })

        })

    router.route('/unprocessed-order/:id')
        .put(auth, (req, res) => {
            Order.update({
                _id: req.params.id
            }, {
                $set: {
                    view: {
                        is_unread: false,
                        read_at: new Date,
                        view_by: req.user._id
                    }
                }
            })
                .exec()
                .then(order => {
                    res.json(order);
                })
        })

    router.route('/unprocessed-order/comment/:id')
        .put(auth, (req, res) => {
            Order.update({ _id: req.params.id }, {
                $push: {
                    'customer_contact_info.other_contact_history': {
                        contact_at: new Date(),
                        contact_by: req.user._id,
                        contact_note: req.body.comment
                    }
                }
            })
                .exec()
                .then(order => {
                    if (order && order.ok) {
                        res.json({ success: true });
                    } else {
                        res.json({ success: false, err: 'Not found error' });
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

    router.route('/order/not-purchase-order/:status')
        .get((req, res) => {
            Order.find({
                'current_order_status.status_name': req.params.status
            })
                .populate({
                    path: 'created_by'
                })
                .sort({
                    order_at: -1
                })
                .exec((err, order) => {
                    if (err)
                        res.send(err)
                    else
                        res.json(order)
                })
        })

    router.route('/order/payment-collection/:id')
        .put(auth, (req, res) => {
            Order.findOne({
                '_id': req.params.id
            }, (err, order) => {
                if (err) {
                    res.json({
                        success: false
                    });
                } else {
                    order.is_paid = true;
                    order.carrier = req.body.carrier;
                    order.carrier_cost = req.body.carrier_cost;
                    order.payment_information = {
                        status: "VALID",
                        card_brand: "Cash on Delivery",
                        val_id: "hand_cash",
                        currency_amount: req.body.amount,
                        tran_date: new Date()
                    };
                    order.save(err => {
                        if (!err) {
                            res.json({
                                success: true
                            });
                        } else {
                            res.json({
                                success: false
                            });
                        }
                    })
                }
            })
        })

    router.route('/order/selected/reconfirm-return-order/:id')
        .put(auth, (req, res) => {
            Order.update({
                _id: req.params.id
            }, {
                $set: {
                    performed_order_statuses: req.body.performed_order_statuses,
                    has_returened: false,
                    current_order_status: req.body.current_order_status
                }
            })
                .exec()
                .then(result => {
                    res.json({
                        success: true,
                        status: result
                    });
                })
                .catch(err => {
                    res.json({
                        success: false,
                        err: err
                    });
                })
        })

    router.route('/order/selected/dismiss-return-order/:id')
        .put(auth, (req, res) => {
            Order.update({
                _id: req.params.id
            }, {
                $set: {
                    return_info: req.body.return_info
                }
            })
                .exec()
                .then(result => {
                    if (result.ok)
                        res.json({
                            success: true
                        });
                    else
                        res.json({
                            success: false
                        });
                })
                .catch(err => {
                    res.json({
                        success: false
                    });
                })
        })

    router.route('/order/return-partially/:id')
        .put(auth, (req, res) => {
            Order.update({
                _id: req.params.id
            }, {
                $set: {
                    total_book: req.body.total_book,
                    total_price: req.body.total_price,
                    discount: req.body.discount,
                    delivery_charge: req.body.delivery_charge,
                    products: req.body.products,
                    payable_amount: req.body.payable_amount,
                    returned_cost: req.body.returned_cost,
                    is_partially_returned: true,
                    returned_items_price: req.body.returned_items_price,
                    returned_by: req.user._id,
                    returned_at: new Date()
                },
                $addToSet: {
                    returned_items: { $each: req.body.returned_items }
                }
            })
                .exec()
                .then(result => {
                    if (result.ok) {
                        let items = req.body.returned_items.map(prd => {
                            return {
                                product_id: prd.product_id,
                                product_name: prd.name,
                                return_order_id: req.params.id,
                                return_qty: prd.quantity,
                                created_at: new Date(),
                                created_by: req.user._id
                            }
                        })
                        stockEntry(items)
                            .then(result => {
                                return updateStockSummary(items, 'total_return', 'return_qty')
                            })
                            .then(updated => {
                                res.json({ success: true });
                            })
                    } else {
                        res.json({ success: false, message: "Unknown error" });
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

    router.route('/order/selected/:id')
        .get(auth, (req, res) => {
            Order.findOne({
                '_id': req.params.id
            })
                .populate({
                    path: "created_by"
                })
                .populate({
                    path: "gift_id"
                })
                .exec((err, order) => {
                    if (err) {
                        res.send(err);
                    } else {
                        getProductStockQty(order.products)
                            .then(new_products => {
                                let new_order = {
                                    created_by: order.created_by,
                                    current_order_status: order.current_order_status,
                                    delivery_address: order.delivery_address,
                                    delivery_charge: order.delivery_charge,
                                    payment_collection: order.payment_collection,
                                    discount: order.discount,
                                    is_paid: order.is_paid,
                                    payment_information: order.payment_information,
                                    payable_amount: order.payable_amount,
                                    wallet_amount: order.wallet_amount || 0,
                                    total_book: order.total_book,
                                    is_guest_order: order.is_guest_order,
                                    order_at: order.order_at,
                                    order_no: order.order_no,
                                    performed_order_statuses: order.performed_order_statuses,
                                    products: new_products,
                                    total_price: order.total_price,
                                    gift_id: order.gift_id,
                                    wrapping_charge: order.wrapping_charge,
                                    _id: order._id,
                                }
                                res.json(new_order);
                            })
                    }
                })
        })

        .put(auth, (req, res) => {
            let current_order = new Object();
            Order.findOne({
                '_id': req.params.id
            }, (err, order) => {
                let is_dispatched = order.performed_order_statuses.find(status => {
                    return status.status_name == 'Dispatch'
                })
                if (req.body.selectedStatus.name == "Dispatch" && is_dispatched) {
                    res.json(order);
                } else {
                    current_order = order;
                    if (err) {
                        res.send(err);
                    } else {
                        order.current_order_status = {
                            "status_id": req.body.selectedStatus._id,
                            "status_name": req.body.selectedStatus.name,
                            "updated_at": new Date()
                        };
                        if (req.body.selectedStatus.name == "Delivered") {
                            order.delivered_at = req.body.delivered_at;
                        }

                        if (req.body.has_comment) {
                            order.customer_contact_info.other_contact_history.push({
                                contact_at: new Date(),
                                contact_by: req.user._id,
                                contact_note: req.body.comment
                            })
                        }

                        if (req.body.selectedStatus.name == "Inshipment") {
                            order.carrier = req.body.carrier;
                            order.parcel_wight = req.body.parcel_wight;
                        }

                        if (req.body.selectedStatus.name == "Returned") {
                            order.has_returened = true;
                            order.returned_cost = req.body.returned_cost;
                        }

                        return order.save()
                            .then(order => {
                                if (req.body.send_message) {
                                    sendMessage({
                                        phone_numbers: [order.delivery_address.phone_number],
                                        sms_for_order: {
                                            order_id: order._id,
                                            order_status: req.body.selectedStatus.name
                                        },
                                        text: req.body.text_message,
                                        sms_sent_for: "create_customer_order"
                                    })
                                }
                                if (req.body.selectedStatus.name == "Dispatch") {
                                    let sell_items = order.products.map(prd => {
                                        return {
                                            product_id: prd.product_id,
                                            product_name: prd.name,
                                            sales_order_id: current_order._id,
                                            sales_qty: prd.quantity,
                                            sales_rate: prd.price,
                                            sales_price: (prd.quantity * prd.price),
                                            created_at: new Date(),
                                            created_by: req.user._id
                                        }
                                    })
                                    stockEntry(sell_items)
                                        .then(result => {
                                            return updateStockSummary(sell_items, 'total_sales', 'sales_qty')
                                        })
                                        .then(updt => {
                                            res.json(order);
                                        })
                                        .catch(err => {
                                            res.send(err);
                                        })
                                } else if (req.body.selectedStatus.name == "Cancelled") {
                                    let has_dispatch = current_order.performed_order_statuses.find(status => {
                                        return status.status_name == "Dispatch"
                                    });
                                    if (has_dispatch) {
                                        let items = current_order.products.map(prd => {
                                            return {
                                                product_id: prd.product_id,
                                                product_name: prd.name,
                                                cancel_order_id: current_order._id,
                                                cancel_qty: prd.quantity,
                                                created_at: new Date(),
                                                created_by: req.user._id
                                            }
                                        })
                                        stockEntry(items)
                                            .then(result => {
                                                return updateStockSummary(items, 'total_cancel', 'cancel_qty')
                                            })
                                            .then(updt => {
                                                res.json(order);
                                            })
                                            .catch(err => {
                                                res.send(err);
                                            })
                                    } else {
                                        res.json(order);
                                    }
                                } else if (req.body.selectedStatus.name == "Returned") {

                                    let items = current_order.products.map(prd => {
                                        return {
                                            product_id: prd.product_id,
                                            product_name: prd.name,
                                            return_order_id: current_order._id,
                                            return_qty: prd.quantity,
                                            created_at: new Date(),
                                            created_by: req.user._id
                                        }
                                    })
                                    stockEntry(items)
                                        .then(result => {
                                            return updateStockSummary(items, 'total_return', 'return_qty')
                                        })
                                        .then(updt => {
                                            res.json(order);
                                        })
                                        .catch(err => {
                                            res.send(err);
                                        })
                                } else {
                                    res.json(order);
                                }
                            })
                    }
                }
            })
        })

    router.route('/order/change-order-status/:order_id')
        .put(auth, (req, res) => {



            let new_status = {
                "status_id": req.body.selectedStatus._id,
                "status_name": req.body.selectedStatus.name,
                "updated_at": new Date(),
                "updated_by": req.user._id
            };
            let contact_info = {
                contact_at: new Date(),
                contact_by: req.user._id,
                contact_note: req.body.comment
            }
            let changed_field = {
                current_order_status: new_status
            }
            let ecourierFormData = {}
            if (req.body.selectedStatus.name == "Inshipment" && req.body.carrier_name == "E-Courier") {
                changed_field.carrier = req.body.carrier;
                changed_field.parcel_wight = req.body.parcel_wight;
                contact_info.contact_note = "Inshipment(Auto Comment)";


                let packageCode = '';
                if (req.body.recipient_city == 'Dhaka' || req.body.recipient_city == 'dhaka') {
                    if (changed_field.parcel_wight <= 500) {
                        packageCode = '#2473';

                    } else if (changed_field.parcel_wight > 500 && changed_field.parcel_wight <= 1000) {
                        packageCode = '#2416';

                    } else if (changed_field.parcel_wight > 1000 && changed_field.parcel_wight <= 2000) {
                        packageCode = '#2417';
                    } else {
                        packageCode = '#2473';
                    }
                } else {
                    packageCode = '#2535';
                }

                ecourierFormData = {
                    "parcel": "insert",
                    "recipient_name": req.body.recipient_name,
                    "recipient_mobile": req.body.phone_number,
                    "recipient_city": req.body.recipient_city,
                    "recipient_area": req.body.recipient_area,
                    "recipient_address": req.body.recipient_address,
                    "package_code": packageCode,
                    "product_price": req.body.product_price,
                    "payment_method": req.body.payment_method,
                    "recipient_landmark": "",
                    "parcel_type": "BOX",
                    "is_anonymous": "0",
                    "requested_delivery_time": req.body.requested_delivery_time,
                    "delivery_hour": req.body.delivery_hour,
                    "recipient_zip": "",
                    "product_id": req.body.product_id,
                    "pick_address": req.body.pick_address,
                    "comments": req.body.comments,
                    "number_of_item": req.body.number_of_item,
                    "actual_product_price": req.body.actual_product_price
                }
            }
            if (req.body.carrier && req.body.carrier != '') {
                changed_field.carrier = req.body.carrier;
            }
            if (req.body.selectedStatus.name == "Delivered") {
                changed_field.delivered_at = req.body.delivered_at;
                contact_info.contact_note = "Delivered(Auto Comment)";
            }
            Order.findOneAndUpdate({
                _id: req.params.order_id,
                'performed_order_statuses.status_name': { $ne: req.body.selectedStatus.name }
            }, {
                $set: changed_field,
                $push: {
                    'customer_contact_info.other_contact_history': contact_info,
                    performed_order_statuses: new_status
                }
            })
                .exec()
                .then(result => {
                    if (result._id) {

                        //Check whether there was any referral code applied or not
                        if (result.referral_code && result.discount && req.body.selectedStatus.name == "Delivered") {
                            updateReferralWallet(result.referral_code, result.discount);
                        }
                        if (req.body.selectedStatus.name == "Delivered" && result.created_by && result.order_at) {

                            var lte_date = new Date('2019-08-07T18:00:00.000Z');
                            var gte_date = new Date('2019-08-18T17:59:59.000Z');

                            if (result.created_by && result.order_at && lte_date < result.order_at && result.order_at < gte_date) {
                                let walletBonus = result.payable_amount * (.10);
                                updateSalamiWallet(result.created_by, walletBonus);
                            }
                        }
                        if (req.body.selectedStatus.name == "Cancelled") {
                            updateOrderBookAvailibilityStatus();
                        }

                        if (req.body.selectedStatus.name == "Inshipment" && req.body.carrier_name == "E-Courier") {
                            updateEcourier(ecourierFormData)
                        }

                        try {

                            if (req.body.send_message) {
                                sendMessage({
                                    phone_numbers: [req.body.phone_number],
                                    sms_for_order: {
                                        order_id: req.params.order_id,
                                        order_status: req.body.selectedStatus.name
                                    },
                                    text: req.body.text_message,
                                    sms_sent_for: "create_customer_order"
                                })
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        res.json({ success: true });
                    } else {
                        res.json({ success: true, err: result });
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

    router.route('/order/update-flags/')
        .put(auth, (req, res) => {

            let updateQuery = {};

            if (req.body.flag_type == 'carrier') {
                updateQuery = {
                    carrier: req.body.carrier
                }

            } else if (req.body.flag_type == 'indian_book_available') {
                updateQuery = {
                    indian_book_available: req.body.indian_book_available
                }

            } else if (req.body.flag_type == 'corporate_sale') {
                updateQuery = {
                    corporate_sale: req.body.corporate_sale
                }
            }

            Order.update({
                _id: req.body.order_id
            }, {
                $set: updateQuery
            })
                .exec()
                .then(result => {
                    if (result.ok) {
                        res.json({ success: true });
                    } else {
                        res.json({ success: false });
                    }
                })


        })

    router.route('/order/update-return-print/')
        .put(auth, (req, res) => {
            let order_ids = req.body;

            updateReturn(order_ids)
                .then(orders => {
                    res.json({
                        success: true
                    })
                })
                .catch(err => {
                    res.json({
                        success: false
                    })
                })

        })

    function updateReturn(order_ids) {
        let ret_orders = order_ids.map(order_id => {
            return new Promise((resolve, reject) => {

                Order.update({
                    order_no: order_id
                }, {
                    $set: {
                        'current_order_status.is_print_return': true
                    }
                })
                    .exec()
                    .then(ret_res => {
                        resolve(ret_res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(ret_orders);
    }


    router.route('/order/confirm-order/:order_id')
        .put(auth, (req, res) => {
            let new_status = {
                "status_id": req.body.selectedStatus._id,
                "status_name": req.body.selectedStatus.name,
                "updated_at": new Date(),
                "updated_by": req.user._id
            };
            let contact_info = {
                contact_at: new Date(),
                contact_by: req.user._id,
                contact_note: req.body.comment
            }
            let changed_field = {
                current_order_status: new_status
            }
            if (req.body.carrier && req.body.carrier != '') {
                changed_field.carrier = req.body.carrier;
            }
            if (req.body.gift_id) {
                changed_field.gift_id = req.body.gift_id;
            }

            if (req.body.is_emergency) {
                changed_field.is_emergency = req.body.is_emergency;
                changed_field.emergency_date = req.body.emergency_date || undefined;
            }
            Order.update({
                _id: req.params.order_id,
                'performed_order_statuses.status_name': { $ne: req.body.selectedStatus.name }
            }, {
                $set: changed_field,
                $push: {
                    'customer_contact_info.other_contact_history': contact_info,
                    performed_order_statuses: new_status
                }
            })
                .exec()
                // })
                .then(result => {
                    if (result.ok) {
                        updateOrderBookAvailibilityStatus();
                        try {
                            if (req.body.send_message) {
                                sendMessage({
                                    phone_numbers: [req.body.phone_number],
                                    sms_for_order: {
                                        order_id: req.params.order_id,
                                        order_status: req.body.selectedStatus.name
                                    },
                                    text: req.body.text_message,
                                    sms_sent_for: "create_customer_order"
                                })
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        res.json({ success: true });
                    } else {
                        res.json({ success: true, err: result });
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

    router.route('/order/confirm-order/test')
        .get((req, res) => {
            getAvailibilityInfo()
                .then(rslt => {
                    return updateAvailability(rslt)
                        .then(updt => {
                            res.json(updt);
                        })
                })
                .catch(err => {
                    res.send(err)
                })
        })

    function updateAvailability(products) {
        let updates = products.map(product => {
            return new Promise((resolve, reject) => {
                if (product.stock_qty == 0) {
                    updateEmptyStock(product.order, product.product_id)
                        .then(ords => {
                            resolve(ords);
                        })
                } else if (product.stock_qty >= product.required_qty) {
                    updateAvailableStock(product.order, product.product_id, product.stock_qty)
                        .then(ords => {
                            resolve(ords);
                        })
                } else {
                    updateInsufficientStock(product.order, product.product_id, product.stock_qty)
                        .then(ords => {
                            resolve(ords);
                        })
                }
            })
        })
        return Promise.all(updates);
    }

    function updateEmptyStock(orders, product_id) {
        let updates = orders.map(order => {
            return new Promise((resolve, reject) => {
                Order.update({
                    _id: order._id,
                    'products.product_id': product_id
                }, {
                    $set: {
                        'products.$.stock_qty': 0,
                        'products.$.allocated_qty': 0
                    }
                })
                    .exec()
                    .then(updt => {
                        resolve(updt);
                    })
            })
        })
        return Promise.all(updates);
    }

    function updateAvailableStock(orders, product_id, stock_qty) {
        let updates = orders.map(order => {
            return new Promise((resolve, reject) => {
                Order.update({
                    _id: order._id,
                    'products.product_id': product_id
                }, {
                    $set: {
                        'products.$.stock_qty': stock_qty,
                        'products.$.allocated_qty': order.quantity
                    }
                })
                    .exec()
                    .then(updt => {
                        resolve(updt);
                    })
            })
        })
        return Promise.all(updates);
    }

    function updateInsufficientStock(orders, product_id, stock_qty) {
        let curr_stock = stock_qty;
        let updates = orders.map(order => {
            curr_stock = curr_stock - order.quantity;
            return new Promise((resolve, reject) => {
                Order.update({
                    _id: order._id,
                    'products.product_id': product_id
                }, {
                    $set: {
                        'products.$.stock_qty': stock_qty,
                        'products.$.allocated_qty': curr_stock >= 0 ? order.quantity : 0
                    }
                })
                    .exec()
                    .then(updt => {
                        resolve(updt);
                    })
            })
        })
        return Promise.all(updates);
    }

    function getAvailibilityInfo() {
        return new Promise((resolve, reject) => {
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': 'Confirmed'
                }
            },
            {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: "$products.product_id",
                    required_qty: { $sum: "$products.quantity" },
                    order: {
                        $push: {
                            _id: "$_id",
                            quantity: "$products.quantity"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "stocksummaries",
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'stock'
                }
            }
            ])
                .exec()
                .then(products => {
                    let results = products.map(product => {
                        let itm = {
                            product_id: product._id,
                            order: product.order,
                            required_qty: product.required_qty
                        }
                        if (product.stock.length == 0) {
                            itm.stock_qty = 0
                        } else {
                            let opening_stock = product.stock[0].opening_stock ? product.stock[0].opening_stock : 0;
                            let total_purchase = product.stock[0].total_purchase ? product.stock[0].total_purchase : 0;
                            let total_sales = product.stock[0].total_sales ? product.stock[0].total_sales : 0;
                            let total_return = product.stock[0].total_return ? product.stock[0].total_return : 0;
                            itm.stock_qty = opening_stock + total_purchase + total_return - total_sales;
                        }
                        return itm;
                    })
                    resolve(results);
                })
                .catch(err => {
                    reject(err)
                })
        })
    }


    function getRequiredAndStockOfConfirmOrders(params) {
        return new Promise((resolve, reject) => {
            Order.aggregate([{
                $match: {
                    $or: [
                        { 'current_order_status.status_name': "Confirmed" },
                        { _id: mongoose.Types.ObjectId(params.order_id) }
                    ]
                }
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    'products.product_id': {
                        $in: params.product_ids
                    }
                }
            },
            {
                $group: {
                    _id: "$products.product_id",
                    quantity: { $sum: "$products.quantity" }
                }
            },
            {
                $lookup: {
                    from: "stocksummaries",
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'stock'
                }
            }
            ])
                .exec()
                .then(products => {
                    // resolve(orders);
                    let results = products.map(product => {
                        let itm = {
                            product_id: product._id,
                            required_qty: product.quantity
                        }
                        if (product.stock.length == 0) {
                            itm.stock_qty = 0
                        } else {
                            let opening_stock = product.stock[0].opening_stock ? product.stock[0].opening_stock : 0;
                            let total_purchase = product.stock[0].total_purchase ? product.stock[0].total_purchase : 0;
                            let total_sales = product.stock[0].total_sales ? product.stock[0].total_sales : 0;
                            let total_return = product.stock[0].total_return ? product.stock[0].total_return : 0;
                            itm.stock_qty = opening_stock + total_purchase + total_return - total_sales;
                        }
                        return itm;
                    })
                    resolve(results);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    router.route('/order/send-to-dispatch/:order_id')
        .put(auth, (req, res) => {


            itemAvailableInStock(req.body.products)
                .then(result => {

                    let unavailable_item = result.find(prod => {
                        return prod.current_stock < prod.sales_qty;
                    })
                    if (unavailable_item) {


                        res.json({ success: false, message: "Unavailable stock item found" })
                    } else {


                        let new_status = {
                            "status_id": req.body.selectedStatus._id,
                            "status_name": req.body.selectedStatus.name,
                            "updated_at": new Date(),
                            "updated_by": req.user._id
                        };
                        let contact_info = {
                            contact_at: new Date(),
                            contact_by: req.user._id,
                            contact_note: "Dispatched(Auto Comment)"
                        }
                        Order.update({
                            _id: req.params.order_id,
                            'performed_order_statuses.status_name': { $ne: req.body.selectedStatus.name }
                        }, {
                            $set: {
                                current_order_status: new_status
                            },
                            $push: {
                                'customer_contact_info.other_contact_history': contact_info,
                                performed_order_statuses: new_status
                            }
                        })
                            .exec()
                            .then(result => {


                                if (result.ok) {
                                    let sell_items = req.body.products;


                                    stockEntry(sell_items)
                                        .then(result => {
                                            return updateStockSummary(sell_items, 'total_sales', 'sales_qty')
                                        })
                                        .then(updt => {
                                            return updateOrderBookAvailibilityStatusSync()
                                        })
                                        .then(updt => {
                                            res.json({ success: true });
                                        })
                                        .catch(err => {
                                            res.json({ success: true });
                                        })
                                } else {
                                    res.json({ success: true, err: result });
                                }
                            })
                            .catch(err => {
                                res.json({ success: false, err: err });
                            })
                    }
                })
        })

    function itemAvailableInStock(items) {
        let products = items.map(itm => {
            return new Promise((resolve, reject) => {
                StockSummary.aggregate([{
                    $match: {
                        product_id: mongoose.Types.ObjectId(itm.product_id)
                    }
                },
                {
                    $project: {
                        current_stock: {
                            $subtract: [{ $sum: ['$opening_stock', '$total_purchase', '$total_cancel', '$total_return'] }, { $ifNull: ["$total_sales", 0] }]
                        }
                    }
                }
                ])
                    .exec()
                    .then(result => {
                        // console.log('result current_stock')
                        // console.log(result)
                        let product = {
                            created_at: itm.created_at,
                            created_by: itm.created_by,
                            product_id: itm.product_id,
                            product_name: itm.product_name,
                            sales_order_id: itm.sales_order_id,
                            sales_price: itm.sales_price,
                            sales_qty: itm.sales_qty,
                            sales_rate: itm.sales_rate,
                            current_stock: result[0] ? result[0].current_stock : { current_stock: 0 }
                        }
                        resolve(product);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(products);
    }

    router.route('/order/return-order/:order_id')
        .put(auth, (req, res) => {

            let new_status = {
                "status_id": req.body.selectedStatus._id,
                "status_name": req.body.selectedStatus.name,
                "updated_at": new Date(),
                "updated_by": req.user._id
            };
            let contact_info = {
                contact_at: new Date(),
                contact_by: req.user._id,
                contact_note: req.body.comment
            }
            let changed_field = {
                current_order_status: new_status,
                has_returened: true,
                returned_cost: req.body.returned_cost,
            }
            Order.update({
                _id: req.params.order_id,
                'performed_order_statuses.status_name': { $ne: req.body.selectedStatus.name }
            }, {
                $set: changed_field,
                $push: {
                    'customer_contact_info.other_contact_history': contact_info,
                    performed_order_statuses: new_status
                }
            })
                .exec()
                .then(result => {
                    if (result.ok) {
                        let items = req.body.products;
                        stockEntry(items)
                            .then(result => {
                                return updateStockSummary(items, 'total_return', 'return_qty')
                            })
                            .then(updt => {
                                updateOrderBookAvailibilityStatus();
                                res.json({ success: true });
                            })
                            .catch(err => {
                                res.json({ success: true });
                            })
                    } else {
                        res.json({ success: true, err: result });
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })


    router.route('/order/change-order/:id')
        .put(auth, (req, res) => {
            let disputeChanges = req.body.dispute_changes;
            Order.findOne({
                '_id': req.params.id
            }, (err, order) => {
                if (err) {
                    res.send(err);
                } else {
                    if (req.body.dispute_changes && req.body.dispute_changes.length > 0) {
                        let updates = disputeChanges.map(product_stock => {
                            return new Promise((resolve, reject) => {
                                let qty_dif = product_stock.new_qty - product_stock.previous_qty;
                                if (qty_dif != 0) {
                                    StockSummary.findOne({
                                        'product_id': mongoose.Types.ObjectId(product_stock.product_info._id)
                                    })
                                        .exec()
                                        .then(stockSum => {
                                            if (stockSum) {
                                                if (qty_dif > 0) { //Stock Increase
                                                    if ((stockSum.opening_stock || 0) + (stockSum.total_purchase || 0) + (stockSum.total_return || 0) > stockSum.total_sales) {
                                                        stockSum.total_sales = stockSum.total_sales + qty_dif;
                                                        stockSum.save(err => {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: "Stock Summary update failed!"
                                                                })
                                                            } else {
                                                                Stock.findOne({
                                                                    '$and': [
                                                                        { sales_order_id: req.params.id },
                                                                        { product_id: mongoose.Types.ObjectId(product_stock.product_info._id) }
                                                                    ]
                                                                })
                                                                    .exec()
                                                                    .then(stock => {
                                                                        if (stock && stock.sales_qty) {
                                                                            stock.sales_qty = stock.sales_qty + qty_dif;
                                                                            stock.sales_price = stock.sales_qty * stock.sales_rate;
                                                                            stock.save(stockSave => {
                                                                                resolve(stockSave);
                                                                            })
                                                                        } else {
                                                                            resolve(stock)
                                                                        }
                                                                    })
                                                                    .catch(err => {
                                                                        reject(err)
                                                                    })
                                                            }
                                                        })
                                                    } else {
                                                        req.body.products.forEach((element, index) => {
                                                            if (element.product_id == product_stock.product_info._id) {
                                                                element.quantity = product_stock.previous_qty;
                                                            }
                                                        })
                                                        resolve(stockSum)
                                                    }
                                                } else { //Stock Decrease
                                                    stockSum.total_sales = stockSum.total_sales + qty_dif;
                                                    stockSum.save(err => {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: "Stock Summary update failed!"
                                                            })
                                                        } else {
                                                            Stock.findOne({
                                                                '$and': [
                                                                    { sales_order_id: req.params.id },
                                                                    { product_id: mongoose.Types.ObjectId(product_stock.product_info._id) }
                                                                ]
                                                            })
                                                                .exec()
                                                                .then(stock => {
                                                                    if (stock && stock.sales_qty) {
                                                                        stock.sales_qty = stock.sales_qty + qty_dif;
                                                                        stock.sales_price = stock.sales_qty * stock.sales_rate;
                                                                        stock.save(stockSave => {
                                                                            resolve(stockSave);
                                                                        })
                                                                    } else {
                                                                        resolve(stock)
                                                                    }
                                                                })
                                                                .catch(err => {
                                                                    reject(err)
                                                                })
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Stock Not Available!"
                                                })
                                            }
                                        })
                                }
                            })
                        })
                        Promise.all(updates)
                            .then(ordr => {
                                orderUpdate(order, req.body, req.user._id)
                                    .then(result => {
                                        res.json({
                                            success: true,
                                            message: "Successfully order updated!"
                                        })

                                    })
                                    .catch(err => {
                                        res.json({
                                            success: false,
                                            error: err,
                                            message: "Order Update Failed!"
                                        })
                                    })
                            })
                            .catch(err => {
                                res.json({
                                    success: false,
                                    error: err,
                                    message: "Stock update failed!"
                                })
                            })
                    } else {
                        orderUpdate(order, req.body, req.user._id)
                            .then(result => {
                                res.json({
                                    success: true,
                                    message: "Successfully order updated!"
                                })
                            })
                            .catch(err => {
                                res.json({
                                    success: false,
                                    error: err,
                                    message: "Order Update Failed!"
                                })
                            })
                    }
                }
            })
        })



    function orderUpdate(order, request_body, user_id) {

        return new Promise((resolve, reject) => {
            if (order._id) {
                saveOrderLog(order, user_id, "order-update-opt")
                order.order_no = request_body.order_no;
                order.products = request_body.products;
                order.delivery_charge = request_body.delivery_charge;
                order.delivery_address = request_body.delivery_address;
                order.total_price = request_body.total_price;
                order.total_book = request_body.total_book;
                order.payable_amount = request_body.payable_amount;
                order.discount = request_body.discount;
                order.current_order_status = request_body.current_order_status;
                order.wrapping_charge = request_body.wrapping_charge;
                order.performed_order_statuses = request_body.performed_order_statuses;
                order.created_by = request_body.created_by ? request_body.created_by._id : undefined;
                order.updated_by = user_id;
                order.save(err => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(order)
                    }
                })
            } else {
                reject(order)
            }

        })



    }

    router.route('/order/book-list/required-purchase')

        // .get((req, res) => {
        //     let pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 0;
        //     let result = new Object();
        //     let cond = { 'current_order_status.status_name': 'Confirmed' };
        //     if (req.query.orderNo != '0' && req.query.orderNo != '' && !isNaN(req.query.orderNo)) {
        //         cond['order_no'] = parseInt(req.query.orderNo);
        //     }

        //     Order.aggregate([{
        //                 $match: cond
        //             },
        //             {
        //                 $unwind: "$products"
        //             },
        //             {
        //                 $group: {
        //                     _id: "$products.product_id",
        //                     orders: {
        //                         $push: {
        //                             order_no: "$order_no",
        //                             order_at: "$order_at",
        //                             product_id: "$products.product_id",
        //                             name: "$products.name",
        //                             author: "$products.author",
        //                             publisher: "$products.publisher",
        //                             required_qty: "$products.required_qty",
        //                             sales_price: "$products.sales_price",
        //                             is_out_of_stock: '$products.is_out_of_stock',
        //                             arrives_in_stock: "$products.arrives_in_stock",
        //                             is_out_of_print: "$products.is_out_of_print",
        //                             is_info_delay: "$products.is_info_delay",
        //                             info_delayed: "$products.info_delayed",
        //                         }
        //                     }

        //                 }
        //             }
        //         ])
        //         // .skip((pageNo - 1) * 10)
        //         //.limit(10)
        //         .exec()
        //         .then(orders => {
        //             result.data = orders
        //                 //   return Order.count({ 'current_order_status.status_name': 'Confirmed' })
        //                 // })
        //                 // .then(count => {
        //                 //   result.count = count;
        //             result.success = true;
        //             res.json(result);
        //         })
        //         .catch(err => {
        //             res.send({ success: false, err: err });
        //         })
        // })

        .get((req, res) => {
            let pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 0;
            let result = new Object();
            let cond = { 'current_order_status.status_name': 'Confirmed' };
            if (req.query.orderNo != '0' && req.query.orderNo != '' && !isNaN(req.query.orderNo)) {
                cond['order_no'] = parseInt(req.query.orderNo);
            }

            Order.aggregate([{
                $match: cond
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "stocksummaries",
                    localField: "products.product_id",
                    foreignField: "product_id",
                    as: "products.stocks"
                }
            },
            {
                $group: {
                    _id: {
                        order_no: "$order_no",
                        order_at: "$order_at"
                    },
                    products: {
                        $push: {
                            product_id: "$products.product_id",
                            name: "$products.name",
                            author: "$products.author",
                            publisher: "$products.publisher",
                            required_qty: "$products.quantity",
                            sales_price: "$products.price",
                            is_out_of_stock: '$products.is_out_of_stock',
                            arrives_in_stock: "$products.arrives_in_stock",
                            is_out_of_print: "$products.is_out_of_print",
                            is_info_delay: "$products.is_info_delay",
                            info_delayed: "$products.info_delayed",
                            stock_qty: {
                                $arrayElemAt: [{
                                    $map: {
                                        input: "$products.stocks",
                                        as: "stock",
                                        in: {
                                            $subtract: [{ $sum: ['$$stock.opening_stock', '$$stock.total_purchase', '$$stock.total_cancel', '$$stock.total_return'] }, { $ifNull: ["$$stock.total_sales", 0] }]
                                        }
                                    }
                                }, 0]
                            }
                        }
                    }
                }
            }
            ])
                // .skip((pageNo - 1) * 10)
                //.limit(50)
                .exec()
                .then(orders => {
                    result.data = orders
                    //   return Order.count({ 'current_order_status.status_name': 'Confirmed' })
                    // })
                    // .then(count => {
                    //   result.count = count;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    res.send({ success: false, err: err });
                })
        })

        .put(auth, (req, res) => {
            Order.update({
                order_no: req.body.order_no,
                products: { $elemMatch: { product_id: req.body.product_id } }
            }, {
                $set: {
                    'products.$.is_out_of_stock': req.body.is_out_of_stock,
                    'products.$.arrives_in_stock': req.body.arrives_in_stock,
                    'products.$.is_out_of_print': req.body.is_out_of_print,
                    'products.$.is_info_delay': req.body.is_info_delay,
                    'products.$.info_delayed': req.body.info_delayed
                }
            })
                .exec()
                .then(result => {
                    return Order.update({
                        order_no: req.body.order_no
                    }, {
                        $push: {
                            'customer_contact_info.other_contact_history': {
                                contact_at: new Date(),
                                contact_by: req.user._id,
                                contact_note: req.body.comment
                            }
                        }
                    })
                })
                .then(result => {
                    if (req.body.is_out_of_print) {
                        Product.update({ _id: req.body.product_id }, { $set: { is_out_of_print: true } })
                            .exec()
                            .then(updt => {
                                res.json(updt);
                            })
                            .catch(err => {
                                res.send(err);
                            })
                    } else {
                        res.json(result);
                    }
                })
                .catch(err => {
                    res.send(err);
                })
        })

    router.route('/order/selected-order')
        .post((req, res) => {
            let object_ids = req.body.map(id => {
                return mongoose.Types.ObjectId(id)
            })
            Order.aggregate([{
                $match: {
                    _id: {
                        $in: object_ids
                    }
                }
            },
            {
                $project: {
                    products: "$products"
                }
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.purchase_order_created": false
                }
            },
            {
                $group: {
                    _id: "$products.product_id",
                    orders_id: {
                        $push: "$_id"
                    },
                    item: {
                        $first: "$products"
                    },
                    quantity: {
                        $sum: "$products.quantity"
                    }
                }
            },
            {
                $project: {
                    product_id: "$_id",
                    orders_id: "$orders_id",
                    quantity: "$quantity",
                    price: "$item.price",
                    name: "$item.name",
                    image: "$item.image",
                    publisher: "$item.publisher",
                    _id: "$item.product_id",
                }
            }
            ])
                .exec()
                .then(result => {
                    return getProductStockQty(result)
                })
                .then(stock => {
                    res.json(stock);
                })
                .catch(err => {
                    //console.log(err);
                })
        })

    router.route('/order/product-list/by-publisher')
        .get((req, res) => {
            let publisher_name = req.query.name;
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': 'Confirmed'
                }
            },
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.publisher': publisher_name
                }
            },
            {
                $group: {
                    _id: '$products.product_id',
                    quantity: { $sum: "$products.quantity" }
                }
            },
            {
                $project: {
                    product_id: "$_id",
                    quantity: "$quantity"
                }
            }
            ])
                .exec()
                .then(result => {
                    return getProductStockQty(result)
                })
                .then(stock => {
                    res.json(stock);
                })
                .catch(err => {
                    console.log(err);
                })
        })

    router.route('/order/selected-product/stock-info')
        .get((req, res) => {
            if (req.query.id) {
                let products = [{ product_id: mongoose.Types.ObjectId(req.query.id), quantity: 1 }];
                getProductStockQty(products)
                    .then(stock => {
                        res.json(stock);
                    })
            } else if (req.query.seo) {
                Product.findOne({ seo_url: req.query.seo })
                    .exec()
                    .then(product => {
                        if (product && product._id) {
                            let products = [{ product_id: product._id, quantity: 1 }];
                            getProductStockQty(products)
                                .then(stock => {
                                    res.json(stock);
                                })
                        } else {
                            let stock = [];
                            res.json(stock);
                        }
                    })
                    .catch(err => {
                        let stock = [];
                        res.json(stock);
                    })
            } else {
                let stock = [];
                res.json(stock);
            }
        })

    function getProductStockQty(products) {
        let new_products = products.map(product => {
            return new Promise((resolve, reject) => {
                let new_product = new Object();
                new_product._id = product.product_id;
                if (product.orders_id) {
                    new_product.orders_id = product.orders_id;
                }
                new_product.name = product.name;
                new_product.send = product.send;
                new_product.quantity = product.quantity;
                new_product.processed = product.processed ? product.processed : 0;
                new_product.price = product.price;
                StockSummary.aggregate([{
                    $match: {
                        product_id: product.product_id
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $unwind: "$product"
                },
                {
                    $lookup: {
                        from: "suppliers",
                        localField: "supplier",
                        foreignField: "_id",
                        as: "supplier"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "product.publisher",
                        foreignField: "_id",
                        as: "product.publisher"
                    }
                },
                {
                    $unwind: "$product.publisher"
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "product.author",
                        foreignField: "_id",
                        as: "product.authors"
                    }
                },
                {
                    $project: {
                        last_purchase: {
                            rate: '$purchase_rate',
                            supplier: {
                                _id: { $arrayElemAt: ['$supplier._id', 0] },
                                name: { $arrayElemAt: ['$supplier.name', 0] },
                                address: { $arrayElemAt: ['$supplier.address', 0] }
                            }
                        },
                        stock_qty: {
                            $subtract: [{ $sum: ['$opening_stock', '$total_purchase', '$total_cancel', '$total_return'] }, { $ifNull: ["$total_sales", 0] }]
                        },
                        name: { $arrayElemAt: ['$product.lang.content.name', 0] },
                        seo_url: '$product.seo_url',
                        image: '$product.image[250X360]',
                        site_link: {
                            $concat: ['https://www.boibazar.com/book/', '$product.seo_url']
                        },
                        product_id: {
                            _id: "$product._id",
                            seo_url: "$product.seo_url",
                            import_id: "$product.import_id"
                        },
                        publisher: {
                            _id: '$product.publisher._id',
                            name: '$product.accessories.publisher_bn.name',
                        },
                        authors: {
                            $map: {
                                input: '$product.authors',
                                as: 'author',
                                in: {
                                    _id: '$$author._id',
                                    name: '$$author.name'
                                }
                            }
                        }
                    }
                }
                ])
                    .exec()
                    .then(stock => {
                        if (stock && stock.length > 0) {
                            let new_stock = stock[0];
                            if (product.orders_id) {
                                new_stock.orders_id = product.orders_id;
                            }
                            new_stock._id = product.product_id;
                            new_stock.send = product.send;
                            new_stock.quantity = product.quantity;
                            new_stock.processed = product.processed ? product.processed : 0;
                            new_stock.price = product.price ? product.price : 0;
                            resolve(new_stock);
                        } else {
                            Product.findOne({
                                _id: product.product_id
                            })
                                .select({
                                    name: 1,
                                    author: 1,
                                    publisher: 1,
                                    seo_url: 1,
                                    lang: 1,
                                    accessories: 1,
                                    import_id: 1
                                })
                                .populate({
                                    path: 'author',
                                    select: 'name'
                                })
                                .exec()
                                .then(itm => {
                                    if (itm && itm._id) {
                                        new_product['stock_qty'] = 0;
                                        new_product.name = itm.lang[0] ? itm.lang[0].content.name : itm.name;
                                        new_product.authors = itm.author;
                                        new_product.product_id = {
                                            _id: itm._id,
                                            seo_url: itm.seo_url,
                                            import_id: itm.import_id
                                        }
                                        new_product.site_link = `https://www.boibazar.com/book/${itm.seo_url}`;
                                        new_product.publisher = {
                                            _id: itm.publisher,
                                            name: itm.accessories.publisher_bn.name
                                        };
                                        resolve(new_product)
                                    } else {
                                        new_product['stock_qty'] = 0;
                                        resolve(new_product)
                                    }
                                })
                        }
                    })
                    .catch(err => {
                        new_product['stock_qty'] = 0;
                        resolve(new_product)
                    })
            })
        })
        return Promise.all(new_products)
    }


    router.route('/order/order-summary')
        .post((req, res) => {
            let criteria = req.body;
            let cond = new Object();
            criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
            var lte_date = new Date(criteria.from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);

            cond['order_at'] = {
                $lte: new Date(gte_date),
                $gte: new Date(lte_date)
            }

            let aggArr = [{
                $match: cond
            },
            {
                $project: {
                    year: {
                        $year: "$order_at"
                    },
                    month: {
                        $month: "$order_at"
                    },
                    day: {
                        $dayOfMonth: "$order_at"
                    },
                    current_order_status: "$current_order_status"
                }
            }
            ]

            let groupForDaily = [{
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month",
                        day: "$day",
                        current_order_status: "$current_order_status.status_name"
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month",
                        day: "$_id.day"
                    },
                    order: {
                        $push: {
                            status: "$_id.current_order_status",
                            total: "$count"
                        }
                    },
                    count: {
                        $sum: "$count"
                    }
                }
            }
            ]

            let groupForMonthly = [{
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month",
                        current_order_status: "$current_order_status.status_name"
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month"
                    },
                    order: {
                        $push: {
                            status: "$_id.current_order_status",
                            total: "$count"
                        }
                    },
                    count: {
                        $sum: "$count"
                    }
                }
            }
            ]

            if (criteria.product) {
                aggArr.push(prod_filter);
            }

            if (criteria.is_daily) {
                aggArr = aggArr.concat(groupForDaily);
            } else if (criteria.is_monthly) {
                aggArr = aggArr.concat(groupForMonthly);
            }

            Order.aggregate(aggArr)
                .exec()
                .then(result => {
                    let info = {
                        result: result,
                        duration: getDatesOfRange(lte_date, gte_date)
                    }
                    res.json(info);
                })
                .catch(err => {
                    res.send(err);
                })
        })


    router.route('/order-search/:search_obj')
        .get((req, res) => {
            let params = JSON.parse(req.params.search_obj)
            let itemsPerPage = req.query.itemsPerPage || 10;
            let pageNum = req.query.page_no || 1;
            let req_output = new Object();
            let searchCond = multiSearch(params);
            if (params.status != "All") {
                searchCond['current_order_status.status_name'] = params.status;
                Order.count(searchCond)
                    .then(count => {
                        req_output.count = count;
                        return Order.find(searchCond)
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order;
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })
            } else {
                Order.count(searchCond)
                    .then(count => {
                        req_output.count = count;
                        return Order.find(searchCond)
                            .populate({
                                path: 'carrier'
                            })
                            .populate({
                                path: 'created_by'
                            })
                            .populate({
                                path: 'gift_id'
                            })
                            .populate({
                                path: 'products.product_id',
                                select: 'seo_url current_offer import_id'
                            })
                            .populate({
                                path: 'customer_contact_info.other_contact_history.contact_by',
                                select: 'first_name last_name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.gateway_ref',
                                select: 'name'
                            })
                            .populate({
                                path: 'payment_collection.collection_info.collected_by',
                                select: 'first_name last_name'
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage)
                    })
                    .then(order => {
                        req_output.data = order;
                        res.json(req_output);
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            data: []
                        })
                    })
            }
        })


    function multiSearch(params) {
        let cn = '.*' + params.cus_name + '.*';
        let cp = '.*' + params.cus_mobile + '.*';

        var f_date;
        var t_date;

        if (params.from_date.length > 1) {
            f_date = params.from_date ? new Date(params.from_date) : new Date();
            f_date.setHours(0, 0, 0, 0);
        }
        if (params.to_date.length > 1) {
            t_date = params.to_date ? new Date(params.to_date) : new Date();
            t_date.setHours(23, 59, 59, 999);
        }

        if (params.order_no.length > 0 && params.from_date.length < 1 && params.to_date.length < 1) {
            return {
                "order_no": parseInt(params.order_no)
            }
        } else if (params.cus_name.length > 0 || params.cus_mobile.length > 0) {
            if (params.from_date.length > 1 && params.to_date.length > 1) {
                return {
                    "delivery_address.contact_name": {
                        $regex: cn,
                        $options: 'i'
                    },
                    "delivery_address.phone_number": {
                        $regex: cp,
                        $options: 'i'
                    },
                    "order_at": {
                        $gte: new Date(f_date),
                        $lte: new Date(t_date)
                    }
                }
            } else if (params.from_date.length > 1 && params.to_date.length < 1) {
                return {
                    "delivery_address.contact_name": {
                        $regex: cn,
                        $options: 'i'
                    },
                    "delivery_address.phone_number": {
                        $regex: cp,
                        $options: 'i'
                    },
                    "order_at": {
                        $gte: new Date(f_date)
                    }
                }
            } else if (params.from_date.length < 1 && params.to_date.length > 1) {
                return {
                    "delivery_address.contact_name": {
                        $regex: cn,
                        $options: 'i'
                    },
                    "delivery_address.phone_number": {
                        $regex: cp,
                        $options: 'i'
                    },
                    "order_at": {
                        $lte: new Date(t_date)
                    }
                }
            } else if (params.from_date.length < 1 && params.to_date.length < 1) {
                return {
                    "delivery_address.contact_name": {
                        $regex: cn,
                        $options: 'i'
                    },
                    "delivery_address.phone_number": {
                        $regex: cp,
                        $options: 'i'
                    }
                }
            }
        } else if (params.cus_name.length < 1 && params.cus_mobile.length < 1) {
            if (params.from_date.length > 1 && params.to_date.length > 1) {
                return {
                    "order_at": {
                        $gte: new Date(f_date),
                        $lte: new Date(t_date)
                    }
                }

            } else if (params.from_date.length > 1 && params.to_date.length < 1) {
                return {
                    "order_at": {
                        $gte: new Date(f_date)
                    }
                }

            } else if (params.from_date.length < 1 && params.to_date.length > 1) {
                return {
                    "order_at": {
                        $lte: new Date(t_date)
                    }
                }
            } else {
                return {}
            }
        } else
            return {};
    }

}