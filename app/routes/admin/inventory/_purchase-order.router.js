import PurchaseOrder from '../../../models/inventory-models/purchase-order.model';
import {
    sendSmsToEmployee
} from '../text-message.service';

import Order from '../../../models/order.model';
import Product from '../../../models/product.model';
import { getDateDayAgo } from './inventory.service';
import {
    getNextSequence
} from '../../public/api.service.js';
const PURCHASE_ORDER_SEQ_NAME = 'purchase_order_no';
const PRINT_JOB_SEQ_NUMBER = 'print_job_number';


export default (app, router, auth, isPermitted) => {
    router.route('/purchase-order')
        .get((req, res) => {



            let filter = new Object();
            var pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
            let result = new Object();
            if (req.query.status && req.query.status == 'pending') {
                filter['status.is_in_process'] = false;
                filter['status.is_completed'] = false;
            } else if (req.query.status && req.query.status == 'partial') {
                filter['status.is_partialy_processed'] = true;
            } else if (req.query.status && req.query.status == 'completed') {
                filter['status.is_in_process'] = false;
                filter['status.is_completed'] = true;
            } else {
                filter = {}
            }


            PurchaseOrder.count(filter)
                .exec()
                .then(count => {
                    result.count = count;
                    return PurchaseOrder.find(filter)
                        .populate({
                            path: 'orderd_products.supplier',
                            select: 'name address area',
                            populate: {
                                path: 'area',
                                select: 'name'
                            }
                        })
                        .populate({
                            path: 'orderd_products.authors_id',
                            select: 'name'
                        })
                        .populate({
                            path: 'orderd_products.publisher_id',
                            select: 'name lang'
                        })
                        .populate({
                            path: 'order_assign_to',
                            select: 'name employee_id phone'
                        })
                        .populate({
                            path: 'created_by',
                            select: 'first_name'
                        })
                        .sort({
                            order_no: -1
                        })
                        .skip((pageNum - 1) * 10)
                        .limit(10)
                })
                .then(order => {
                    result.data = order;
                    res.json(result)
                })
                .catch(err => {
                    //console.log(err);
                    res.json({
                        count: 0,
                        data: []
                    })
                })
        })

    .post(auth, (req, res) => {
        getNextSequence(PURCHASE_ORDER_SEQ_NAME)
            .then(seq => {
                PurchaseOrder.create({
                    order_no: seq,
                    status: req.body.status,
                    total_book: req.body.total_book,
                    customer_orders: req.body.customer_orders,
                    orderd_products: req.body.orderd_products,
                    total_sell_price: req.body.total_sell_price,
                    order_assign_to: req.body.order_assign_to,
                    created_by: req.user._id,
                    updated_by: req.user._id
                }, (err, pOrder) => {
                    if (err) {
                        res.json({
                            success: false
                        });
                    } else {
                        sendSmsToEmployee({
                            designation: 'sourching_manager',
                            text: `Purchase requisition ${pOrder.order_no} has been entrusted to you. Please take necessity steps for this order immediately.`,
                            sms_sent_for: 'order-purchase-requisition'
                        });
                        updateCOrderOnly(req.body.orderd_products, true)
                            .then(updateRes => {
                                res.json({
                                    success: true,
                                    order: pOrder
                                });
                            })
                    }
                });
            })
    });

    router.route('/purchase-order/pending/book-list')
        .post(auth, (req, res) => {
            let criteria = req.body;
            let cond = new Object();
            criteria.from_date = criteria.from_date ? criteria.from_date : getDateDayAgo(7);
            var lte_date = new Date(criteria.from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);

            cond = {
                'status.is_partialy_processed': true,
                'created_at': {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }

            PurchaseOrder.aggregate([{
                        $match: cond
                    },
                    {
                        $unwind: "$orderd_products"
                    },
                    {
                        $project: {
                            orderd_products: "$orderd_products",
                            required_quantity: { $subtract: ["$orderd_products.quantity", "$orderd_products.pur_quantity"] },
                            order_no: "$order_no",
                        }
                    },
                    {
                        $match: {
                            required_quantity: { $gt: 0 }
                        }
                    },
                    {
                        $group: {
                            _id: "$orderd_products.product_id",
                            required_quantity: { $sum: "$required_quantity" },
                            last_pprice: { $last: "$orderd_products.purchase_price" },
                            last_psupplier: { $last: "$orderd_products.supplier" },
                            order_no: { $push: "$order_no" },
                            order_id: { $push: "$_id" }
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "_id",
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
                            localField: "last_psupplier",
                            foreignField: "_id",
                            as: "supplier"
                        }
                    },
                    {
                        $project: {
                            book_name: { $arrayElemAt: ["$product.lang.content.name", 0] },
                            import_id: "$product.import_id",
                            publisher: "$product.accessories.publisher_bn.name",
                            required_quantity: "$required_quantity",
                            last_pprice: "$last_pprice",
                            supplier: { $arrayElemAt: ["$supplier", 0] },
                            order_no: "$order_no",
                            order_id: "$order_id"
                        }
                    }

                ])
                .exec()
                .then(result => {
                    res.json({ success: true, data: result, date: { from: lte_date, to: gte_date } });
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

    router.route('/purchase-order/selected-book/:id')
        .get((req, res) => {
            PurchaseOrder.find({
                    'status.is_completed': false,
                    'orderd_products.product_id': req.params.id
                })
                .populate({
                    path: 'orderd_products.supplier',
                    select: 'name address area',
                    populate: {
                        path: 'area',
                        select: 'name'
                    }
                })
                .populate({
                    path: 'orderd_products.authors_id',
                    select: 'name'
                })
                .populate({
                    path: 'orderd_products.publisher_id',
                    select: 'name lang'
                })
                .populate({
                    path: 'order_assign_to',
                    select: 'name employee_id phone'
                })
                .populate({
                    path: 'created_by',
                    select: 'first_name'
                })
                .exec()
                .then(result => {
                    res.json(result);
                })
        })


    router.route('/purchase-order/:order_no')
        .get((req, res) => {
            PurchaseOrder.findOne({
                    order_no: req.params.order_no
                })
                .populate({
                    path: 'orderd_products.authors_id',
                    select: 'name'
                })
                .populate({
                    path: 'orderd_products.publisher_id',
                    select: 'name'
                })
                .populate({
                    path: 'orderd_products.supplier',
                    select: 'name address'
                })
                .populate({
                    path: 'orderd_products.product_id',
                    select: 'purchase_history'
                })
                .exec((err, order) => {
                    if (err) {
                        res.send(err)
                    } else {
                        if (order && order._id) {
                            if (order.status.is_in_process) {
                                res.json({
                                    found: true,
                                    order: order
                                })
                            } else {
                                res.json({
                                    found: false,
                                    message: "Already purchased this order"
                                })
                            }
                        } else {
                            res.json({
                                found: false,
                                message: "Order Not Found"
                            })
                        }
                    }

                })
        })

    router.route('/purchase-order/order-detail/:id')
        .get((req, res) => {
            PurchaseOrder.findOne({
                    _id: req.params.id
                })
                .select({
                    customer_orders: 1
                })
                .populate({
                    path: 'customer_orders',
                    select: 'order_no products'
                })
                .exec((err, order) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json(order)
                    }
                })
        })

    router.route('/purchase-order/to-update/:id')
        .get((req, res) => {
            PurchaseOrder.findOne({
                    _id: req.params.id
                })
                .populate({
                    path: 'customer_orders'
                })
                .populate({
                    path: 'order_assign_to',
                    select: 'name employee_id'
                })
                .populate({
                    path: 'orderd_products.authors_id',
                    select: 'name'
                })
                .populate({
                    path: 'orderd_products.publisher_id',
                    select: 'name'
                })
                .populate({
                    path: 'orderd_products.supplier',
                    select: 'name address'
                })
                .exec((err, order) => {
                    if (err) {
                        res.send(err)
                    } else {
                        if (order && order._id) {
                            if (order.status.is_in_process) {
                                res.json({
                                    found: true,
                                    order: order
                                })
                            } else {
                                res.json({
                                    found: false,
                                    message: "Already purchased this order"
                                })
                            }
                        } else {
                            res.json({
                                found: false,
                                message: "Order Not Found"
                            })
                        }
                    }

                })
        })
        .put(auth, (req, res) => {
            PurchaseOrder.findOne({
                    _id: req.params.id
                })
                .exec((err, order) => {
                    if (err) {
                        res.send(err)
                    } else {
                        if (order && order._id) {
                            order.status = req.body.status;
                            order.customer_orders = req.body.customer_orders;
                            order.orderd_products = req.body.orderd_products;
                            order.total_sell_price = req.body.total_sell_price;
                            order.order_assign_to = req.body.order_assign_to;
                            order.total_book = req.body.total_book;
                            order.updated_by = req.user._id;
                            order.updated_at = new Date();
                            order.save(err => {
                                if (!err) {
                                    updateCOrderOnly(order.customer_orders, true)
                                        .then(updateRes => {
                                            if (req.body.removed_cus_orders) {
                                                updateCOrderOnly(req.body.removed_cus_orders, false)
                                                    .then(rejt => {
                                                        res.json({
                                                            success: true,
                                                            order: order
                                                        });
                                                    })
                                            } else {
                                                res.json({
                                                    success: true,
                                                    order: order
                                                });
                                            }
                                        })
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Update Failed.Internal error"
                                    })
                                }
                            })
                        } else {
                            res.json({
                                success: false,
                                message: "Update Failed.Order Not Found"
                            })
                        }
                    }
                })
        })


    router.route('/purchase-order/update-corder')
        .put((req, res) => {
            updateCOrderOnly(req.body.customer_orders, true)
                .then(updateRes => {
                    res.json({
                        success: true,
                        order: updateRes
                    });
                })
        })

    router.route('/purchase-order/report')
        .post((req, res) => {
            let result = new Object();
            let cond = new Object();
            let from_date = req.body.from_date ? req.body.from_date : new Date();
            var lte_date = new Date(from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = req.body.to_date ? new Date(req.body.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);
            cond['status.is_completed'] = true;
            cond['created_at'] = {
                $lte: new Date(gte_date),
                $gte: new Date(lte_date)
            }
            PurchaseOrder.aggregate([{
                        $match: cond
                    },
                    {
                        $lookup: {
                            from: "orders",
                            localField: "customer_orders",
                            foreignField: "_id",
                            as: "customer_orders"
                        }
                    },
                    {
                        $project: {
                            requisitiuon_no: "$order_no",
                            total_sell_price: "$total_sell_price",
                            purchased: "$status.is_completed",
                            created_at: "$created_at",
                            orders: {
                                $map: {
                                    input: "$customer_orders",
                                    as: "order",
                                    in: "$$order.order_no"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            requisitiuon_no: "$requisitiuon_no",
                            total_sell_price: "$total_sell_price",
                            purchased: "$purchased",
                            created_at: "$created_at",
                            orders: {
                                $let: {
                                    vars: {
                                        key: {
                                            $reduce: {
                                                input: "$orders",
                                                initialValue: "",
                                                in: {
                                                    $concat: ["$$value", ", ", {
                                                        $toLower: "$$this"
                                                    }]
                                                }
                                            }
                                        }
                                    },
                                    in: {
                                        $substrCP: ["$$key", 2, {
                                            $strLenCP: "$$key"
                                        }]
                                    }
                                }
                            }
                        }
                    }
                ])
                .exec()
                .then(orders => {
                    result = orders;
                    return getNextSequence(PRINT_JOB_SEQ_NUMBER)
                })
                .then(seq => {
                    res.json({ data: result, print_job_number: seq, date_range: { to: gte_date, from: lte_date } });
                })
        })

    router.route('/purchase-order/update/purchase-status')
        .post(auth, (req, res) => {
            if (req.body.is_out_of_stock || req.body.is_out_of_print) {
                let update = req.body.is_out_of_stock ? { is_out_of_stock: true } : { is_out_of_print: true };
                let field = req.body.is_out_of_stock ? { 'products.$.is_out_of_stock': true, 'products.$.arrives_in_stock': req.body.arrives_in_stock } : { 'products.$.is_out_of_print': true };
                update.updated_by = req.user._id;
                Product.update({
                        _id: req.body.product_id
                    }, {
                        $set: update
                    })
                    .exec()
                    .then(product_updt => {
                        return updateCustomerOrdersOfBook(field, req.body.product_id, req.body.comment, req.user._id)
                    })
                    .then(order_updt => {
                        res.json({ success: true })
                    })
                    .catch(err => {
                        res.json({ success: false, message: "Internal server err.", err: err })
                    })
            } else if (req.body.is_info_delay) {
                updateCustomerOrdersOfBook({ 'products.$.is_info_delay': true, 'products.$.info_delayed': req.body.info_delayed }, req.body.product_id, req.body.comment, req.user._id)
                    .then(order_updt => {
                        res.json({ success: true })
                    })
                    .catch(err => {
                        res.json({ success: false, message: "Internal server err.", err: err })
                    })
            } else {
                res.json({ success: true })
            }
        })

    function updateCustomerOrdersOfBook(updt_data, product_id, comment, user) {
        return new Promise((resolve, reject) => {
            Order.update({
                    'products.product_id': product_id,
                    'current_order_status.status_name': 'Confirmed'
                }, {
                    $set: updt_data,
                    $push: {
                        'customer_contact_info.other_contact_history': {
                            contact_at: new Date(),
                            contact_by: user,
                            contact_note: comment
                        }
                    }
                }, { multi: true })
                .exec()
                .then(updt => {
                    resolve(updt)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    function updateCOrderOnly(products, flag) {
        let updts = products.map(prod => {
            return new Promise((resolve, reject) => {
                Order.update({
                        _id: {
                            $in: prod.orders_id
                        },
                        'products.product_id': prod.product_id
                    }, {
                        $set: {
                            'products.$.purchase_order_created': flag
                        }
                    }, {
                        multi: true
                    })
                    .exec()
                    .then(result => {
                        resolve(result)
                    })
                    .catch(err => {
                        resolve(err)
                    })
            })
        })
        return Promise.all(updts);
    }

}