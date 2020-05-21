import PaymentCollection from '../../models/payment.collection.model';
import Order from '../../models/order.model';
import Transaction from '../../models/transaction.model';
import { getDateOfThirtyDayAgo } from './admin-api.service';
import mongoose from 'mongoose'

export default (app, router, auth) => {


    var granBkashUrl, refundBkashUrl;
    var auth_token;

    //Unused
    var bkashLive = true;


    if (bkashLive != false) {
        var app_key = "12m7hbb6gucccadgn7oref7lc7";
        var app_secret = "16elakqlbt7m2ovb3od4eie0bn4de4tv1p322a1p6rgl9430v94h";
        var username = "BOIBAZAR";
        var password = "b0!B@z@rDo1co9";

        granBkashUrl = "https://checkout.pay.bka.sh/v1.0.0-beta/checkout/token/grant";
        refundBkashUrl = "https://checkout.pay.bka.sh/v1.0.0-beta/checkout/payment/refund/";

    } else {
        var app_key = "5tunt4masn6pv2hnvte1sb5n3j";
        var app_secret = "1vggbqd4hqk9g96o9rrrp2jftvek578v7d2bnerim12a87dbrrka";
        var username = "sandboxTestUser";
        var password = "hWD@8vtzw0";

        granBkashUrl =
            "https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/token/grant";

        refundBkashUrl =
            "https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/payment/refund/";
    }


    // var granBkashUrl,createBkashUrl,executeBkashUrl;
    router.route("/bkash/grant-refund").post((req, res) => {
        //console.log(granBkashUrl)
        var trxID = req.body.trx_id;

        var request = require("request");
        var options = {
            method: "POST",
            url: granBkashUrl,

            headers: {
                password: password,
                username: username
            },
            body: {
                app_key: app_key,
                app_secret: app_secret
            },
            json: true
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            auth_token = body.id_token;


            // console.log('trxID: ', trxID)
            // console.log('app_key: ', app_key)
            // console.log('auth_token: ', auth_token)

            // console.log('refundBkashUrl + trxID')
            // console.log(refundBkashUrl + trxID)

            //Refund Payment
            var options = {
                method: "POST",
                url: refundBkashUrl + trxID,
                headers: {
                    "x-app-key": app_key,
                    authorization: auth_token
                },
                body: {
                    amount: req.body.currency_amount,
                    currency: req.body.currency
                },
                json: true
            };

            request(options, function (error, response, body) {
                // console.log(response);

                if (error) throw new Error(error);

                res.json(response);


                //IF successful update Order and Transaction collection 

                //updateTransaction(orders)
            });
        });
    });

    router.route('/payment-collection/collectable-orders/:id')
        .get(auth, (req, res) => {
            Order.aggregate([{
                $match: {
                    carrier: mongoose.Types.ObjectId(req.params.id),
                    'current_order_status.status_name': { $in: ['Delivered', 'Returned'] },
                    $or: [
                        { has_collection_done: { $exists: false } },
                        { has_collection_done: false }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$payment_collection.collection_info",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "paymentgateways",
                    localField: "payment_collection.collection_info.gateway_ref",
                    foreignField: "_id",
                    as: "payment_collection.collection_info.gateway_ref"
                }
            },
            {
                $unwind: {
                    path: "$payment_collection.collection_info.gateway_ref",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    order_no: { $first: "$order_no" },
                    total_price: { $first: "$total_price" },
                    sales_discount: { $first: "$discount" },
                    packing_cost: { $first: "$wrapping_charge" },
                    return_amount: { $first: "$returned_items_price" },
                    delivery_charge: { $first: "$delivery_charge" },
                    courier_charge: { $first: "$payment_collection.carrier_cost" },
                    return_charge: { $first: "$returned_cost" },
                    order_status: { $first: "$current_order_status.status_name" },
                    // collection_charge: { $first: "$payment_collection.transaction_cost" },
                    collection_info: { $push: "$payment_collection.collection_info" }
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


    router.route('/payment-collection/upload-excel')
        .post(auth, (req, res) => {
            checkOrder(req.body.collection)
                .then(validates_collections => {
                    PaymentCollection.findOne({ courier_id: req.body.courier })
                        .sort({ _id: -1 })
                        .limit(1)
                        .exec()
                        .then(lastCollection => {
                            let last_balance = 0;
                            if (lastCollection && lastCollection._id) {
                                last_balance = lastCollection.balance
                            }
                            console.log(last_balance);
                            return uodateOrder(validates_collections, req.body.courier, last_balance, req)
                        })
                        .then(collection => {
                            return PaymentCollection.insertMany(collection)
                        })
                        .then(collections => {
                            res.json({ success: true, collected: collections.length });
                        })
                        .catch(err => {
                            res.json({ success: false, message: "Internal server error.", err: err });
                        })

                })
                .catch(err => {
                    res.json(err);
                })

        })

    function checkOrder(col_data) {
        let collections = col_data.map(col => {
            return new Promise((resolve, reject) => {
                Order.findOne({
                    order_no: col.order_no,
                })
                    .exec()
                    .then(ordr => {
                        if (ordr && ordr._id && !ordr.has_collection_done) {
                            col.order_object = ordr
                            resolve(col)
                        } else if (ordr && ordr._id && ordr.has_collection_done) {
                            reject({ success: false, already_collected: true, message: `${col.order_no} has been already Collected.` });
                        } else {
                            reject({ success: false, invalid_order: true, message: `${col.order_no} is an invalid order` });
                        }
                    })
                    .catch(err => {
                        console.log("Rejected for what");
                        reject({ success: false, message: "Something went wrong, try again later.", err });
                    })
            })
        })
        return Promise.all(collections);
    }

    function uodateOrder(col_data, courier, last_balance, req) {
        let collections = col_data.map(col => {
            return new Promise((resolve, reject) => {
                let ordr = col.order_object;
                col.deposit_date = new Date(col.deposit_date);
                col.order_id = ordr._id;
                col.order_date = ordr.order_at;
                col.courier_id = courier;
                col.balance = last_balance + col.balance;
                ordr.has_collection_done = true;
                ordr.payment_collection.carrier_cost = courier == '5adebee21ba7c84ec136145d' || courier == '5ba8694706c5064bef76f573' ? col.courier_charge_in_advance : col.courier_charge;
                ordr.payment_collection.collection_charge = col.collection_charge;
                if (ordr.current_order_status.status_name == "Returned") {
                    ordr.payment_collection.total_paid = (col.bkash + col.ssl + col.cash + col.deposit_to_bank + col.wallet_pay);
                } else {
                    ordr.payment_collection.total_paid = (col.bkash + col.ssl + col.cash + col.deposit_to_bank + col.courier_charge + col.collection_charge + col.wallet_pay);
                }
                if (col.deposit_to_bank > 0) {
                    ordr.payment_collection.collection_info.push({
                        collected_amount: col.deposit_to_bank,
                        collected_at: new Date(),
                        gateway_ref: "5ce23d93894ce5dff5287a20",
                        collected_by: req.user._id
                    });
                }
                if (col.cash > 0) {
                    ordr.payment_collection.collection_info.push({
                        collected_amount: col.cash,
                        collected_at: new Date(),
                        gateway_ref: "5ce23d93894ce5dff5287a20",
                        collected_by: req.user._id
                    });
                }
                ordr.transaction_cost = (col.ssl_charge + col.bkash_charge + col.collection_charge)
                ordr.save(err => {
                    if (err)
                        reject({ success: false, message: "Something went wrong, try again later.", err });
                    else
                        resolve(col)
                })
            })
        })
        return Promise.all(collections);
    }

    router.route('/payment-collect')
        .post(auth, (req, res) => {
            updateOrders(req)
                .then(ords => {
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


    router.route('/payment-collection/update-transaction-for-carrier-payment')
        .post((req, res) => {
            let orders = req.body.orders;
            updateCarrierPayment(orders).then(data => {
                res.json(data);
            })
                .catch(err => {
                    res.send(err);
                })

        })

    router.route('/payment-collection/report')
        .post((req, res) => {
            let lte_date = req.body.start_date ? new Date(req.body.start_date) : new Date(getDateOfThirtyDayAgo());
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = req.body.end_date ? new Date(req.body.end_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);

            PaymentCollection.aggregate([{
                $match: {
                    order_date: {
                        $lte: new Date(gte_date),
                        $gte: new Date(lte_date)
                    },
                }
            },
            {
                $group: {
                    _id: "$courier_id",
                    challan_amount: { $sum: "$challan_amount" },
                    collection_charge: { $sum: "$collection_charge" },
                    courier_charge: { $sum: "$courier_charge" },
                    delivery_charge: { $sum: "$delivery_charge" },
                    net_sales_amount: { $sum: "$net_sales_amount" },
                    deposit_to_bank: { $sum: "$deposit_to_bank" },
                    packing_cost: { $sum: "$packing_cost" },
                    total_amount: { $sum: "$total_amount" },
                    promotion: { $sum: "$promotion" },
                    return_amount: { $sum: "$return_amount" },
                    return_charge: { $sum: "$return_charge" },
                    sales_discount: { $sum: "$sales_discount" },
                    bkash: { $sum: "$bkash" },
                    bkash_charge: { $sum: "$bkash_charge" },
                    ssl: { $sum: "$ssl" },
                    wallet_pay: { $sum: "$wallet_pay" },
                    cash: { $sum: "$cash" },
                    ssl_charge: { $sum: "$ssl_charge" },
                    balance: { $last: "$balance" }
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
                    courier_name: "$carrier.name",
                    courier_code: "$carrier.code",
                    challan_amount: "$challan_amount",
                    sales_discount: "$sales_discount",
                    return_amount: "$return_amount",
                    net_sales_amount: "$net_sales_amount",
                    packing_cost: "$packing_cost",
                    delivery_charge: "$delivery_charge",
                    bkash: "$bkash",
                    ssl: "$ssl",
                    wallet_pay: "$wallet_pay",
                    deposit_to_bank: "$deposit_to_bank",
                    cash: "$cash",
                    ssl_charge: "$ssl_charge",
                    bkash_charge: "$bkash_charge",
                    return_charge: "$return_charge",
                    collection_charge: "$collection_charge",
                    total_collection: { $sum: ["$bkash", "$ssl", "$deposit_to_bank", "$cash"] },
                    total_charge: { $sum: ["$bkash_charge", "$ssl_charge", "$return_charge", "$collection_charge"] },
                    promotion: "$promotion",
                    balance: "$balance"
                }
            }
            ])
                .exec()
                .then(orders => {
                    res.json({ success: true, data: orders, data_of: { start_date: new Date(lte_date), end_date: new Date(gte_date) } });
                })
                .catch(err => {
                    res.json({ success: false, err: err, message: "Internal server error." });
                })
        })

    router.route('/payment-collection/get-as-excel')
        .get((req, res) => {
            Order.aggregate([
                // {
                //     $match: {
                //         'performed_order_statuses.status_name': 'Delivered'
                //     } 
                // },
                {
                    $lookup: {
                        from: "ordercarriers",
                        localField: 'carrier',
                        foreignField: '_id',
                        as: 'carrier'
                    }
                },
                {
                    $project: {
                        order_no: "$order_no",
                        mobile_no: "$delivery_address.phone_number",
                        total_book: "$total_book",
                        order_value: "$payable_amount",
                        carrier: { $arrayElemAt: ["$carrier.name", 0] },
                        delivery_charge: "$delivery_charge",
                        carrier_charge: "$payment_collection.carrier_cost",
                        order_at: "$order_at",
                        status_name: "$current_order_status.status_name",
                        gateway_ref: { $arrayElemAt: ['$payment_collection.collection_info.gateway_ref', 0] },
                        confirm: {
                            $filter: {
                                input: '$performed_order_statuses',
                                as: 'status',
                                cond: { $eq: ['$$status.status_name', 'Confirmed'] }
                            }
                        },
                        inshipment: {
                            $filter: {
                                input: '$performed_order_statuses',
                                as: 'status',
                                cond: { $eq: ['$$status.status_name', 'Inshipment'] }
                            }
                        },
                        delivered: {
                            $filter: {
                                input: '$performed_order_statuses',
                                as: 'status',
                                cond: { $eq: ['$$status.status_name', 'Delivered'] }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "paymentgateways",
                        localField: 'gateway_ref',
                        foreignField: '_id',
                        as: 'gateway'
                    }
                },
                {
                    $project: {
                        order_no: "$order_no",
                        mobile_no: "$mobile_no",
                        total_book: "$total_book",
                        order_value: "$order_value",
                        delivery_charge: "$delivery_charge",
                        carrier_charge: "$carrier_charge",
                        carrier: "$carrier",
                        order_at: "$order_at",
                        status_name: "$status_name",
                        gateway_ref: { $arrayElemAt: ['$gateway.name', 0] },
                        confirm_at: { $arrayElemAt: ['$confirm.updated_at', 0] },
                        inshipment_at: { $arrayElemAt: ['$inshipment.updated_at', 0] },
                        delivered_at: { $arrayElemAt: ['$delivered.updated_at', 0] },
                    }
                }
            ])
                .exec()
                .then(order => {
                    var fs = require('fs');
                    fs.writeFile('/boibazar/logs/payment_collection.json', JSON.stringify(order), 'utf8', (err) => {
                        console.log(err)
                    });
                    res.json({});
                })
                .catch(err => {
                    res.json(err)
                })
        })



    function updateCarrierPayment(orders) {
        let updatedTransaction = orders.map(order => {
            return new Promise((resolve, reject) => {
                Transaction.findOne({
                    orders: order._id
                })
                    .exec()
                    .then(transac => {
                        if (transac && transac._id) {
                            let updateHeads = transac.transaction_head.map(tran => {
                                if (tran.head_id.toString() == order.carrier.toString()) {
                                    tran.total_carrier_charge += order.carrier_cost;
                                    let ords = tran.order.map(ord => {
                                        if (ord.order_no == order.order_no) {
                                            ord.carrier_charge += order.carrier_cost;
                                            return ord;
                                        } else {
                                            return ord;
                                        }
                                    })
                                    tran.order = ords;
                                    return tran;
                                } else {
                                    return tran;
                                }
                            })
                            transac.transaction_head = updateHeads;
                        }
                        transac.save(err => {
                            if (!err)
                                resolve(transac);
                            else
                                reject(err);
                        })
                    })
            })
        })
        return Promise.all(updatedTransaction);
    }

    function updateOrders(req) {
        let updatedOrders = req.body.payment_info.map(item => {
            return new Promise((resolve, reject) => {
                Order.findOne({
                    _id: item._id
                })
                    .exec()
                    .then(order => {
                        let obj = {
                            collected_amount: item.collected_amount,
                            transaction_id: req.body.transaction_id,
                            transaction_comment: req.body.transaction_comment,
                            collected_at: req.body.transaction_date || new Date(),
                            gateway_ref: item.gateway_ref,
                            collected_by: req.user._id
                        }
                        let info_arr = order.payment_collection.collection_info;
                        info_arr.push(obj);
                        order.payment_collection = {
                            is_full_collected: item.is_full_collected,
                            transaction_cost: item.transaction_cost ? item.transaction_cost : 0,
                            tax_amount: item.tax_amount ? item.tax_amount : 0,
                            total_paid: item.total_paid,
                            collection_charge: item.collection_charge,
                            carrier_cost: item.carrier_cost,
                            due_amount: item.due_amount,
                            collection_info: info_arr
                        }
                        order.carrier_cost = item.carrier_cost;
                        order.is_paid = item.is_full_collected;
                        return order.save()
                    })
                    .then(ord => {
                        resolve(ord);
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })
        return Promise.all(updatedOrders);
    }

}