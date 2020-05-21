import Stock from '../../../models/inventory-models/stock.model';
import StockSummary from '../../../models/inventory-models/stock-summary.model';
import PurchaseOrder from '../../../models/inventory-models/purchase-order.model';
import Purchase from '../../../models/inventory-models/purchase.model';
import Order from '../../../models/order.model';
import Product from '../../../models/product.model';
import mongoose from 'mongoose';
import { log } from '../text-message.service';


export default (app, router, auth) => {
    router.route('/inventory/break-bundle/:searchValue')
        .get((req, res) => {

            let param = req.params.searchValue;
            
            console.log("param");
            console.log(param);

            Product.aggregate(
                [
                    {
                        $match: {
                            $or : [
                                {'seo_url' : param},
                                {'import_id' : param}
                            ]
                            }
                        
                    },
                    {
                        $project: {
                            // specifications
                            // bundle_items : 1
                            bundle_items :1
                            
                        }
                    }
                    

                ]
            ).then(bundleDetails => {

                console.log(bundleDetails)


                res.json({
                    data: bundleDetails
                });

            }).catch(err => {

                console.log(err);

                res.send(err)


            });
        })

}

export function stockEntry(items) {
    return new Promise((resolve, reject) => {
        Stock.insertMany(items)
            .then(stocks => {
                resolve(stocks)
            })
            .catch(err => {
                reject(err);
            })
    })
}

export function stockRemove(items) {
    return new Promise((resolve, reject) => {
        Stock.remove(items)
            .exec()
            .then(stocks => {
                resolve(stocks)
            })
            .catch(err => {
                reject(err);
            })
    })
}


export function updateStockSummary(items, field_name, field_value) {
    var updatedItems = items.map(prod => {
        let updateObj = new Object();
        updateObj["$inc"] = new Object();
        updateObj["$inc"][field_name] = prod[field_value];
        updateObj['$set'] = {
            updated_at: new Date(),
            updated_by: prod.created_by
        };
        if (field_name == 'total_purchase') {
            updateObj['$set']['purchase_rate'] = prod.purchase_rate;
            updateObj['$set']['supplier'] = prod.supplier;
        }
        return new Promise((resolve, reject) => {
            StockSummary.update({ product_id: prod.product_id }, updateObj, { upsert: true })
                .exec()
                .then(updt => {
                    resolve(updt);
                })
                .catch(err => {
                    reject(err);
                })
        })
    })
    return Promise.all(updatedItems);
}

function hasTodayTrack(data) {
    let today = new Date();
    let string_date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

    return new Promise((resolve, reject) => {
        Stock.count({
                product_id: data.id,
                daily_tracks: { $elemMatch: { date_string: string_date } }
            })
            .exec((err, count) => {
                if (err) reject({ status: false })
                if (count) {
                    resolve({ status: true, date_string: string_date });
                } else {
                    resolve({ status: false, date_string: string_date })
                }
            })
    })
}


export function updateStock(req) {
    var items = req.body.items
    var updatedItems = items.map(prod => {
        return new Promise((resolve, reject) => {
            Stock.findOne()
                .where('item').equals(prod.product_id)
                .exec()
                .then(stock_item => {
                    if (stock_item && stock_item._id) {
                        stock_item.quantity = (parseFloat(stock_item.quantity) + parseFloat(prod.quantity));
                        stock_item.last_updated_at = new Date();
                        stock_item.last_updated_by = req.user._id;
                        stock_item.save(err => {
                            if (!err) {
                                resolve(stock_item)
                            }
                        })
                    } else {
                        Stock.create({
                            item: prod.product_id,
                            item_name: prod.name,
                            quantity: prod.quantity,
                            last_updated_at: new Date(),
                            last_updated_by: req.user._id
                        }, (err, newStock) => {
                            if (!err) {
                                resolve(newStock)
                            }
                        })
                    }
                })
        })
    })
    return Promise.all(updatedItems);
}

export function getCustomerOrderSummary(criteria) {
    return new Promise((resolve, reject) => {
        let cond = new Object();
        cond['performed_order_statuses.status_name'] = "Confirmed";
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
                    year: { $year: "$order_at" },
                    month: { $month: "$order_at" },
                    day: { $dayOfMonth: "$order_at" },
                    order_no: "$order_no",
                    products: "$products"
                }
            },
            { $unwind: "$products" }
        ]

        let groupForDaily = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    day: "$day"
                },
                no: { $push: "$order_no" },
                order_price: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                order_book: { $sum: "$products.quantity" }
            }
        }

        let groupForMonthly = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month"
                },
                no: { $push: "$order_no" },
                order_price: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                order_book: { $sum: "$products.quantity" }
            }
        }

        let prod_filter = {
            $match: {
                "products.product_id": mongoose.Types.ObjectId(criteria.product)
            }
        }

        if (criteria.product) {
            aggArr.push(prod_filter);
        }

        if (criteria.is_daily) {
            aggArr.push(groupForDaily);
        } else if (criteria.is_monthly) {
            aggArr.push(groupForMonthly);
        }

        Order.aggregate(aggArr)
            .exec()
            .then(result => {
                let info = { result: result, duration: getDates(lte_date, gte_date) }
                resolve(info);
            })
            .catch(err => {
                reject(err);
            })
    })

}


export function getPurchaseOrderSummary(criteria) {
    return new Promise((resolve, reject) => {
        let cond = new Object();
        criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
        var lte_date = new Date(criteria.from_date);
        lte_date.setHours(0, 0, 0, 0);
        var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
        gte_date.setHours(23, 59, 59, 999);

        cond['created_at'] = {
            $lte: new Date(gte_date),
            $gte: new Date(lte_date)
        }

        let aggArr = [{
                $match: cond
            },
            {
                $project: {
                    year: { $year: "$created_at" },
                    month: { $month: "$created_at" },
                    day: { $dayOfMonth: "$created_at" },
                    order_no: "$order_no",
                    products: "$orderd_products"
                }
            },
            { $unwind: "$products" }
        ]

        let groupForDaily = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    day: "$day"
                },
                no: { $push: "$order_no" },
                order_price: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                order_book: { $sum: "$products.quantity" }
            }
        }

        let groupForMonthly = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month"
                },
                no: { $push: "$order_no" },
                order_price: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                order_book: { $sum: "$products.quantity" }
            }
        }

        let prod_filter = {
            $match: {
                "products.product_id": mongoose.Types.ObjectId(criteria.product)
            }
        }

        if (criteria.product) {
            aggArr.push(prod_filter);
        }

        if (criteria.is_daily) {
            aggArr.push(groupForDaily);
        } else if (criteria.is_monthly) {
            aggArr.push(groupForMonthly);
        }

        PurchaseOrder.aggregate(aggArr)
            .exec()
            .then(rejult => {
                resolve(rejult);
            })
            .catch(err => {
                reject(err);
            })
    })

}

export function getPurchaseSummary(criteria) {
    return new Promise((resolve, reject) => {
        let cond = new Object();
        criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfThirtyDayAgo();
        var lte_date = new Date(criteria.from_date);
        lte_date.setHours(0, 0, 0, 0);
        var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
        gte_date.setHours(23, 59, 59, 999);

        cond['created_at'] = {
            $lte: new Date(gte_date),
            $gte: new Date(lte_date)
        }

        let aggArr = [{
                $match: cond
            },
            {
                $project: {
                    year: { $year: "$created_at" },
                    month: { $month: "$created_at" },
                    day: { $dayOfMonth: "$created_at" },
                    purchase_no: "$purchase_no",
                    products: "$products"
                }
            },
            { $unwind: "$products" }
        ]

        let groupForDaily = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    day: "$day"
                },
                no: { $push: "$purchase_no" },
                order_price: { $sum: { $multiply: ["$products.quantity", "$products.rate"] } },
                order_book: { $sum: "$products.quantity" }
            }
        }

        let groupForMonthly = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month"
                },
                no: { $push: "$purchase_no" },
                order_price: { $sum: { $multiply: ["$products.quantity", "$products.rate"] } },
                order_book: { $sum: "$products.quantity" }
            }
        }

        let prod_filter = {
            $match: {
                "products.product_id": mongoose.Types.ObjectId(criteria.product)
            }
        }

        if (criteria.product) {
            aggArr.push(prod_filter);
        }

        if (criteria.is_daily) {
            aggArr.push(groupForDaily);
        } else if (criteria.is_monthly) {
            aggArr.push(groupForMonthly);
        }

        Purchase.aggregate(aggArr)
            .exec()
            .then(rejult => {
                resolve(rejult);
            })
            .catch(err => {
                reject(err);
            })
    })

}

export function getStockItemCurrentStock(items) {
    return new Promise((resolve, reject) => {
        Stock.aggregate([{
                $match: {
                    product_id: { $in: items }
                }
            },
            {
                $group: {
                    _id: "$product_id",
                    opening: { $sum: "$opening_qty" },
                    purchase: { $sum: "$purchase_qty" },
                    sales: { $sum: "$sales_qty" },
                    cancel: { $sum: "$cancel_qty" },
                    return: { $sum: "$return_qty" }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    quantity: {
                        $subtract: [{
                            $add: ["$opening", "$purchase", "$cancel", "$return"]
                        }, "$sales"]
                    }
                }
            }
        ])
    })
}

export function getDateOfThirtyDayAgo() {
    var moment = require('moment');
    var resultDate = moment().subtract(1, 'months').format();
    return resultDate;
}

export function getDateDayAgo(day) {
    var moment = require('moment');
    var resultDate = moment().subtract(day, 'days').format();
    return resultDate;
}


Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}