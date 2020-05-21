import Stock from '../../../models/inventory-models/stock.model';
import StockSummary from '../../../models/inventory-models/stock-summary.model';
import Purchase from '../../../models/inventory-models/purchase.model';
import Publisher from '../../../models/publisher.model';
import Order from '../../../models/order.model';
import Category from '../../../models/category.model';
import Author from '../../../models/author.model';
import mongoose from 'mongoose';
import Counter from '../../../models/seq.counter.model';
const VOUCHER_SEQ_NAME = 'voucher';


export default (app, router, auth, logger) => {

    router.route('/stock/daily-stock/')
        .get(auth, (req, res) => {
            console.log(req.query.date_from)

            if (req.query.date_from) {
                var lte_date = new Date(req.query.date_from);
                lte_date.setHours(0, 0, 0, 0);
                var gte_date = new Date(req.query.date_from);
                gte_date.setHours(23, 59, 59, 999);
            } else {
                var lte_date = new Date();
                lte_date.setHours(0, 0, 0, 0);
                var gte_date = new Date();
                gte_date.setHours(23, 59, 59, 999);
            }




            Stock.aggregate([{
                        $match: {
                            // 'created_at': new Date(lte_date)
                            'created_at': {
                                $lte: new Date(gte_date),
                                $gte: new Date(lte_date)
                            }
                        }
                    },

                    {
                        $project: {
                            "year": {
                                "$year": "$created_at"
                            },
                            "month": {
                                "$month": "$created_at"
                            },
                            "day": {
                                "$dayOfMonth": "$created_at"
                            },
                            "product_id": "$product_id",
                            "purchase_qty": "$purchase_qty",
                            "sales_qty": "$sales_qty",
                            "return_qty": "$return_qty"
                        }
                    },
                    {
                        $group: {
                            "_id": {
                                "product_id": "$product_id",
                                "year": "$year",
                                "month": "$month",
                                "day": "$day",


                            },
                            "sales": { $sum: "$sales_qty" },
                            "purchases": { $sum: "$purchase_qty" },
                            "returns": { $sum: "$return_qty" }
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "_id.product_id",
                            foreignField: "_id",
                            as: "product"
                        }

                    },

                    {
                        $lookup: // Equality Match
                        {
                            from: "stocksummaries",
                            localField: "_id.product_id",
                            foreignField: "product_id",
                            as: "stock_sum"
                        }

                    },

                    {
                        $project: {
                            "_id": "$_id.product_id",

                            //"year" : "$_id.year", 
                            "month": "$_id.month",
                            "day": "$_id.day",
                            "product_import_id": { $arrayElemAt: ["$product.import_id", 0] },
                            "product_name": { $arrayElemAt: ["$product.name", 0] },
                            "publisher": { $arrayElemAt: ["$product.accessories.publisher_en.name", 0] },
                            "opening_stock": { $arrayElemAt: ["$stock_sum.opening_stock", 0] },
                            "daily_purchase": "$purchases",
                            "daily_sales": "$sales",
                            "daily_return": "$returns",
                            "current_stock": {
                                $subtract: [
                                    { $sum: [{ $arrayElemAt: ["$stock_sum.opening_stock", 0] }, { $arrayElemAt: ["$stock_sum.total_purchase", 0] }, { $arrayElemAt: ["$stock_sum.total_cancel", 0] }, { $arrayElemAt: ["$stock_sum.total_return", 0] }] },
                                    {
                                        $ifNull: [
                                            { $arrayElemAt: ["$stock_sum.total_sales", 0] },
                                            0
                                        ]
                                    }
                                ]
                            },
                            "unit_price": { $arrayElemAt: ["$stock_sum.purchase_rate", 0] }

                        }
                    }


                ])
                .exec()
                .then(result => {
                    res.json({ success: true, data: result });
                })
                .catch(err => {
                    res.send(err)
                })



        })

    router.route('/stock/report-params')
        .get(auth, (req, res) => {
            let user = req.user;
            let criteria = {
                'success': true,
                'items': [],
                'categories': [],
                'authors': [],
                'publishers': [],
            };

            Stock.find()
                .populate({ path: 'item', select: "name" })
                .exec()
                .then(stock_items => {
                    criteria.items = stock_items.map(stock_item => {
                        return stock_item.item;
                    })
                    return Category.find().select({ name: 1, hierarchy_path: 1, children: 1 }).sort({ name: 1 })
                })
                .then(categories => {
                    criteria.categories = categories;
                    return Author.find().select({ name: 1 }).sort({ name: 1 })
                })
                .then(authors => {
                    criteria.authors = authors;
                    return Publisher.find().select({ name: 1 }).sort({ name: 1 })
                })
                .then(publishers => {
                    criteria.publishers = publishers;
                    res.json(criteria);
                })
                .catch(err => {
                    //console.log(err);
                    res.json({ success: false });
                })

        })

    router.route('/stock/stock-report')
        .post(auth, (req, res) => {
            var productCondQuery = new Object();
            var publisherCondQuery = new Object();
            var qtyCondQuery = new Object();

            if (req.body.product && req.body.product != "") {
                productCondQuery["product_id"] = mongoose.Types.ObjectId(req.body.product)
            }

            if (req.body.publisher && req.body.publisher != "") {
                publisherCondQuery["product.publisher"] = mongoose.Types.ObjectId(req.body.publisher)
            }

            if (!req.body.publisher && !req.body.product) {
                qtyCondQuery['stock_qty'] = { $gt: 0 };
            }

            StockSummary.aggregate([{
                        $match: productCondQuery
                    },
                    {
                        $project: {
                            product_id: "$product_id",
                            purchase_rate: {
                                '$cond': {
                                    if: { '$gt': ['$purchase_rate', 0] },
                                    then: '$purchase_rate',
                                    else: 0
                                }
                            },
                            opening_stock: {
                                '$cond': {
                                    if: { '$gt': ['$opening_stock', 0] },
                                    then: '$opening_stock',
                                    else: 0
                                }
                            },
                            total_purchase: {
                                '$cond': {
                                    if: { '$gt': ['$total_purchase', 0] },
                                    then: '$total_purchase',
                                    else: 0
                                }
                            },
                            total_sales: {
                                '$cond': {
                                    if: { '$gt': ['$total_sales', 0] },
                                    then: '$total_sales',
                                    else: 0
                                }
                            },
                            total_cancel: {
                                '$cond': {
                                    if: { '$gt': ['$total_cancel', 0] },
                                    then: '$total_cancel',
                                    else: 0
                                }
                            },
                            total_return: {
                                '$cond': {
                                    if: { '$gt': ['$total_return', 0] },
                                    then: '$total_return',
                                    else: 0
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            product_id: '$product_id',
                            opening_stock: '$opening_stock',
                            purchase_rate: '$purchase_rate',
                            total_purchase: '$total_purchase',
                            total_sales: { $subtract: ['$total_sales', '$total_cancel'] },
                            total_return: '$total_return',
                            stock_qty: { $subtract: [{ $sum: ['$opening_stock', '$total_purchase', '$total_cancel', '$total_return'] }, '$total_sales'] },
                        }
                    },
                    {
                        $match: qtyCondQuery
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
                        $match: publisherCondQuery
                    },
                    {
                        $project: {
                            name: '$product.name',
                            import_id: '$product.import_id',
                            publisher: '$product.accessories.publisher_en.name',
                            purchase_rate: '$purchase_rate',
                            opening_stock: '$opening_stock',
                            total_purchase: '$total_purchase',
                            total_sales: '$total_sales',
                            total_return: '$total_return',
                            stock_qty: '$stock_qty'
                        }
                    }
                ])
                .exec()
                .then(result => {
                    res.json({ success: true, data: result });
                })
                .catch(err => {
                    //console.log(err)
                })
        })



    router.route('/stock/stock-comment/:id')
        .get(auth, (req, res) => {
            StockSummary.findOne({ _id: req.params.id })
                .select({ comments: 1 })
                .populate({ path: 'comments.commented_by', select: 'first_name last_name' })
                .sort({ 'comments.commented_at': 1 })
                .exec()
                .then(item => {
                    res.json(item.comments);
                })
                .catch(err => {
                    res.json(err);
                })
        })

    .put(auth, (req, res) => {
        let comment_data = {
            text: req.body.text,
            commented_by: req.user._id,
            commented_at: new Date()
        }
        StockSummary.update({ _id: req.params.id }, { $push: { comments: comment_data } })
            .exec()
            .then(updated => {
                res.json(updated);
            })
            .catch(err => {
                res.json({ ok: 0 });
            })
    })

    router.route('/stock/adjust-stock')
        .get((req, res) => {
            StockSummary.find({})
                .exec()
                .then(result => {
                    let per = result.splice(4000, 500)
                    return calculateSalesPurchase(per)
                })
                .then(sales => {
                    res.json(sales)
                })
                .catch(err => {
                    res.json(err);
                })
        })

    function calculateSalesPurchase(items) {
        let updated_items = items.map(item => {
            let stock_obj = new Object();
            return new Promise((resolve, reject) => {
                Order.aggregate([{
                            $unwind: "$products"
                        },
                        {
                            $match: {
                                "products.product_id": item.product_id,
                                "current_order_status.status_name": { $in: ["Inshipment", "Delivered", "ReturnRequest", "OrderClosed", "Dispatch", "Returned", ] }
                            }
                        },
                        {
                            $group: {
                                _id: { status: "$current_order_status.status_name", product: "$products.product_id" },
                                count: { $sum: "$products.quantity" }
                            }
                        }
                    ])
                    .exec()
                    .then(result => {
                        stock_obj = { _id: item.product_id, sales: salesCalculate(result), return: returnCalculate(result) }
                        return Purchase.aggregate([{
                                $unwind: "$products",
                            },
                            {
                                $match: {
                                    "products.product_id": item.product_id
                                }
                            },
                            {
                                $group: {
                                    _id: "$item.product_id",
                                    count: { $sum: "$products.quantity" },
                                    rate: { $last: "$products.rate" }
                                }
                            }
                        ])
                    })
                    .then(purchase => {
                        if (purchase && purchase.length > 0) {
                            stock_obj.purchase = purchase[0].count;
                            stock_obj.rate = purchase[0].rate;
                        } else {
                            stock_obj.purchase = 0;
                            stock_obj.rate = 0;
                        }
                        return StockSummary.update({ product_id: stock_obj._id }, {
                            $set: {
                                total_purchase: stock_obj.purchase,
                                total_sales: stock_obj.sales,
                                total_return: stock_obj.return,
                                purchase_rate: stock_obj.rate,
                                opening_stock: 0
                            }
                        })
                    })
                    .then(updated => {
                        resolve(updated)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })
        return Promise.all(updated_items)
    }

    function salesCalculate(array) {
        return array.reduce(function(sum, record) {
            return sum + record.count;
        }, 0);
    }

    function returnCalculate(array) {
        let obj = array.find(arr => { return arr._id.status == 'Returned' });
        return obj ? obj.count : 0
    }
}