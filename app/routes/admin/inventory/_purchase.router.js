import Purchase from '../../../models/inventory-models/purchase.model';
import Products from '../../../models/product.model';
import Order from '../../../models/order.model';

import PurchaseOrder from '../../../models/inventory-models/purchase-order.model';
import { sendSmsToEmployee } from '../text-message.service';

import Stock from '../../../models/inventory-models/stock.model';
import { getDateOfThirtyDayAgo } from './inventory.service';
import { updateOrderBookAvailibilityStatus } from '../order.service';

import {
    stockEntry,
    updateStockSummary,
    getCustomerOrderSummary,
    getPurchaseOrderSummary,
    getPurchaseSummary
} from './inventory.service';
import { getNextSequence } from '../../public/api.service.js';
import { copySync } from 'fs-extra';
const PURCHASE_SEQ_NAME = 'purchase_no';
const PRINT_JOB_SEQ_NUMBER = 'print_job_number';

export default (app, router, auth, logger) => {
    router.route('/purchase-accept')
        .get(auth, logger('purchase'), (req, res) => {
            let user = req.user;
            var cond = {};
            let res_result = new Object();
            let pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1
            Purchase.count(cond)
                .exec()
                .then(count => {
                    res_result.count = count;
                    return getPurchase(cond, pageNum)
                })
                .then(data => {
                    res_result.data = data
                    res.json(res_result);
                })
                .catch(err => {
                    req.log.info(err);
                })
        })

    .post(auth, (req, res) => {

        if (req.body.voucher_no) {

            let pORder = new Object();
            let newPurchaseObj = new Object();
            getPurchaseOrder(req.body.voucher_no)
                .then(voucher => {

                    if (voucher.status) {
                        getOrderNo(voucher.order.customer_orders)
                            .then(str => {
                                sendSmsToEmployee({
                                    designation: 'dispatch_manager',
                                    text: `Order ${str} ready for dispatch. Please take necessity steps immediately.`,
                                    sms_sent_for: 'order-purchase-requisition'
                                });
                            })
                        pORder = voucher.order;
                        pORder.general_purchase = false;
                        pORder.purchase_date = new Date();

                        return getNextSequence(PURCHASE_SEQ_NAME)
                    } else {
                        res.json(voucher);
                        return false;
                    }
                })
                .then(seq => {
                    return savePurchase(req, seq, pORder)
                })
                .then(resp => {
                    newPurchaseObj = resp;
                    return PurchaseOrder.update({
                        _id: pORder._id
                    }, {
                        $set: {
                            collected_at: new Date(),
                            orderd_products: req.body.updated_purchase_order_item,
                            status: {
                                is_partialy_processed: req.body.is_partialy_processed,
                                is_completed: req.body.is_completed,
                                is_in_process: req.body.is_in_process,
                            }
                        }
                    })
                })
                .then(update => {
                    updateProductHistory(req.body.items);
                    res.json(newPurchaseObj);
                })
                .catch(err => {
                    res.send(err);
                })
        } else {
            getNextSequence(PURCHASE_SEQ_NAME)
                .then(seq => {
                    return savePurchase(req, seq, { general_purchase: true })
                        .then(resp => {
                            res.json(resp);
                        }).catch(err => {
                            res.send(err);
                        })
                })
        }
    });


    function updateProductHistory(products) {

        let updates = products.map(product => {
            return new Promise((resolve, reject) => {
                let rate = product.rate;
                let weight = product.weight;
                let product_id = product.product_id;

                console.log(weight)

                Products.update({
                        _id: product_id
                    }, {
                        $set: {
                            'purchase_history.price': rate,
                            'purchase_history.weight': weight,
                        }
                    })
                    .exec()
                    .then(res => {
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err)
                    })

            })
        })
        return Promise.all(updates);
    }

    router.route('/purchase/partial/pending-books')
        .post(auth, (req, res) => {
            getNextSequence(PURCHASE_SEQ_NAME)
                .then(seq => {
                    return savePurchase(req, seq, { general_purchase: true })
                        .then(resp => {
                            res.json(resp);
                        }).catch(err => {
                            res.send(err);
                        })
                })
        })

    function getOrderNo(orderIds) {

        return new Promise((resolve, reject) => {
            Order.find({ _id: { $in: orderIds } })
                .exec()
                .then(ordrs => {
                    let orders_no = ordrs.map(ordr => { return ordr.order_no });
                    let order_no_str = orders_no.join();
                    let is_is_or_are = ordrs.length > 1 ? ' are' : ' is';
                    order_no_str = order_no_str + ' ' + is_is_or_are;
                    resolve(order_no_str);
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    function getPurchaseOrder(order_no) {
        return new Promise((resolve, reject) => {
            PurchaseOrder.findOne({ order_no: order_no })
                .exec()
                .then(order => {
                    if (order && order._id) {
                        if (order.status.is_completed) {
                            resolve({ status: false, message: "Already purchased this order!" })
                        } else {
                            resolve({ status: true, order: order })
                        }
                    } else {
                        resolve({ status: false, message: "No purchase order found!" })
                    }
                })
        })
    }

    function savePurchase(req, purchase_no, order) {
        return new Promise((resolve, reject) => {
            Purchase.create({
                purchase_no: purchase_no,
                order_no: order.order_no,
                purchase_order: order._id,
                general_purchase: order.general_purchase,
                purchase_date: order.purchase_date,
                total_book: req.body.total_book,
                remark: req.body.remark,
                customer_orders: order.customer_orders,
                courier_charge: req.body.courier_charge,
                convenience: req.body.convenience,
                net_amount: req.body.net_amount,
                purchase_cost: req.body.purchase_cost,
                purchase_mode: req.body.purchase_mode,
                products: req.body.items,
                purchase_by: req.user._id,
                created_by: req.user._id,
                created_at: req.prior_date ? req.prior_date : new Date(),
                updated_by: req.user._id,
                updated_at: new Date()
            }, (err, purchase) => {
                if (err) {
                    reject(err);
                } else {
                    let purchaseItems = purchase.products.map(prod => {
                        return {
                            product_id: prod.product_id,
                            product_name: prod.product_name,
                            purchase_id: purchase._id,
                            purchase_qty: prod.quantity,
                            supplier: prod.supplier,
                            purchase_rate: prod.rate,
                            purchase_cost: prod.price,
                            created_at: new Date(),
                            created_by: purchase.created_by
                        }

                    })
                    stockEntry(purchaseItems)
                        .then(saved => {
                            return updateStockSummary(purchaseItems, 'total_purchase', 'purchase_qty')
                        })
                        .then(updt => {
                            updateOrderBookAvailibilityStatus();
                            resolve(purchase);
                        })
                        .catch(err => {
                            //console.log(err);
                            reject(err);
                        })
                }
            });
        })
    }




    router.route('/purchase/search')
        .post(auth, (req, res) => {
            let criteria = req.body;
            let result = new Object();
            let cond = new Object();
            let pageNum = req.body.pageNum ? parseInt(req.body.pageNum) : 1;

            if (criteria.from_date) {
                var lte_date = new Date(criteria.from_date);
                lte_date.setHours(0, 0, 0, 0);
                var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
                gte_date.setHours(23, 59, 59, 999);

                cond['purchase_date'] = {
                    $lte: new Date(gte_date),
                    $gte: new Date(lte_date)
                }
            }

            if (criteria.mode && criteria.mode != 'All') {
                cond['purchase_mode'] = criteria.mode
            }

            if (criteria.invoice_no) {
                cond['purchase_no'] = criteria.invoice_no;
            }

            if (criteria.purchase_type && criteria.purchase_type != 'All') {
                cond['general_purchase'] = criteria.purchase_type == 'general';
            }

            Purchase.count(cond)
                .exec()
                .then(count => {
                    result.count = count;
                    return getPurchase(cond, pageNum)
                })
                .then(data => {
                    result.success = true;
                    result.data = data
                    res.json(result);
                })
                .catch(err => {
                    res.json({ success: false, err: err })
                })
        })


    router.route('/purchase-accept/:id')
        .get((req, res) => {
            Purchase.findOne({ "_id": req.params.id })
                .exec((err, purchase) => {
                    if (err)
                    //console.log(err)
                        res.json(purchase);
                })
        })

    .put(auth, (req, res) => {
        let order = new Object();
        let purchase = new Object();
        Purchase.findOne({ "_id": req.params.id })
            .exec()
            .then(prch => {
                if (prch && prch._id) {
                    purchase = prch;
                    order = {
                        order_no: purchase.order_no,
                        _id: purchase.purchase_order,
                        general_purchase: purchase.general_purchase,
                        purchase_date: req.body.updated_at,
                        customer_orders: req.body.customer_orders
                    }
                    req.prior_date = purchase.created_at;
                    return deletePurchaseStockHistory(purchase._id, purchase.products, purchase.created_by)
                }
            })
            .then(id => {
                return Purchase.remove({ _id: purchase._id })
            })
            .then(rmvd => {
                return savePurchase(req, purchase.purchase_no, order)
            })
            .then(resp => {
                res.json(resp);
            }).catch(err => {
                res.send(err);
            })
    })

    router.route('/purchase-accept/product-purchase-history/:id')
        .put(auth, (req, res) => {

            let purchaseHistory = {
                price: req.body.item_rate,
                weight: req.body.item_weight
            }


            Products.update({
                    _id: req.params.id
                }, {
                    $set: {
                        purchase_history: purchaseHistory
                    }
                })
                .then(update => {
                    res.json(update)
                })
                .catch(err => {
                    res.json(err)
                })

        })


    router.route('/purchase/search/v1')
        .get((req, res) => {
            var terms = req.query.search;
            let expression = '.*' + terms + '.*';
            let searchConditions = { "name": { $regex: expression, $options: 'i' } };
            Purchase.find(searchConditions)
                .count((err, count) => {
                    return count
                })
                .then(count => {
                    Purchase.find(searchConditions)
                        .limit(10)
                        .exec((err, purchases) => {
                            if (err)
                                res.send(err);
                            else
                                res.json({
                                    'items': purchases,
                                    'count': count
                                });
                        })
                })
                .catch(err => {
                    res.send(err);
                })
        });


    router.route('/purchase/purchase-history')
        .post((req, res) => {
            let criteria = req.body;
            let result = new Object();
            let cond = new Object();
            criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
            var lte_date = new Date(criteria.from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);

            cond['purchase_date'] = {
                $lte: new Date(gte_date),
                $gte: new Date(lte_date)
            }

            if (criteria.mode != 'All') {
                cond['purchase_mode'] = criteria.mode
            }

            var agg = Purchase.aggregate([{
                    $match: cond
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: '$created_by'
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: 'suppliers',
                        localField: 'products.supplier',
                        foreignField: '_id',
                        as: 'products.supplier'
                    }
                },
                {
                    $unwind: '$products.supplier'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.product_id',
                        foreignField: '_id',
                        as: 'products.detail'
                    }
                },
                {
                    $unwind: '$products.detail'
                },
                {
                    $group: {
                        _id: '$purchase_no',
                        books: {
                            $push: {
                                product_id: "$products.product_id",
                                import_id: "$products.detail.import_id",
                                name: '$products.product_name',
                                supplier: '$products.supplier.name',
                                price: { $divide: ['$products.price', '$products.quantity'] },
                                quantity: '$products.quantity',
                                total: '$products.price'
                            }
                        },
                        total_book: { $sum: "$products.quantity" },
                        net_amount: { $first: '$net_amount' },
                        purchase_cost: { $first: '$purchase_cost' },
                        purchase_at: { $first: '$purchase_date' },
                        courier_charge: { $first: '$courier_charge' },
                        convenience: { $first: '$convenience' },
                        general_purchase: { $first: "$general_purchase" },
                        // customer_orders: { $first: "$cOrders" },
                        remark: { $first: "$remark" },
                        purchase_order: { $first: "$purchase_order" },
                        purchased_by: { $first: { $concat: ['$created_by.first_name', ' ', '$created_by.last_name'] } }
                    }
                },
                {
                    $project: {
                        books: "$books",
                        total_book: "$total_book",
                        net_amount: "$net_amount",
                        purchase_cost: "$purchase_cost",
                        purchase_at: "$purchase_at",
                        courier_charge: "$courier_charge",
                        convenience: "$convenience",
                        general_purchase: "$general_purchase",
                        // customer_orders: {
                        //     $map:
                        //     {
                        //         input: "$customer_orders",
                        //         as: "order",
                        //         in: "$$order.order_no"
                        //     }
                        // },
                        remark: "$remark",
                        purchase_order: "$purchase_order",
                        purchased_by: "$purchased_by",
                    }
                },
                {
                    $sort: { purchase_at: -1 }
                }
            ]);
            agg.options = { allowDiskUse: true };
            agg.exec()
                .then((data) => {
                    result = data;
                    return getNextSequence(PRINT_JOB_SEQ_NUMBER)
                })
                .then(seq => {
                    res.json({ success: true, data: result, print_job_number: seq, date_range: { to: gte_date, from: lte_date } });
                })
                .catch(err => {
                    result = [];
                    res.json({ success: false, data: result, err: err })
                })
        })

    router.route('/inventory/sales-summary')
        .post((req, res) => {
            let data = new Object();
            getCustomerOrderSummary(req.body)
                .then(cOrder => {
                    data.duration = cOrder.duration;
                    data.customer_orders = cOrder.result;
                    return getPurchaseOrderSummary(req.body)
                })
                .then(pOrder => {
                    data.purchase_orders = pOrder;
                    return getPurchaseSummary(req.body)
                })
                .then(purchase => {
                    data.purchase = purchase;
                    res.json(data);
                })
                .catch(err => {
                    res.send(err);
                })
        })

    router.route('/stock/stock-analysis')
        .post((req, res) => {
            // //console.log(req.body.items);
            if (req.body.items && req.body.items != '') {
                var findQuery = Purchase.find({ items: { $elemMatch: { item_id: { $in: req.body.items } } } })
            } else {
                var findQuery = Purchase.find()
            }

            if (req.body.supplier_id && req.body.supplier_id != '') {
                findQuery.where('supplier_id').equals(req.body.supplier_id)
            }


            if (req.body.from_date && req.body.from_date != '' && req.body.to_date && req.body.to_date != '') {
                findQuery.where('purchase_date').lte(req.body.from_date).gte(req.body.to_date)
            }
            findQuery.populate({ path: 'supplier_id', select: 'name' })
            findQuery.exec()
                .then((result, err) => {
                    if (!err && result && Array.isArray(result) && result.length > 0) {
                        res.json({ status: true, data: result });
                    } else {
                        res.json({ status: false, message: "No data found with this credentials" })
                    }
                })
        })


    function getPurchase(condition, pageNum) {
        return new Promise((resolve, reject) => {
            Purchase.find(condition)
                .populate({ path: 'products.authors_id', select: 'name' })
                .populate({ path: 'products.product_id', select: 'name import_id' })
                .populate({ path: 'products.publisher_id', select: 'name' })
                .populate({ path: 'products.supplier', select: 'name' })
                .populate({ path: 'created_by', select: 'first_name' })
                .skip(15 * (pageNum - 1))
                .limit(15)
                .sort({ purchase_date: -1 })
                .exec()
                .then(purchase => {
                    resolve(purchase);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }



    function deletePurchaseStockHistory(id, products, created_by) {
        return new Promise((resolve, reject) => {
            Stock.remove({ purchase_id: id })
                .exec()
                .then(rmv => {
                    let items = products.map(prod => {
                        return {
                            product_id: prod.product_id,
                            purchase_qty: -prod.quantity,
                            purchase_rate: prod.rate,
                            created_by: created_by
                        }
                    })
                    return updateStockSummary(items, 'total_purchase', 'purchase_qty')
                })
                .then(updt => {
                    updateOrderBookAvailibilityStatus();
                    resolve(updt);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
}