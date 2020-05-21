import Category from '../../models/category.model';
import Publisher from '../../models/publisher.model';
import Thana from '../../models/thana.model';
import config from '../../../config/config.json'
import mongoose from 'mongoose';
import Product from "../../models/product.model";
import Order from "../../models/order.model";
import Purchase from "../../models/inventory-models/purchase.model";
import Stocksummary from "../../models/inventory-models/stock-summary.model";


import {
    resolve
} from 'path';

import {
    soundexUpdate
} from "./api.service.js";
import { now } from 'moment';


/* #region  MORE CODES */
// var fs = require('fs'),
//   request = require('request');

// var download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     // //console.log('content-type:', res.headers['content-type']);
//     // //console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };

// var createDir = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     //console.log('content-type:', res.headers['content-type']);
//     //console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.mkdirSync(filename)).on('close', callback);
//   });
// };

//const file_log = require('log-to-file');

/* #endregion */


/* #region FOR EXCEL WORKBOOK */

//Needed for excel import from local
// var Excel = require("exceljs");
// var workbook = new Excel.Workbook();

/* #endregion */

export default (app, router, cache) => {
    var countABC = 0;

    // db.getCollection('orders').find({
    //     "$or": [
    //     {'payment_information.bank_tran_id': {'$in': ["6LP7IOLALN","6LT3L2U3F7","6LT3KNDWTL","6LT3KS8TBH","LT2KXSWPO"]} },
    //     {'payment_collection.collection_info.transaction_id':{'$in': ["6LP7IOLALN","6LT3L2U3F7","6LT3KNDWTL","6LT3KS8TBH","LT2KXSWPO"]}}
    //     ]
    //     },{order_no:1, 'payment_information.bank_tran_id':1, 'payment_collection.collection_info.transaction_id':1, _id:0 })

    // db.getCollection('orders').find({
    //     '$and':[
    //     {
    //         '$or':[
    //     {'delivery_address.phone_number': '01773799908'},
    //     {'payment_collection.total_paid': 198}
    //     ]
    //         },
    //     {'order_string_date': /2019-10-/}
    //     ]
    //     }, {order_no:1})

    // db.getCollection('orders').count({
    //     '$and': [
    //     {'products.product_id': ObjectId("5ddf9e439e28822c214e6fd6")},
    //     {
    //         '$or':[
    //         {'current_order_status.status_name': 'PreOrder'},
    //         {'current_order_status.status_name': 'Pending'},
    //         {'current_order_status.status_name': 'Confirmed'}

    //         ]
    //         }
    //     ]

    //     })

    // db.getCollection('orders').aggregate([
    //     {$match: {'products.product_id':ObjectId("5e147244176cda7b1bb7acd7")}},
    //     {$project: {_id:0, total_book:1,'products':1 }},
    //     {$match: {'total_book':{$gt:1}}},
    //     //{$count:"total_book"}
    // ])

    router.route("/batch-update/update-payment-amount")
        .get((req, res) => {
            Order.find({
                "$and": [
                    //   { "order_no": 100413 },
                    { "current_order_status.status_name": "OrderClosed" },
                    { "payment_collection.carrier_cost": { "$gt": 0 } },
                    { "payment_collection.collection_info": { "$size": 1 } },
                    {
                        "payment_collection.collection_info.collected_at": {
                            "$gte": new Date("2019-09-01T09:06:12.017Z")
                        }
                    },
                    {
                        "payment_collection.collection_info.collected_at": {
                            "$lt": new Date("2020-01-05T09:06:12.017Z")
                        }
                    }
                ]
            }
                // ,{"payment_collection":1, "payable_amount":1}
            )
                .then(orders => {
                    //return updateCollectedAmount(orders);
                })
                .then(result => {
                    res.json(result)
                })
        })

    function updateCollectedAmount(orders) {
        let updates = orders.map(order => {
            return new Promise((resolve, reject) => {
                let totalPaid = order.payment_collection.total_paid;

                Order.update({
                    _id: mongoose.Types.ObjectId(order._id)
                }, {
                    $set: {
                        "payment_collection.collection_info.0.collected_amount": totalPaid
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        resolve(status)
                    })
                    .catch(err => {
                        //console.log(err)
                        reject(err)
                    })
            })
        })
        return Promise.all(updates)
    }

    router.route("/batch-update/discount-update")
        .get((req, res) => {
            Product.find({
                category: mongoose.Types.ObjectId("5e01ac526e9438037ab1cd3b")
            })
                .then(products => {
                    //return updateProductDiscount(products)
                })
                .then(result => {
                    res.json(result)
                })
        })

    function updateProductDiscount(products) {
        let updates = products.map(product => {
            return new Promise((resolve, reject) => {

                // let discountRate = Math.round(((product.previous_price - product.price) / product.previous_price) * 100);
                let productPrice = Math.round(product.previous_price * .75);
                let productId = product._id;

                Product.update({
                    _id: mongoose.Types.ObjectId(productId)
                }, {
                    $set: {
                        price: productPrice,
                        discount_rate: 25
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        resolve(status)
                    })
                    .catch(err => {
                        reject(err);
                    })

            })
        })
        return Promise.all(updates)
    }


    router.route("/batch-update/stock-product-category")
        .get((req, res) => {
            Stocksummary.find({})
                .then(stocks => {
                    //  return updateProductPrice(stocks)
                })
                .then(result => {
                    res.json(result)
                })
        })



    function updateProductPrice(productStocks) {
        let updates = productStocks.map(productStock => {
            return new Promise((resolve, reject) => {

                let openingStock = productStock.opening_stock || 0;
                let totalPurchase = productStock.total_purchase || 0;
                let totalSales = productStock.total_sales || 0;
                let totalReturn = productStock.total_return || 0;
                let productId = productStock.product_id;

                let purchaseRate = productStock.purchase_rate;

                if ((openingStock + totalPurchase + totalReturn > totalSales) && purchaseRate > 0) {
                    let finalPurchaseRate = purchaseRate + 10;

                    Product.update({
                        _id: mongoose.Types.ObjectId(productId)
                    }, {
                        $set: {
                            price: finalPurchaseRate
                        }
                    }, {
                        multi: true
                    })
                        .exec()
                        .then(status => {
                            resolve(status)
                        })
                        .catch(err => {
                            reject(err);
                        })

                } else {
                    resolve(productId)
                }
            })
        })
        return Promise.all(updates)
    }


    router.route('/batch-update/category-bulk-boimaela-2020')
        .get((req, res) => {
            Product.find({
                "$or": [
                    { "category": mongoose.Types.ObjectId("5decd6fd4ed0305a1a9c4c88") },
                    {
                        "$and": [
                            {
                                "created_at": { "$gte": new Date("2019-06-01T00:00:12.017Z") }
                            },
                            {
                                "is_enabled": true
                            }
                        ]
                    }
                ]

            }).then(result => {
               // return updateCategoryBoimela(result);
            }).then(final => {
                res.json({
                    success: true
                })
            }).catch(err => {
                res.send(err)
            })
        })

    function updateCategoryBoimela(books) {
        let updates = books.map(book => {
            return new Promise((resolve, reject) => {
                let productId = book._id;
                let previousPrice = book.previous_price;
                let newPrice = Math.round(parseInt(previousPrice * .75));

                Product.update({
                    _id: mongoose.Types.ObjectId(productId)
                }, {
                    $set: {
                        price: newPrice,
                        discount_rate: 25
                    },
                    $addToSet: { //alternative of $push except it does not take duplicate array elements
                        category: mongoose.Types.ObjectId("5decd6fd4ed0305a1a9c4c88")
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        resolve(status)
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(updates)
    }

    function updateProductsCategory(productStocks) {
        let updates = productStocks.map(productStock => {
            return new Promise((resolve, reject) => {

                let openingStock = productStock.opening_stock || 0;
                let totalPurchase = productStock.total_purchase || 0;
                let totalSales = productStock.total_sales || 0;
                let totalReturn = productStock.total_return || 0;
                let productId = productStock.product_id;

                if (openingStock + totalPurchase + totalReturn > totalSales) {

                    Product.update({
                        _id: mongoose.Types.ObjectId(productId)
                    }, {
                        $addToSet: {
                            category: mongoose.Types.ObjectId("5a8194cc2142349467916ea5")
                        }
                    }, {
                        multi: true
                    })
                        .exec()
                        .then(status => {
                            resolve(status)
                        })
                        .catch(err => {
                            reject(err);
                        })

                } else {
                    resolve(productId)
                }
            })
        })
        return Promise.all(updates)
    }



    router.route("/batch-update/order-payment-collection")
        .get((req, res) => {
            Order.find({
                '$and': [
                    { 'payment_information.status': 'VALID' },
                    { 'payment_information.card_type': 'BKASH-BKash' },
                    { 'payment_collection.collection_info': { '$size': 1 } },
                    { 'payment_collection.collection_info.collected_amount': { '$exists': false } }
                ]
            })
                .exec()
            then(orders => {
                //return updatePaymentCollection(ordes)
            })
                .then(res => {
                    res.json({
                        success: true
                    })
                })
        })

    function updatePaymentCollection(orders) {
        var updates = orders.map(order => {
            return new Promise((resolve, reject) => {

                order.save()
                    .then(ord => {
                        resolve(ord)
                    })

            })
        })
        return Promise.all(updates)
    }

    router.route("/batch-update/update-specific-order")
        .get((req, res) => {

            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('order_closed_list_sun.xlsx');
            const mylist = workbook.SheetNames;
            var myJsonData = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));

            //console.log(myJsonData)

            //purSupStockUpdate(myJsonData)
            //findProductsForStockUpdate(myJsonData)
            // updateCurrentOrderStatus(myJsonData)
            //updateOpeningStock(myJsonData)

            // updateOrderClosed(myJsonData)
            //     .then(items => {
            //         console.log(countABC)
            //         res.json({
            //             success: true
            //         })
            //     })
            //     .catch(err => {
            //         console.log(countABC)

            //         //console.log(err)
            //         res.json({
            //             success: false
            //         })
            //     })

        })

    function updateOrderClosed(order_ids) {
        let ord_info = order_ids.map(row => {
            //console.log(row)
            return new Promise((resolve, reject) => {
                let ord_id = parseInt(row.order_no);

                Order.findOne({
                    order_no: ord_id
                })
                    .exec()
                    .then(order => {
                        //console.log(order)

                        var performed_order_statuses = [];

                        let previous_order_status = {
                            "status_id": mongoose.Types.ObjectId('59f999594e6ad6f734271972'),
                            "status_name": "OrderClosed",
                            "updated_at": new Date("2019-11-26T09:06:12.017Z"),
                            "updated_by": mongoose.Types.ObjectId('5a658361e579ee753600f753')
                        };
                        performed_order_statuses = order.performed_order_statuses;
                        performed_order_statuses.push(previous_order_status);


                        if (order.current_order_status.status_name == 'Delivered') {
                            countABC++;
                            order.current_order_status = previous_order_status;
                            order.performed_order_statuses = performed_order_statuses;
                            order.save(alt => {
                                resolve(order);

                            });
                        } else {
                            resolve(order);
                        }

                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(ord_info);
    }


    function purSupStockUpdate(product_infos) {
        let prd_info = product_infos.map(row => {
            return new Promise((resolve, reject) => {
                let prd_id = mongoose.Types.ObjectId(row.product_id);
                let pur_rate = parseInt(row.purchase_rate.trim())
                let sup_id = mongoose.Types.ObjectId(row.supplier);

                Stocksummary.findOne({
                    product_id: prd_id
                })
                    .exec()
                    .then(stck_sum => {
                        if (stck_sum && stck_sum._id && !stck_sum.supplier) {
                            Stocksummary.update({
                                product_id: prd_id
                            }, {
                                $set: {
                                    supplier: sup_id,
                                    purchase_rate: pur_rate
                                }
                            })
                                .then(updt => {
                                    resolve(updt);
                                })
                        } else {
                            reject(stck_sum)
                        }
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(prd_info);
    }

    function updateOpeningStock(prod_ids) {
        let product_ids = prod_ids.map(row => {
            return new Promise((resolve, reject) => {
                let productId = mongoose.Types.ObjectId(row.product_id)

                Stocksummary.findOne({
                    product_id: productId
                })
                    .exec()
                    .then(stck_sum => {
                        if (stck_sum && stck_sum._id && stck_sum.opening_stock > 0) {
                            console.log(stck_sum._id)
                            let newOpening = parseInt(stck_sum.opening_stock - 1);
                            Stocksummary.update({
                                product_id: productId
                            }, {
                                $set: {
                                    opening_stock: newOpening
                                }
                            })
                                .then(updt => {
                                    resolve(updt);
                                })
                        } else {
                            reject(stck_sum)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        reject(err);
                    })
            })
        })
        return Promise.all(product_ids)
    }

    function updateCurrentOrderStatus(order_ids) {
        let ordr_ids = order_ids.map(row => {
            return new Promise((resolve, reject) => {
                let orderId = parseInt(row.order_no);

                //console.log(orderId)

                Order.update({
                    order_no: orderId
                }, {
                    $set: {
                        current_order_status: {
                            "status_id": mongoose.Types.ObjectId('59f998bc4e6ad6f73427196e'),
                            "status_name": "Delivered",
                            "updated_at": new Date(),
                            "updated_by": mongoose.Types.ObjectId('5a658361e579ee753600f753')
                        }
                    },
                    $push: {
                        'customer_contact_info.other_contact_history': {
                            contact_at: new Date(),
                            contact_by: mongoose.Types.ObjectId('5a658361e579ee753600f753'),
                            contact_note: 'Update Multiple'
                        },
                        performed_order_statuses: {
                            "status_id": mongoose.Types.ObjectId('59f998bc4e6ad6f73427196e'),
                            "status_name": "Delivered",
                            "updated_at": new Date(),
                            "updated_by": mongoose.Types.ObjectId('5a658361e579ee753600f753')
                        }
                    }
                })
                    .then(updt => {
                        resolve(updt)
                    })
                    .catch(err => {
                        //console.log(err)
                        reject(err)
                    })
            })
        })
        return Promise.all(ordr_ids)
    }


    function findProductsForStockUpdate(product_infos) {
        let product_info = product_infos.map(row => {
            return new Promise((resolve, reject) => {
                let importId = parseInt(row.import_id.trim())
                let stock_qty = parseInt(row.stock_qty.trim())
                // console.log('importId')
                // console.log(importId)
                // console.log('stock_qty')
                // console.log(stock_qty)

                Product.findOne({
                    import_id: importId
                }, {
                    price: 1,
                    _id: 1,
                    price: 1,
                })
                    .exec()
                    .then(product => {
                        // console.log('product')
                        // console.log(product)

                        Stocksummary.findOne({
                            product_id: product._id
                        })
                            .exec()
                            .then(stock => {


                                // console.log('stock')
                                // console.log(stock)
                                if (stock && stock._id) {
                                    Stocksummary.update({
                                        product_id: product._id
                                    }, {
                                        $set: {
                                            opening_stock: stock_qty,
                                            total_sales: 0,
                                            total_return: 0,
                                            total_cancel: 0,
                                            total_purchase: 0,
                                            updated_by: mongoose.Types.ObjectId('5a658361e579ee753600f753')
                                        }
                                    })
                                        .exec()
                                        .then(upt => {
                                            resolve(upt)
                                        })
                                        .catch(err => {
                                            console.log(importId)
                                            reject(err)
                                        })
                                } else {
                                    Stocksummary.create({
                                        product_id: product._id,
                                        opening_stock: stock_qty,
                                        purchase_rate: Math.round(product.price * (0.75)),
                                        total_sales: 0,
                                        total_return: 0,
                                        total_cancel: 0,
                                        total_purchase: 0,
                                        updated_by: mongoose.Types.ObjectId('5a658361e579ee753600f753')
                                    }, (err, crt) => {
                                        if (err) {
                                            console.log(importId)
                                            reject(err)
                                        } else
                                            resolve(crt)
                                    });
                                }
                            })
                            .catch(err => {
                                reject(err)
                            })
                    })
                    .catch(err => {
                        //console.log(importId)
                        reject(err)
                    })
            })
        })
        return Promise.all(product_info);
    }

    function updateStockSummary(product_id) {

    }


    //Add Category Products Multiple
    router.route("/batch-update/category-products-add")
        .get((req, res) => {
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('muktijuddho.xlsx');
            const mylist = workbook.SheetNames;

            var myJsonData = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));





            // addProductsToCategory(myJsonData)
            //     .then(items => {
            //         res.json({
            //             success: true,
            //             data: countABC
            //         })
            //     })
            //     .catch(err => {
            //         res.json({
            //             success: false
            //         })
            //     })


        })

    function addProductsToCategory(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let product_import_id = parseInt(row.import_id.trim());

                let myType = typeof product_import_id;

                if (myType == 'number') {
                    countABC++;
                }


                Product.update({
                    import_id: product_import_id
                }, {
                    $addToSet: {
                        category: mongoose.Types.ObjectId("5a8194cc2142349467916bf1")
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        resolve(status)
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(updated_info);
    }


    //Category Change particular
    router.route("/batch-update/category-change")
        .get((req, res) => {
            Product.find({
                category: mongoose.Types.ObjectId("5a27e22ffb6110b11c326d61")
            })
                .exec()
                .then(products => {
                    return updateProductCategoryForMerge(products)
                })
                .then(rspns => {
                    res.json({
                        success: true
                    })
                })

        })

    function arrayRemove(arr, value) {

        return arr.filter(function (ele) {
            return ele != value;
        });

    }

    function updateProductCategoryForMerge(products) {
        var updates = products.map(product => {
            return new Promise((resolve, reject) => {


                // product.category = arrayRemove(product.category, '5a27e22ffb6110b11c326d61'); //Remove Category
                // product.category.push('5a8194cc2142349467916a5b'); //Add Category

                product.save()
                    .then(prd => {
                        resolve(product)
                    })

            })
        })
        return Promise.all(updates)
    }




    router.route("/batch-update/preview-insert")
        .get((req, res) => {
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('J:/book_preview_last.xlsx');
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));

            // previewInsert(myJson)
            //     .then(items => {
            //         res.json({
            //             success: true,
            //             result: items
            //         });
            //     })
            //     .catch(err => {
            //         res.json({
            //             success: false
            //         })
            //     })
        })

    function previewInsert(rows) {

        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {

                let importId = row.import_id;
                let parentFolder = parseInt(importId / 1000) * 1000 + 1000;
                let count = row.count;

                Product.findOne({
                    import_id: importId
                })
                    .exec()
                    .then(product => {
                        let previewImages = [];
                        for (let i = 1; i <= count; i++) {
                            let imageLocation = '/images/product/' + parentFolder + '/' + importId + '/previews/' + i + '/1200X1600/' + importId + '.jpg';
                            let previewImg = {
                                'disabled': false,
                                'page_num': i,
                                'uploaded_by': mongoose.Types.ObjectId("5a658361e579ee753600f753"),
                                'uploaded_at': new Date(),
                                'image': {
                                    '1200X1600': imageLocation
                                }
                            }
                            previewImages.push(previewImg);
                        }
                        product.preview_images = previewImages;
                        product.save(status => {
                            resolve(product)
                        }).catch(err => {
                            reject(err);
                        })
                    })
                    .catch(err => {
                        reject(err);
                    })

            })
        })
        return Promise.all(updated_info);
    }






    //Thana Code Insert

    let sheetNo = 0;
    router.route("/batch-update/thana-codes")
        .get((req, res) => {
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('/boibazar/Post Code List.xlsb');
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[sheetNo]]));
            sheetNo++;
            console.log(sheetNo)

            // insertThanaInfos(myJson)
            //   .then(items => {
            //     res.json(sheetNo);
            //   })
            //   .catch(err => {
            //     res.json({
            //       success: false
            //     })
            //   })


        })

    function insertThanaInfos(rows) {

        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let districtID
                let thanaName
                let thanaId
                let areaNames

                let postCodes = 0
                let carrierId


                districtID = row['district_id'];
                thanaName = row['Thana'] ? row['Thana'] : undefined;
                thanaId = row['id'] ? parseInt(row['id'].trim()) : undefined;
                areaNames = row['Area'] ? row['Area'].split('#') : undefined;
                postCodes = row['Post Code'] ? row['Post Code'].split('#') : undefined;
                carrierId = row['Carrier'] ? row['Carrier'] : undefined;

                Thana.create({
                    THANA_NO: thanaId,
                    THANA_NAME: thanaName,
                    AREA_NAMES: areaNames,
                    POST_CODES: postCodes,
                    CARRIER: carrierId,
                    F_DISTRICT_NO: districtID
                }, (err, thana) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(thana)
                    }
                })
            })
        })
        return Promise.all(updated_info);
    }




    /* #region  PRODUCT UPDATE*/

    let refreshgCount = 150000;
    let countLine = 0;
    router.route("/batch-update/product-set")
        .get((req, res) => {
            const XLSX = require('xlsx');
            //const workbook = XLSX.readFile('/boibazar/Book_info/book_info_10000.xls');
            // const workbook = XLSX.readFile('/boibazar/Book_info/book_info_' + refreshgCount + '.xls');
            const workbook = XLSX.readFile('/boibazar/Book_info/book_info_' + refreshgCount + '_summary.xls');
            // refreshgCount += 5000;
            // console.log(refreshgCount)
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));

            res.json({ myJson })
            // updateProductInfoDesc(myJson)
            //   .then(items => {
            //     // setTimeout(() => {
            //     //   res.writeHead(301,
            //     //     {Location: 'http://192.168.8.49:3000/api/batch-update/product-set'}
            //     //   );
            //     //   res.end();
            //     // }, 1000);

            //      res.json(items);
            //   })
            //   .catch(err => {
            //     // setTimeout(() => {
            //     //   res.writeHead(301,
            //     //     {Location: 'http://192.168.8.49:3000/api/batch-update/product-set'}
            //     //   );
            //     //   res.end();
            //     // }, 1000);

            //     res.json({
            //       success: true
            //     })
            //   })
        });


    function updateProductInfoRoko(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let importId = parseInt(row['Product ID'].trim());
                let price = parseInt(row['Selling Price']);
                let previous_price = parseInt(row['Prev Price']);
                let discount = 0;
                if (previous_price > price) {
                    discount = parseInt(100 * (previous_price - price) / previous_price);
                } else {
                    previous_price = price;
                    //keep a LOG

                    // create a rolling file logger based on date/time that fires process events
                    // const opts = {
                    //   errorEventName: 'error',
                    //   logDirectory: '/boibazar/mylogfiles', // NOTE: folder must exist and be writable...
                    //   fileNamePattern: 'roll-<DATE>.log',
                    //   dateFormat: 'YYYY.MM.DD'
                    // };
                    // const log = require('simple-node-logger').createRollingFileLogger(opts);
                    // log.info(importId);
                    // log.getLogEntries().length.should.equal( 1 );

                }
                let current_offer;

                let availability_id = parseInt(row['Book_Availability_Info_Id']);
                let is_out_of_stock;
                let is_out_of_print;

                if (availability_id == 2) {
                    is_out_of_print = true;
                } else if (availability_id == 21 || availability_id == 22 || availability_id == 12) {
                    is_out_of_stock = true;
                } else if (availability_id == 20) { //pre-order
                    current_offer = mongoose.Types.ObjectId("5a04423d83536d7069b10c8f");
                }

                Product.findOne({
                    import_id: importId
                }, {
                    price: 1,
                    previous_price: 1,
                    discount_rate: 1,
                    is_out_of_print: 1,
                    is_out_of_stock: 1,
                    current_offer: 1
                })
                    .exec()
                    .then(product => {
                        if (product != null) {
                            product.price = price;
                            product.previous_price = previous_price;
                            product.discount_rate = discount;
                            product.is_out_of_print = is_out_of_print;
                            product.is_out_of_stock = is_out_of_stock;
                            product.current_offer = current_offer;
                            product.updated_by = mongoose.Types.ObjectId("5a658361e579ee753600f753");

                            product.save(status => {
                                resolve(product);
                            })
                        } else {
                            reject()
                        }


                    })
            })
        })
        return Promise.all(updated_info);
    }

    function updateProductInfoDesc(rows) {


        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                console.log("bookSummary")

                let importId = parseInt(row['Product ID'].trim());
                let bookSummary = row['Book Summery'];

                console.log("bookSummary")


                if (importId == 146295) {
                    console.log("bookSummary")
                    console.log(bookSummary)
                    console.log(typeof bookSummary)
                }


                if (bookSummary) {

                    Product.findOne({
                        import_id: importId
                    })
                        .exec()
                        .then(product => {
                            if (product != null) {
                                product.lang[0].content.description = bookSummary;
                                product.updated_by = mongoose.Types.ObjectId("5a658361e579ee753600f753");

                                product.save(status => {


                                    resolve(product);
                                })
                            } else {
                                reject()
                            }
                        })
                } else {
                    reject()
                }

            })
        })
        return Promise.all(updated_info);
    }

    /* #endregion */




    /* #region DOWNLOAD IMAGE  */

    // router.route('/download-image-import')
    //   .get((req, res) => {


    //     workbook.xlsx.readFile('islamic_books.xlsx')
    //       .then(function () {
    //         var worksheet = workbook.getWorksheet(1);
    //         var rows = worksheet._rows;
    //         var importId = new Array();
    //         var row;
    //         var x;
    //         var count = 0;
    //         rows.forEach(function (value, i) {
    //           row = worksheet.getRow(i + 1);
    //           importId[i] = parseFloat(row.getCell(1).value);
    //         });

    //         //console.log(importId.length)

    //         Product.aggregate([{
    //           $match: {
    //             "import_id": {
    //               $in: importId
    //             }
    //           },
    //         },

    //         {
    //           $project: {
    //             import_id: "$import_id",
    //             name_en: "$name",
    //             image: "$image.250X360",

    //           }
    //         }

    //         ])
    //           .exec((err, product) => {
    //             console.log('product.length')
    //             console.log(product.length)


    //             res.json(product)

    //             var time = 3000;
    //             var count = 0;
    //             product.forEach(function (element, i) {

    //               setTimeout(
    //                 function () {

    //                   ////console.log("a")
    //                   var first = element.image;

    //                   if (first) {
    //                     var second = first.split('250X360/')[1];

    //                     //Download Images

    //                     var img = 'https://d1jpltibqvso3j.cloudfront.net' + first + '';
    //                     var image = img.replace('250X360', 'image');
    //                     var file = 'import-images/' + second + ''; //Create 'import-images' folder in 'boibazar' folder
    //                     download(image, file, function () {
    //                       console.log('done');
    //                     });
    //                   }
    //                 }, time
    //               )
    //               time += 3000;
    //               count++;
    //             });

    //           });

    //       })

    //     // res.json("I Download")

    //   });

    /* #endregion */


    /* #region EXCEL BOOK INFO  */

    // router.route("/excel-book-info")
    //   .get((req, res) => {

    //     workbook.xlsx.readFile('islamic_books.xlsx')
    //       .then(function () {
    //         var worksheet = workbook.getWorksheet(1);
    //         var rows = worksheet._rows;
    //         var importId = new Array();
    //         var row;
    //         var x;
    //         var count = 0;
    //         rows.forEach(function (value, i) {
    //           row = worksheet.getRow(i + 1);
    //           importId[i] = parseInt(row.getCell(1).value);
    //         });

    //         res.json({
    //           data: importId
    //         })
    //         console.log(typeof importId[0])
    //         console.log(importId[0])

    //         Product.aggregate([{
    //               $match: {
    //                 "import_id": {
    //                   $in: importId
    //                 }
    //               },
    //             },
    //             {
    //               $unwind: {
    //                 "path": "$lang",
    //                 "preserveNullAndEmptyArrays": true
    //               }
    //             },
    //             {
    //               $unwind: {
    //                 "path": "$accessories",
    //                 "preserveNullAndEmptyArrays": true
    //               }
    //             },
    //             {
    //               $project: {
    //                 import_id: "$import_id",
    //                 name_en: "$name",
    //                 name_bn: "$lang.content.name",
    //                 seo_url: "$seo_url",
    //                 author_en: {
    //                   $arrayElemAt: ["$accessories.authors_en.name", 0]
    //                 },
    //                 author_bn: {
    //                   $arrayElemAt: ["$accessories.authors_bn.name", 0]
    //                 },
    //                 author_import_id: {
    //                   $arrayElemAt: ["$accessories.authors_bn.import_id", 0]
    //                 },
    //                 publisher_en: "$accessories.publisher_en.name",
    //                 publisher_bn: "$accessories.publisher_bn.name",
    //                 publisher_import_id: "$accessories.publisher_bn.import_id",

    //                 category_one: {
    //                   $arrayElemAt: ["$accessories.categories_bn.name", 0]
    //                 },
    //                 category_two: {
    //                   $arrayElemAt: ["$accessories.categories_bn.name", 1]
    //                 },
    //                 category_three: {
    //                   $arrayElemAt: ["$accessories.categories_bn.name", 2]
    //                 },
    //                 category_one_import_id: {
    //                   $arrayElemAt: ["$accessories.categories_bn.import_id", 0]
    //                 },
    //                 category_two_import_id: {
    //                   $arrayElemAt: ["$accessories.categories_bn.import_id", 1]
    //                 },
    //                 category_three_import_id: {
    //                   $arrayElemAt: ["$accessories.categories_bn.import_id", 2]
    //                 },
    //                 book_language: "$book_language",
    //                 previous_price: "$previous_price",
    //                 price: "$price",
    //                 description: {
    //                   $cond: [{
    //                       $ifNull: ['$lang.content.description', false]
    //                     }, // if
    //                     true, // then
    //                     false // else
    //                   ]
    //                 },
    //                 priority: "$priority",
    //                 preview_images: {
    //                   $size: "$preview_images"
    //                 },
    //                 isbn: "$isbn"
    //               }
    //             }

    //           ])
    //           .exec((err, product) => {

    //             console.log(product.length)


    //             product.forEach(function (element, i) {
    //               var row = worksheet.getRow(i + 1);


    //               row.getCell(1).value = element.import_id;
    //               row.getCell(2).value = element.name_en;
    //               row.getCell(3).value = element.name_bn;
    //               row.getCell(4).value = element.author_en;
    //               row.getCell(5).value = element.author_bn;
    //               row.getCell(6).value = element.publisher_en;
    //               row.getCell(7).value = element.publisher_bn;
    //               row.getCell(8).value = element.category_one;
    //               row.getCell(9).value = element.category_two;
    //               row.getCell(10).value = element.category_three;
    //               row.getCell(11).value = element.previous_price;
    //               row.getCell(12).value = element.price;
    //               row.getCell(13).value = element.priority;

    //               row.getCell(14).value = element.seo_url;
    //               row.getCell(15).value = element.preview_images;

    //               if (element.description) {
    //                 row.getCell(16).value = "Yes";
    //               } else {
    //                 row.getCell(16).value = "No";
    //               }
    //               row.getCell(17).value = element.book_language;
    //               row.getCell(18).value = element.isbn;

    //               row.getCell(19).value = element.author_import_id;

    //               row.getCell(20).value = element.publisher_import_id;

    //               row.getCell(21).value = element.category_one_import_id;
    //               row.getCell(22).value = element.category_two_import_id;
    //               row.getCell(23).value = element.category_three_import_id;

    //               // Category, Author and Publisher Import ID  Needed



    //               row.commit();
    //             });


    //             console.log("AAAA");
    //             return workbook.xlsx.writeFile('islamic_book_result.xlsx');
    //           });

    //       })

    //     // res.json({
    //     //   data: importId
    //     // })
    //   });


    /* #endregion */

    /* #region PRIORITY SET PRODUCT*/

    // router.route("/batch-update/priority-set")
    //   .get((req, res) => {

    //     const XLSX = require('xlsx');
    //     const workbook = XLSX.readFile('Final_List.xlsx');
    //     const mylist = workbook.SheetNames;
    //     var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));
    //     var count = 0;
    //     //console.log(myJson);
    //     myJson.forEach(element => {

    //       Product.findOne({
    //         'import_id': element.ID,
    //         'preview_images':
    //         {
    //             '$exists': true,
    //             '$not': {$size: 0}
    //          }
    //         })
    //         .select({
    //           import_id: 1,
    //           priority: 1
    //         })
    //         .exec()
    //         .then(info => {
    //           if (info) {
    //             //console.log(element.Priority)
    //             // info.priority = 11000;
    //             info.priority = element.Priority;
    //             info.save();
    //           }
    //         });

    //     });

    //     res.json("Success ");

    //   });

    /* #endregion */



    /* #region PRIORITY SET category*/

    // router.route("/batch-update/priority-set-category")
    //   .get((req, res) => {

    //     const XLSX = require('xlsx');
    //     const workbook = XLSX.readFile('cat-priority.xlsx');
    //     const mylist = workbook.SheetNames;
    //     var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));
    //     var count = 0;
    //    // console.log(myJson);
    //     myJson.forEach(element => {
    //       Category.findOne({
    //         'import_id': element.import_id,
    //         })
    //         .select({
    //           import_id: 1,
    //           priority: 1
    //         })
    //         .exec()
    //         .then(info => {
    //           if (info) {
    //             info.priority =parseInt(element.priority) ;
    //             info.save();
    //           }
    //         });
    //     });

    //     res.json({
    //       message: "Success ",
    //       data: myJson
    //     });
    //   });

    /* #endregion */


    /* #region PRIORITY SET by  seo_url  */
    // router.route("/batch-update/priority-set-seo")
    //   .get((req, res) => {

    //     const XLSX = require('xlsx');
    //     const workbook = XLSX.readFile('priority2019.xlsx');
    //     const mylist = workbook.SheetNames;
    //     var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));
    //     var count = 0;
    //    // //console.log(myJson);
    //     myJson.forEach(element => {



    //       Product.findOne({
    //           'seo_url': element.url
    //         })
    //         .select({
    //           seo_url: 1,
    //           priority: 1
    //         })
    //         .exec()
    //         .then(info => {

    //           if (info) {
    //             //console.log(element.priority)
    //             // info.priority = 11000;
    //             info.priority = element.priority;
    //             info.save();
    //           }
    //         });

    //     });

    //     res.json("Success ");

    //   });
    /* #endregion */





    /* #region Category Set to a Product */

    // router.route("/batch-update/category-set")
    //   .get((req, res) => {

    //     const XLSX = require('xlsx');
    //     const workbook = XLSX.readFile('Program.xlsx');
    //     const mylist = workbook.SheetNames;
    //     var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));

    //     //console.log(myJson);
    //     myJson.forEach(element => {



    //       Product.findOne({
    //           'seo_url': element.seo_url
    //         })
    //         .select({
    //           category: 1
    //         })
    //         .exec()
    //         .then(info => {
    //          // //console.log(info)
    //           if (info && info.category) {

    //             info.category.push(mongoose.Types.ObjectId("5c4daae786c1255b4035eb52"));
    //             info.save();
    //           }
    //         });

    //     });

    //     res.json("Success ");

    //   });

    /* #endregion */

    /* #region Common Point for Excel File import/export */
    router.route("/batch-update/common-update")
        .get((req, res) => {

            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('muktijuddho.xlsx');
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));
            var myJson2 = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[1]]));


            // console.log(myJson)


            // updateProductAuthor(myJson2)
            //   .then(items => {
            //     res.json(items);
            //   })
            //   .catch(err => {
            //     res.json({
            //       success: false,
            //       err: err
            //     })
            //   })

        });


    //Parenting 
    function updateCategory(rows) {
        console.log(rows)
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let _id = mongoose.Types.ObjectId(row._id);;
                let parent_id = mongoose.Types.ObjectId(row.parent_id);

                Category.update({ _id: _id }, { $addToSet: { parents: parent_id } })
                    .exec()
                    .then(status => {
                        Category.update({ _id: parent_id }, { $addToSet: { children: _id } })
                            .exec()
                            .then(stat => {
                                resolve(stat)
                            })
                        //console.log(status)
                    })
            })
        })
        return Promise.all(updated_info);
    }


    // Category Merge
    function updateProductCategory(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let main_id = row.main_id;
                let category_ids = row.id_to_marge.split('#');

                //console.log(main_id)
                //console.log(category_ids)
                Product.update({
                    category: {
                        $in: category_ids
                    }
                }, {
                    $push: {
                        category: main_id
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        return Product.update({
                            category: {
                                $in: category_ids
                            }
                        }, {
                            $pull: {
                                category: {
                                    $in: category_ids
                                }
                            },
                        }, {
                            multi: true
                        })
                            .exec()
                            .then(status => {
                                return Category.update({
                                    _id: {
                                        $in: category_ids
                                    }
                                }, {
                                    $set: {
                                        is_enabled: false
                                    }
                                }, {
                                    multi: true
                                })
                                    .exec()
                                    .then(status => {
                                        //console.log(status)
                                        resolve(status)
                                    })
                            })
                            .catch(err => {
                                reject(err);
                            })

                    })

            })
        })
        return Promise.all(updated_info);
    }

    // Author Merge
    function updateProductAuthor(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let main_id = row.main_id;
                let author_ids = row.id_to_marge.split('#');

                Product.update({
                    author: {
                        $in: author_ids
                    }
                }, {
                    $push: {
                        author: main_id
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        return Product.update({
                            author: {
                                $in: author_ids
                            }
                        }, {
                            $pull: {
                                author: {
                                    $in: author_ids
                                }
                            },
                        }, {
                            multi: true
                        })
                            .exec()
                            .then(status => {
                                return Author.update({
                                    _id: {
                                        $in: author_ids
                                    }
                                }, {
                                    $set: {
                                        is_enabled: false
                                    }
                                }, {
                                    multi: true
                                })
                                    .exec()
                                    .then(status => {
                                        //console.log(status)
                                        resolve(status)
                                    })
                            })
                            .catch(err => {
                                reject(err);
                            })

                    })

            })
        })
        return Promise.all(updated_info);
    }

    // Publisher Merge
    function updateProductPublisher(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let main_id = row.main_id;
                let publisher_id = row.id_to_marge.split('#');

                //console.log(main_id)
                //console.log(category_ids)
                Product.update({
                    publisher: publisher_id
                }, {
                    $set: {
                        publisher: main_id
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        return Publisher.update({
                            _id: publisher_id
                        }, {
                            $set: {
                                is_enabled: false
                            }
                        }, {
                            multi: true
                        })
                            .exec()
                            .then(status => {
                                //console.log(status)
                                resolve(status)
                            })
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(updated_info);
    }

    /* #endregion */

    /* #region Category Disable */

    // router.route("/batch-update/category-disable")
    //   .get((req, res) => {

    //     const XLSX = require('xlsx');
    //     const workbook = XLSX.readFile('category_marge.xlsx');
    //     const mylist = workbook.SheetNames;
    //     var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));
    //     var myJson2 = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[1]]));

    //     //  //console.log(myJson)
    //     disableCategory(myJson)
    //       .then(items => {
    //         res.json(items);
    //       })
    //       .catch(err => {
    //         res.json({
    //           success: false,
    //           err: err
    //         })
    //       })

    //   });




    // function disableCategory(rows) {
    //   let updated_info = rows.map(row => {
    //     return new Promise((resolve, reject) => {
    //       let main_id = row._id;


    //       Category.update({
    //           _id: {
    //             $in: main_id
    //           }
    //         }, {
    //           $set: {
    //             is_enabled: false
    //           }
    //         }, {
    //           multi: true
    //         })
    //         .exec()
    //         .then(status => {
    //           //console.log(status)
    //           resolve(status)
    //         })


    //     })
    //   })
    //   return Promise.all(updated_info);
    // }
    /* #endregion */

    /* #region Accessories Update  */


    // var toSkip = 0;
    // var toLimit = 10000;




    //   router.route('/bulk-update/product-accessories')
    //     .get((req, res) => {

    //       //console.log("new Date('2019', '01','01')")
    //       //console.log(new Date('2018', '12','01')) //Give 1 month earlier date



    //       Product.find({
    //         "updated_at": { $gte : new Date('2018', '12','01')}
    //       })
    //         .select({
    //           author: 1,
    //           category: 1,
    //           publisher: 1
    //         })
    //         .populate({
    //           path: "author",
    //           select: "name seo_url import_id lang"
    //         })
    //         .populate({
    //           path: "category",
    //           select: "name seo_url import_id lang"
    //         })
    //         .populate({
    //           path: "publisher",
    //           select: "name seo_url import_id lang"
    //         })
    //         .skip(toSkip)
    //         .limit(toLimit)
    //         .exec()
    //         .then(product => {
    //           //console.log(toSkip, toLimit);

    //           // //console.log("Count Product")
    //           // //console.log(product.length)

    //           res.json('product')
    //           toSkip += 10000;
    //           return makeAccessories(product)
    //         })
    //         .then(obj => {
    //           res.json({
    //             updated: obj.length
    //           });
    //         })
    //         .catch(err => {
    //           res.send(err);
    //         })
    //     })

    function makeAccessories(products) {
        var updates = products.map(product => {
            return new Promise((resolve, reject) => {
                let accessories = {
                    categories_en: [],
                    categories_bn: [],
                    authors_en: [],
                    authors_bn: [],
                    publisher_en: new Object(),
                    publisher_bn: new Object()
                };
                product.author.map(athr => {
                    accessories.authors_en.push({
                        name: athr.name,
                        seo_url: athr.seo_url,
                        import_id: athr.import_id
                    })
                    accessories.authors_bn.push({
                        name: athr.lang[0].content.name,
                        seo_url: athr.lang[0].content.seo_url,
                        import_id: athr.import_id
                    })
                })
                product.category.map(ctgr => {
                    accessories.categories_en.push({
                        name: ctgr.name,
                        seo_url: ctgr.seo_url,
                        import_id: ctgr.import_id
                    })
                    accessories.categories_bn.push({
                        name: ctgr.lang[0].content.name,
                        seo_url: ctgr.lang[0].content.seo_url,
                        import_id: ctgr.import_id
                    })
                })
                accessories.publisher_en = {
                    name: product.publisher.name,
                    seo_url: product.publisher.seo_url,
                    import_id: product.publisher.import_id
                }
                accessories.publisher_bn = {
                    name: product.publisher.lang[0].content.name,
                    seo_url: product.publisher.lang[0].content.seo_url,
                    import_id: product.publisher.import_id
                }
                Product.update({
                    _id: product._id
                }, {
                    $set: {
                        accessories: accessories
                    }
                })
                    .exec()
                    .then(what => {
                        //console.log(what)
                        resolve(what);
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })
        return Promise.all(updates)
    }
    /* #endregion */

    /* #region Book Count */

    // let toKip = 0;
    // router.route('/category-update/book-list')
    //   .get((req, res) => {
    //     Category.find({})
    //       .skip(toKip)
    //       .limit(500)
    //       .exec()
    //       .then(categories => {
    //         return updateCategoryBookList(categories)
    //       })
    //       .then(updates => {
    //         toKip += 500;
    //         res.json(updates);
    //       })
    //   })

    // function updateCategoryBookList(categories) {
    //   let updated = categories.map(category => {
    //     return new Promise((resolve, reject) => {
    //       Product.find({
    //           category: category._id
    //         }).select({
    //           author: 1,
    //           category: 1,
    //           publisher: 1
    //         })
    //         .then(prd => {
    //           return Category.update({
    //             _id: category._id
    //           }, {
    //             $set: {
    //               book_count: prd.length
    //             }
    //           })
    //         })
    //         .then(catg => {
    //           //console.log(catg)
    //           resolve({
    //             updated: true
    //           })
    //         })
    //         .catch(err => {
    //           resolve(err);
    //         })
    //     })

    //   })
    //   return Promise.all(updated);
    // }

    /* #endregion */

    /* #region Purchase and Sales Product wise  */

    router.route('/product-wise-sales-report')
        .get((req, res) => {

            var Excel = require("exceljs");
            var workbook = new Excel.Workbook();
            var worksheet = workbook.addWorksheet('My Sheet', {
                properties: {
                    showGridLines: false
                }
            })
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': 'OrderClosed'
                }
            },

            {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: "$products.product_id",
                    total_book: {
                        $sum: '$products.quantity'
                    },
                    total_price: {
                        $sum: '$products.price'
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    'name': '$product.name',
                    'import_id': '$product.import_id',
                    'publisher': '$product.accessories.publisher_en.name',
                    'total_book': '$total_book',
                    'total_price': '$total_price'
                }
            }
            ])
                .exec()
                .then(result => {

                    result.forEach(function (element, i) {
                        var row = worksheet.getRow(i + 1);

                        row.getCell(1).value = element.import_id;
                        row.getCell(2).value = element.name;

                        row.getCell(3).value = element.publisher;
                        row.getCell(4).value = element.total_book;
                        row.getCell(5).value = element.total_price;

                        row.commit();


                    });

                    console.log("DONNEE");
                    return workbook.xlsx.writeFile('sales_product_report.xlsx');

                    res.json(result);
                })
        })


    router.route('/product-wise-purchase-report')
        .get((req, res) => {

            var Excel = require("exceljs");
            var workbook = new Excel.Workbook();
            var worksheet = workbook.addWorksheet('My Sheet', {
                properties: {
                    showGridLines: false
                }
            })
            Purchase.aggregate([

                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: "$products.product_id",
                        total_book: {
                            $sum: '$products.quantity'
                        },
                        total_price: {
                            $sum: '$products.price'
                        }
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        'name': '$product.name',
                        'import_id': '$product.import_id',
                        'publisher': '$product.accessories.publisher_en.name',
                        'total_book': '$total_book',
                        'total_price': '$total_price'
                    }
                }
            ])
                .exec()
                .then(result => {

                    result.forEach(function (element, i) {
                        var row = worksheet.getRow(i + 1);

                        row.getCell(1).value = element.import_id;
                        row.getCell(2).value = element.name;

                        row.getCell(3).value = element.publisher;
                        row.getCell(4).value = element.total_book;
                        row.getCell(5).value = element.total_price;

                        row.commit();


                    });

                    console.log("DONNEE");
                    return workbook.xlsx.writeFile('purchase_product_report.xlsx');

                    // res.json(result);
                })
        })
    /* #endregion */

    /* #region Update Soundex Extra  */

    var toSkip = 0;
    var toLimit = 10000;
    router.route("/batch-update/soundex-extra")
        .get((req, res) => {
            Product.find({
                'name': { $in: [/ Fi /, / Fo /, / Fe /, / Fa /, / Fu /, / fi /, / fo /, / fe /, / fa /, / fu /, / ri /, / ro /, / re /, / ra /, / ru /, / Ri /, / Ro /, / Re /, / Ra /, / Ru /] }
            })
                .select({
                    name: 1,
                    soundex_code: 1
                })
                .skip(toSkip)
                // .limit(toLimit)
                .exec()
                .then(products => {


                    // toSkip += 10000;
                    //return updateSoundexExtra(products);
                })
                .then(result => {
                    // console.log(toSkip)

                    // res.writeHead(302, {
                    //     'Location': 'http://192.168.8.49:3000/api/batch-update/soundex-extra'
                    // });
                    // res.end();

                    res.json({
                        success: true,
                        //result: result,
                        //   skip: toSkip
                    })
                })
        });

    function updateSoundexExtra(products) {
        var updates = products.map(product => {
            return new Promise((resolve, reject) => {

                var regExpr = /[^a-zA-Z0-9-. ]/g;
                let nameString;
                if (product.name) {
                    nameString = (product.name).replace(regExpr, " ");
                    let soundex_ex = soundexUpdate(nameString);
                    product.soundex_code = soundex_ex;
                    product.save();
                }
                resolve(product);
            })
        })
        return Promise.all(updates)
    }


    /* #endregion */

    /* #region Update Name and seo-url */

    router.route("/batch-update/name-seo")
        .get((req, res) => {

            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('rokomari_seo_url_correction.xlsx');
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));


            //console.log(myJson)
            // updateNameSeo(myJson)
            //   .then(items => {
            //     res.json(items);
            //   })
            //   .catch(err => {
            //     res.json({
            //       success: false,
            //       err: err
            //     })
            //   })

        });

    function updateNameSeo(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {
                let main_id = row._id;
                let import_id = row.import_id;
                let book_name_en = row.name_en;
                let book_name_bn = row.name_bn;
                let mod_seo_url = createSeo(book_name_en)


                console.log(import_id)
                console.log(book_name_en)
                console.log(book_name_bn)
                console.log(mod_seo_url)



                Product.update({
                    import_id: import_id
                }, {
                    $set: {
                        name: book_name_en,
                        'lang[0].content.name': book_name_bn,
                        seo_url: mod_seo_url
                    }
                }, {
                    multi: true
                })
                    .exec()
                    .then(status => {
                        //console.log(status)
                        resolve(status)
                    })


            })
        })
        return Promise.all(updated_info);
    }

    function createSeo(name) {
        let default_slug = name.toLowerCase();
        default_slug = default_slug.replace(/[&\/\\#,+()$~%.|'":*?<>{}]/g, '');;
        default_slug = default_slug.replace(/ /g, "-");

        return default_slug;
    }

    /* #endregion */





    /* #region Update NAME FROM and SEO-URL*/

    // router.route("/batch-update/order-seo")
    //   .get((req, res) => {
    //     Order.aggregate([{
    //       $match: {
    //         $and: [
    //           {'total_book':{$ne:1} },
    //           {'order_string_date': {$in: ['2019-3-23','2019-3-22','2019-3-21','2019-3-20']}},
    //           {'current_order_status.status_name': {$in:['Pending', 'Confirmed']}},
    //           {'is_paid':false}
    //           ]
    //       },
    //     },
    //     {
    //       $project: {
    //         product: '$products',
    //         order_no: '$order_no',
    //         discount:"$discount",
    //         delivery_charge:"$delivery_charge",
    //         wrapping_charge:"$wrapping_charge",
    //         payable_amount:"$payable_amount"
    //       }
    //     }
    //     ])
    //       .exec((err, product) => {
    //         updateOrderId(product)
    //           .then(items => {
    //             let problems=items.filter(itm=>{if(itm.updatedpayable==true){
    //               return itm.order_no
    //             }})
    //             res.json(problems);
    //           })
    //           .catch(err => {
    //             res.json({
    //               success: false,
    //               err: err
    //             })
    //           })
    //       })
    //   });

    function updateOrderId(orders) {
        let updated_info = orders.map(order => {
            return new Promise((resolve, reject) => {

                updateProductInfo(order.product)
                    .then(result => {
                        let total_price = 0
                        result.map(rslt => {
                            total_price += (rslt.price * rslt.quantity)
                        })
                        let payable_amount = total_price + order.delivery_charge + order.wrapping_charge - order.discount;
                        resolve({
                            order_no: order.order_no,
                            curr_payable_amount: order.payable_amount,
                            payable_amount: payable_amount,
                            updatedpayable: payable_amount != order.payable_amount
                        })
                        Order.update({
                            _id: order._id
                        }, {
                            $set: {
                                products: result
                            }
                        })
                            .exec()
                            .then(res => {
                                resolve(res)
                            })
                    })
                    .catch(err => {
                        res.json({
                            success: false,
                            err: err
                        })
                    })
            })
        })
        return Promise.all(updated_info);
    }

    function updateProductInfo(products) {
        let updated_info = products.map(product => {
            return new Promise((resolve, reject) => {


                console.log(product)

                // Product.findOne({
                //   _id: product
                // })
                //   .exec()
                //   .then(prod => {
                //     if (prod && prod._id) {
                //       let new_product = {
                //         "send": product.send,
                //         "is_out_of_stock": product.is_out_of_stock,
                //         "arrives_in_stock": product.arrives_in_stock,
                //         "is_out_of_print": product.is_out_of_print,
                //         "is_info_delay": product.is_info_delay,
                //         "info_delayed": product.info_delayed,
                //         "product_id": prod._id,
                //         "price": prod.price,
                //         "name": product.name,
                //         "image": product.image,
                //         "publisher": prod.accessories.publisher_en.name,
                //         "quantity": product.quantity
                //       }
                //       resolve(new_product)
                //     } else {
                //       resolve(product)
                //     }
                //   })




            })
        })
        return Promise.all(updated_info);
    }

    /* #endregion */




    /* #region Update Orders change */

    // router.route("/batch-update/order-change")
    //   .get((req, res) => {
    //     Order.aggregate([{
    //       $match: {
    //         order_no: 109817
    //         // $and: [
    //         //   {'total_book':{$ne:1} },
    //         //   {'order_string_date': {$in: ['2019-3-23','2019-3-22','2019-3-21','2019-3-20']}},
    //         //   {'current_order_status.status_name': {$in:['Pending', 'Confirmed']}},
    //         //   {'is_paid':false}
    //         //   ]
    //       },
    //     },
    //     {
    //       $project: {
    //         product: '$products',
    //         order_no: '$order_no',
    //         discount:"$discount",
    //         delivery_charge:"$delivery_charge",
    //         wrapping_charge:"$wrapping_charge",
    //         payable_amount:"$payable_amount"
    //       }
    //     }
    //     ])
    //       .exec((err, orders) => {
    //         updateOrderId(orders)
    //           .then(items => {
    //             res.json(items);
    //           })
    //           .catch(err => {
    //             res.json({
    //               success: false,
    //               err: err
    //             })
    //           })
    //       })
    //   });

    function updateOrderId(orders) {
        let updated_info = orders.map(order => {
            return new Promise((resolve, reject) => {
                updateProductInfo(order.product)
                    .then(result => {
                        let total_price = 0
                        result.map(rslt => {
                            total_price += (rslt.price * rslt.quantity)
                        })
                        let payable_amount_mod = total_price + order.delivery_charge + order.wrapping_charge - order.discount;
                        return Order.update({
                            _id: order._id
                        }, {
                            $set: {
                                products: result,
                                payable_amount: payable_amount_mod,
                                total_price: total_price
                            }
                        })
                    })
                    .then(updt => {
                        resolve(updt);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
        })
        return Promise.all(updated_info);
    }

    function updateProductInfo(products) {
        let updated_info = products.map(product => {
            return new Promise((resolve, reject) => {
                Product.findOne({
                    _id: product.product_id
                })
                    .exec()
                    .then(prod => {
                        if (prod && prod._id) {
                            let new_product = {
                                "send": product.send,
                                "is_out_of_stock": product.is_out_of_stock,
                                "arrives_in_stock": product.arrives_in_stock,
                                "is_out_of_print": product.is_out_of_print,
                                "is_info_delay": product.is_info_delay,
                                "info_delayed": product.info_delayed,
                                "product_id": product.product_id,
                                "price": prod.price,
                                "name": prod.name,
                                "image": prod.image['120X175'],
                                "publisher": prod.accessories.publisher_en.name,
                                "quantity": product.quantity
                            }
                            resolve(new_product)
                        } else {
                            resolve(product)
                        }
                    })
            })
        })
        return Promise.all(updated_info);
    }


    /* #endregion */

    let duplicates = [];
    let uniques = [];
    let colName = 'O';
    router.route("/get-import/folder-name")
        .get((req, res) => {
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('look-insider.xlsx');
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));
            getDuplicates(myJson)
                .then(items => {

                    const fs = require('fs');
                    fs.writeFile("/checks/duplicates " + colName + ".txt", duplicates, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    fs.writeFile("/checks/uniques " + colName + ".txt", uniques, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    res.json(duplicates);
                })
                .catch(err => {
                    const fs = require('fs');
                    fs.writeFile("/checks/duplicates " + colName + ".txt", duplicates, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    fs.writeFile("/checks/uniques " + colName + ".txt", uniques, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    res.json({
                        success: false,
                        err: err
                    })
                })
        })

    function getDuplicates(products) {
        let updated_info = products.map(product => {
            return new Promise((resolve, reject) => {

                let import_id = product[colName];
                Product.findOne({
                    import_id: import_id
                }, { preview_images: 1 })
                    .exec()
                    .then(prod => {
                        console.log(prod.preview_images.length)
                        if (prod.preview_images.length > 0) {
                            duplicates.push(import_id)
                            resolve(prod)
                        } else {
                            uniques.push(import_id)
                            resolve(prod)
                        }
                    })
                    .catch(err => {
                        resolve(import_id)
                    })
            })
        })
        return Promise.all(updated_info);
    }





    //Update price according to the DISCOUNT GIVEN

    router.route("/batch-update/price-update")
        .get((req, res) => {

            const XLSX = require('xlsx');
            const workbook = XLSX.readFile('priceupdate.xlsx');
            const mylist = workbook.SheetNames;
            var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));


            console.log(myJson)

            // updatePrice(myJson)
            //   .then(items => {
            //     res.json(items);
            //   })
            //   .catch(err => {
            //     res.json({
            //       success: false,
            //       err: err
            //     })
            //   })

        });

    function updatePrice(rows) {
        let updated_info = rows.map(row => {
            return new Promise((resolve, reject) => {

                let import_id = parseInt(row.import_id);
                let discount_parcent = row.discount;
                let discount = parseInt(discount_parcent.slice(0, -1));
                let new_price;



                console.log(import_id)
                console.log(discount)
                Product.findOne({
                    import_id: import_id
                })
                    .exec()
                    .then(prod => {
                        new_price = Math.round(prod.previous_price * (1 - (discount / 100)));
                        Product.update({
                            import_id: import_id
                        }, {
                            $set: {
                                price: new_price,
                                discount_rate: discount
                            }
                        })
                            .exec()
                            .then(status => {
                                //console.log(status)
                                resolve(status)
                            })
                    })
            })
        })
        return Promise.all(updated_info);
    }


}