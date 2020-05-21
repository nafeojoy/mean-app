
import Order from '../../../models/order.model';
import mongoose from 'mongoose';
import { getDateOfThirtyDayAgo, getDatesOfRange } from '../admin-api.service';

const VOUCHER_SEQ_NAME = 'voucher';


export default (app, router, auth, logger) => {

    router.route('/sales/sales-summary')
        .post(auth, (req, res) => {
            let criteria = req.body;
            let cond = new Object();
            cond['current_order_status.status_name'] = "OrderClosed";
            cond['is_paid'] = true;
            criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
            var lte_date = new Date(criteria.from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);

            cond['order_at'] = {
                $lte: new Date(gte_date),
                $gte: new Date(lte_date)
            }

            Order.aggregate([
                {
                    $match: cond
                },
                {
                    $lookup:
                    {
                        from: "ordercarriers",
                        localField: "carrier",
                        foreignField: "_id",
                        as: "carrier"
                    }
                },
                {
                    $unwind: '$carrier'
                },
                {
                    $unwind: '$products'
                },
                {
                    $group: {
                        _id: '$order_no',
                        books: {
                            $push: {
                                name: '$products.name',
                                price: '$products.price',
                                quantity: '$products.quantity',
                                total: { $multiply: ['$products.price', '$products.quantity'] }
                            }
                        },
                        total_price: { $first: '$total_price' },
                        wrapping_charge: { $first: '$wrapping_charge' },
                        delivery_charge: { $first: '$delivery_charge' },
                        discount: { $first: '$discount' },
                        payable_amount: { $first: '$payable_amount' },
                        paid_amount: { $first: '$payment_collection.total_paid' },
                        carrier_cost: { $first: '$payment_collection.carrier_cost' },
                        transaction_cost: { $first: '$payment_collection.transaction_cost' },
                        carrier_name: { $first: '$carrier.name' }
                    }
                }
            ])
                .exec()
                .then(sales => {
                    res.json(sales);
                })
                .catch(err => {
                    res.send(err);
                })
        })

    router.route('/sales/sales-detail/:date')
        .get(auth, (req, res) => {
            var lte_date = new Date(req.params.date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = new Date(req.params.date)
            gte_date.setHours(23, 59, 59, 999);
            Order.aggregate([
                {
                    $match: {
                        order_at: {
                            $lte: new Date(gte_date),
                            $gte: new Date(lte_date)
                        },
                        'current_order_status.status_name': {
                            $in: ["OrderClosed", "Delivered", "Inshipment", "Dispatch", "ReturnRequest", "Confirmed"]
                        }
                    }
                },
                {
                    $project: {
                        order_no: "$order_no",
                        products: "$products",
                        total_book: '$total_book',
                        payment_collection: "$payment_collection",
                        delivery_charge: "$delivery_charge",
                        total_price: "$total_price",
                        payable_amount: "$payable_amount",
                        discount: "$discount",
                        wrapping_charge: "$wrapping_charge"
                    }
                }
            ])
                .exec()
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    res.send(err);
                })
        })

    router.route('/sales/daily-sales-info')
        .post(auth, (req, res) => {
            let criteria = req.body;
            criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
            var lte_date = new Date(criteria.from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);
            Order.aggregate([
                {
                    $match: {
                        order_at: {
                            $lte: new Date(gte_date),
                            $gte: new Date(lte_date)
                        },
                        'current_order_status.status_name': {
                            $in: ["OrderClosed", "Delivered", "Inshipment", "Dispatch", "ReturnRequest", "Confirmed"]
                        }
                    }
                },
                {
                    $project: {
                        order_string_date: "$order_string_date",
                        order_at: "$order_at",
                        total_book: '$total_book',
                        carrier_cost: "$payment_collection.carrier_cost",
                        recieved_amount: '$payment_collection.total_paid',
                        due_amount: '$payment_collection.due_amount',
                        transaction_cost: '$payment_collection.transaction_cost',
                        delivery_charge: "$delivery_charge",
                        total_price: "$total_price",
                        payable_amount: "$payable_amount",
                        discount: "$discount",
                        wrapping_charge: "$wrapping_charge"
                    }
                },
                {
                    $group: {
                        _id: "$order_string_date",
                        order_at: { $first: "$order_at" },
                        total_price: { $sum: "$total_price" },
                        payable_amount: { $sum: "$payable_amount" },
                        carrier_cost: { $sum: "$carrier_cost" },
                        delivery_charge: { $sum: "$delivery_charge" },
                        discount: { $sum: "$discount" },
                        total_book: { $sum: "$total_book" },
                        recieved_amount: { $sum: "$recieved_amount" },
                        due_amount: { $sum: "$due_amount" },
                        transaction_cost: { $sum: "$transaction_cost" },
                        wrapping_charge: { $sum: "$wrapping_charge" },
                        total_order: { $sum: 1 }
                    }
                },
                {
                    $sort: { order_at: 1 }
                }
            ])
                .exec()
                .then(result => {
                    let info = { result: result }
                    res.json(result);
                })
                .catch(err => {
                    res.send(err);
                })
        })

    router.route('/sales/daily-sales')
        .post(auth, (req, res) => {
            let criteria = req.body;
            let cond = new Object();
            cond['$and'] = [
                { "performed_order_statuses.status_name": "Confirmed" },
                { "performed_order_statuses.status_name": { $ne: "Cancelled" } }
            ];

            criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
            var lte_date = new Date(criteria.from_date);
            lte_date.setHours(0, 0, 0, 0);
            var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
            gte_date.setHours(23, 59, 59, 999);

            cond['order_at'] = {
                $lte: new Date(gte_date),
                $gte: new Date(lte_date)
            }

            let aggArr = [
                {
                    $match: cond
                },
                {
                    $project: {
                        year: { $year: "$order_at" },
                        month: { $month: "$order_at" },
                        day: { $dayOfMonth: "$order_at" },
                        order_no: "$order_no",
                        products: "$products",
                        carrier_cost: "$carrier_cost",
                        delivery_charge: "$delivery_charge",
                        discount: "$discount",
                        wrapping_charge: "$wrapping_charge"
                    }
                }
            ]

            let primaryGroupForDaily = [
                {
                    $group: {
                        _id: {
                            year: "$year",
                            month: "$month",
                            day: "$day"
                        },
                        products: {
                            $push: "$products"
                        },
                        carrier_cost: { $sum: "$carrier_cost" },
                        delivery_charge: { $sum: "$delivery_charge" },
                        discount: { $sum: "$discount" },
                        wrapping_charge: { $sum: "$wrapping_charge" },
                        total_order: { $sum: 1 }
                    }
                },
                { $unwind: "$products" },
                { $unwind: "$products" }
            ]

            let secondaryGroupForDaily = {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month",
                        day: "$_id.day"
                    },
                    order_price: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                    order_book: { $sum: "$products.quantity" },

                    carrier_cost: { $first: "$carrier_cost" },
                    delivery_charge: { $first: "$delivery_charge" },
                    discount: { $first: "$discount" },
                    wrapping_charge: { $first: "$wrapping_charge" },
                    total_order: { $first: "$total_order" }
                }
            }

            let primaryGroupForMonthly = [
                {
                    $group: {
                        _id: {
                            year: "$year",
                            month: "$month"
                        },
                        products: {
                            $push: "$products"
                        },
                        carrier_cost: { $sum: "$carrier_cost" },
                        delivery_charge: { $sum: "$delivery_charge" },
                        discount: { $sum: "$discount" },
                        wrapping_charge: { $sum: "$wrapping_charge" },
                        total_order: { $sum: 1 }
                    }
                },
                { $unwind: "$products" },
                { $unwind: "$products" }
            ]

            let secondaryGroupForMonth = {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month"
                    },
                    order_price: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                    order_book: { $sum: "$products.quantity" },
                    carrier_cost: { $first: "$carrier_cost" },
                    delivery_charge: { $first: "$delivery_charge" },
                    discount: { $first: "$discount" },
                    wrapping_charge: { $first: "$wrapping_charge" },
                    total_order: { $first: "$total_order" }
                }
            }

            let prod_filter = {
                $match: {
                    "products.product_id": mongoose.Types.ObjectId(criteria.product)
                }
            }

            if (criteria.is_daily) {
                aggArr = aggArr.concat(primaryGroupForDaily);
                if (criteria.product) {
                    aggArr.push(prod_filter);
                }
                aggArr.push(secondaryGroupForDaily);
            } else if (criteria.is_monthly) {
                aggArr = aggArr.concat(primaryGroupForMonthly);
                if (criteria.product) {
                    aggArr.push(prod_filter);
                }
                aggArr.push(secondaryGroupForMonth);
            }

            Order.aggregate(aggArr)
                .exec()
                .then(result => {
                    let info = { result: result, duration: getDatesOfRange(lte_date, gte_date) }
                    res.json(info);
                })
                .catch(err => {
                    res.send(err);
                })
        })
}



// let user = req.user;
//             var condQuery = new Object();
//             if (req.body.items && req.body.items.length > 0) {
//                 var item_ids = req.body.items.map(function (itemId) { return mongoose.Types.ObjectId(itemId) });
//                 condQuery["products.product_id._id"] = { $in: item_ids }
//             }

//             if (req.body.categories && req.body.categories.length > 0) {
//                 var cat_ids = req.body.categories.map(function (catId) { return mongoose.Types.ObjectId(catId) });
//                 condQuery["products.product_id.category"] = { $in: cat_ids }
//             }

//             if (req.body.author) {
//                 condQuery["products.product_id.author"] = mongoose.Types.ObjectId(req.body.author)
//             }

//             if (req.body.publisher) {
//                 condQuery["products.product_id.publisher"] = mongoose.Types.ObjectId(req.body.publisher)
//             }

//             if (req.body.start_date && req.body.end_date) {
//                 var lte_date = new Date(req.body.start_date)
//                 lte_date.setHours(0, 0, 0, 0);
//                 var gte_date = new Date(req.body.end_date)
//                 gte_date.setHours(23, 59, 59, 999);
//                 condQuery['sold_at'] = { $gte: new Date(lte_date), $lt: new Date(gte_date) }
//             }
//             Sale.aggregate([
//                 { $unwind: "$products" },
//                 {
//                     $lookup:
//                     {
//                         from: "products",
//                         localField: 'products.product_id',
//                         foreignField: '_id',
//                         as: 'products.product_id'
//                     }
//                 },
//                 { $unwind: "$products.product_id" },
//                 { $match: condQuery },
//                 {
//                     $project: {
//                         year: { $year: "$sold_at" },
//                         month: { $month: "$sold_at" },
//                         day: { $dayOfMonth: "$sold_at" },
//                         products: "$products"
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             year: "$year",
//                             month: "$month",
//                             day: "$day",
//                             product_id: "$products.product_id",
//                         },
//                         sell_amount: {
//                             $sum: { $multiply: ["$products.price", "$products.quantity"] }
//                         },
//                         sell_qty: {$sum: "$products.quantity"}
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "authors",
//                         localField: '_id.product_id.author',
//                         foreignField: "_id",
//                         as: "_id.product_id.authors"
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "categories",
//                         localField: '_id.product_id.category',
//                         foreignField: "_id",
//                         as: "_id.product_id.categories"
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "publishers",
//                         localField: '_id.product_id.publisher',
//                         foreignField: "_id",
//                         as: "_id.product_id.publisher"
//                     }
//                 },
//                 { $unwind: "$_id.product_id.publisher" },
//                 {
//                     $group: {
//                         _id: {
//                             year: "$_id.year",
//                             month: "$_id.month",
//                             day: "$_id.day",
//                         },
//                         total_sale: {
//                             $sum: "$sell_amount"
//                         },
//                         products: {
//                             $push: {
//                                 name: "$_id.product_id.name",
//                                 author: {
//                                     $map: {
//                                         input: "$_id.product_id.authors",
//                                         as: "authr",
//                                         in: "$$authr.name"
//                                     }
//                                 },
//                                 publisher:"$_id.product_id.publisher.name",
//                                 category: {
//                                     $map: {
//                                         input: "$_id.product_id.categories",
//                                         as: "catg",
//                                         in: "$$catg.name"
//                                     }
//                                 },
//                                 sell_amount: "$sell_amount",
//                                 sell_qty: "$sell_qty"
//                             }
//                         }
//                     }
//                 }

//             ])
//                 .exec()
//                 .then(result => {
//                     res.json({ success: true, data: result });
//                 })
//                 .catch(err => {
//                     //console.log(err)
//                     res.json({ success: false, err: err });
//                 })