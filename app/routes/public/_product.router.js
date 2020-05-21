import Product from "../../models/product.model";
import StockSummary from "../../models/inventory-models/stock-summary.model";
import Orders from "../../models/order.model";
import config from "../../../config/config.json";
import Author from "../../models/author.model";
import Publisher from "../../models/publisher.model";
import SearchHistory from "../../models/search_history.model";
import Category from "../../models/category.model";
import {
    getNewReleases,
    getCategoryProductsByName,
    getFeaturedBarData,
    getDefaultFeaturedBarData,
    levenshteinDistance,
    soundexSen,
    soundexExtra,
    soundex
} from "./api.service.js";
import mongoose from "mongoose";
import {
    ContentChild
} from "@angular/core";
import {
    copySync
} from "fs-extra";
import {
    consoleTestResultHandler
} from "tslint/lib/test";

var ObjectId = require("mongodb").ObjectID;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var imports = [];
var priorities = [];
let searchResponse;

var category_ids_similar;
var product_id_similar;

var granBkashUrl, createBkashUrl, executeBkashUrl;

const ENV = config.ENV;
let bkashLive = false;


if (ENV == 'production' || ENV == 'PRODUCTION' || ENV == 'Production') {
    bkashLive = true;
} else {
    bkashLive = false;
}

    var app_key = "5tunt4masn6pv2hnvte1sb5n3j";
    var app_secret = "1vggbqd4hqk9g96o9rrrp2jftvek578v7d2bnerim12a87dbrrka";
    var username = "sandboxTestUser";
    var password = "hWD@8vtzw0";

    // a.	Wallet number-01770618575
    // b.	Pin-12121
    // c.	OTP-123456

    granBkashUrl =
        "https://checkout.sandbox.bka.sh/v1.0.0-beta/checkout/token/grant";
    createBkashUrl =
        "https://checkout.sandbox.bka.sh/v1.0.0-beta/checkout/payment/create";
    executeBkashUrl =
        "https://checkout.sandbox.bka.sh/v1.0.0-beta/checkout/payment/execute/";


//GLOBAL SAND BKASH
// var app_key = "5tunt4masn6pv2hnvte1sb5n3j";
// var app_secret = "1vggbqd4hqk9g96o9rrrp2jftvek578v7d2bnerim12a87dbrrka";
// var username = "sandboxTestUser";
// var password = "hWD@8vtzw0";

//LIVE INT BKASH
// var app_key = "12m7hbb6gucccadgn7oref7lc7";
// var app_secret = "16elakqlbt7m2ovb3od4eie0bn4de4tv1p322a1p6rgl9430v94h";
// var username = "BOIBAZAR";
// var password = "b0!B@z@rDo1co9";

//Temp INT BKASH
// var app_key = "5nej5keguopj928ekcj3dne8p";
// var app_secret = "1honf6u1c56mqcivtc9ffl960slp4v2756jle5925nbooa46ch62";
// var username = "testdemo";
// var password = "test%#de23@msdao";

var auth_token;
var paymentID;
var array_length;

export default (app, router, cache, jwt) => {
    router.route("/product").post((req, res) => {
        let itemsPerPage = 24; //parseInt(req.cookies.itemForDevice);
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        let pageNum = req.body.pageNum == undefined ? 1 : req.body.pageNum;
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
        let imageSize = "$image." + size;

        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang;
            itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
        }

        var countQuery = Product.find();
        countQuery.where("is_enabled").equals(true);
        if (req.body.authors && req.body.authors.length > 0) {
            countQuery.where("author").in(req.body.authors);
        }
        if (req.body.publishers && req.body.publishers.length > 0) {
            countQuery.where("publisher").in(req.body.publishers);
        }

        if (req.body.categories && req.body.categories.length > 0) {
            countQuery.where("category").in(req.body.categories);
        }
        if (req.body.attributes && req.body.attributes.length > 0) {
            countQuery.where("attributes").in(req.body.attributes);
        }
        if (req.body.price) {
            countQuery
                .where("price")
                .gte(parseInt(req.body.price.greater))
                .lte(parseInt(req.body.price.less));
        }
        if (reqLang == config.DEFAULT_LANGUAGE) {
            countQuery
                .count((err, count) => {
                    return count;
                })
                .then(count => {
                    let condition = {};
                    // condition['is_enabled'] = { $eq: true };
                    if (req.body.authors && req.body.authors.length > 0) {
                        var author_ids = req.body.authors.map(function (authorId) {
                            return mongoose.Types.ObjectId(authorId);
                        });
                        condition["author"] = {
                            $in: author_ids
                        };
                    }

                    if (req.body.publishers && req.body.publishers.length > 0) {
                        var publisher_ids = req.body.publishers.map(function (publisherId) {
                            return mongoose.Types.ObjectId(publisherId);
                        });
                        condition["publisher"] = {
                            $in: publisher_ids
                        };
                    }

                    if (req.body.attributes && req.body.attributes.length > 0) {
                        condition["attributes"] = {
                            $in: req.body.attributes
                        };
                    }

                    if (req.body.categories && req.body.categories.length > 0) {
                        var category_ids = req.body.categories.map(function (categoryId) {
                            return mongoose.Types.ObjectId(categoryId);
                        });
                        condition["category"] = {
                            $in: category_ids
                        };
                    }
                    if (req.body.price) {
                        condition["price"] = {
                            $gte: parseInt(req.body.price.greater),
                            $lte: parseInt(req.body.price.less)
                        };
                    }

                    condition["priority"] = {
                        $ne: 100
                    };
                    let mergeItem = [];
                    getSortedFilterData(
                        reqLang,
                        condition,
                        imageSize,
                        itemsPerPage,
                        pageNum
                    )
                        .then(sortedProduct => {
                            mergeItem = mergeItem.concat(sortedProduct);
                            itemsPerPage = itemsPerPage - sortedProduct.length;
                            delete condition.priority;
                            return getRandomFilterData(
                                reqLang,
                                condition,
                                imageSize,
                                itemsPerPage,
                                pageNum
                            );
                        })
                        .then(randomProduct => {
                            mergeItem = mergeItem.concat(randomProduct);
                            res.json({
                                items: mergeItem,
                                count: count
                            });
                        });
                });
        } else {
            countQuery
                .count((err, count) => {
                    return count;
                })
                .then(count => {
                    let condition = {
                        "lang.code": reqLang
                    };
                    condition["is_enabled"] = {
                        $eq: true
                    };
                    if (req.body.authors && req.body.authors.length > 0) {
                        var author_ids = req.body.authors.map(function (authorId) {
                            return mongoose.Types.ObjectId(authorId);
                        });
                        condition["author"] = {
                            $in: author_ids
                        };
                    }

                    if (req.body.publishers && req.body.publishers.length > 0) {
                        var publisher_ids = req.body.publishers.map(function (publisherId) {
                            return mongoose.Types.ObjectId(publisherId);
                        });
                        condition["publisher"] = {
                            $in: publisher_ids
                        };
                    }

                    if (req.body.attributes && req.body.attributes.length > 0) {
                        condition["attributes"] = {
                            $in: req.body.attributes
                        };
                    }

                    if (req.body.categories && req.body.categories.length > 0) {
                        var category_ids = req.body.categories.map(function (categoryId) {
                            return mongoose.Types.ObjectId(categoryId);
                        });
                        condition["category"] = {
                            $in: category_ids
                        };
                    }
                    if (req.body.price) {
                        condition["price"] = {
                            $gte: parseInt(req.body.price.greater),
                            $lte: parseInt(req.body.price.less)
                        };
                    }
                    condition["priority"] = {
                        $ne: 100
                    };
                    let mergeItem = [];
                    getSortedFilterData(
                        reqLang,
                        condition,
                        imageSize,
                        itemsPerPage,
                        pageNum
                    )
                        .then(sortedProduct => {
                            mergeItem = mergeItem.concat(sortedProduct);
                            itemsPerPage = itemsPerPage - sortedProduct.length;
                            delete condition.priority;
                            return getRandomFilterData(
                                reqLang,
                                condition,
                                imageSize,
                                itemsPerPage,
                                pageNum
                            );
                        })
                        .then(randomProduct => {
                            mergeItem = mergeItem.concat(randomProduct);
                            res.json({
                                items: mergeItem,
                                count: count
                            });
                        });
                });
        }
    });

    function getSortedFilterData(
        reqLang,
        condition,
        imageSize,
        itemsPerPage,
        pageNum
    ) {
        return new Promise((resolve, reject) => {
            if (reqLang == config.DEFAULT_LANGUAGE) {
                Product.aggregate([{
                    $match: condition
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "publisher",
                        foreignField: "_id",
                        as: "publisher"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "current_offer",
                        foreignField: "_id",
                        as: "current_offer"
                    }
                },
                {
                    $unwind: "$publisher"
                },
                {
                    $project: {
                        image: imageSize,
                        previous_price: "$previous_price",
                        price: "$price",
                        name: "$name",
                        seo_url: "$seo_url",
                        free_delivery: "$free_delivery",
                        priority: "$priority",
                        is_out_of_stock: "$is_out_of_stock",
                        is_out_of_print: "$is_out_of_print",
                        current_offer: {
                            $arrayElemAt: ["$current_offer.image", 0]
                        },
                        categoryObj: {
                            _id: {
                                $arrayElemAt: ["$category._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$category.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$category.seo_url", 0]
                            }
                        },

                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$author._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$author.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$author.seo_url", 0]
                            }
                        },

                        publisher: {
                            _id: "$publisher._id",
                            name: "$publisher.name",
                            seo_url: "$publisher.seo_url"
                        }
                    }
                },
                {
                    $sort: {
                        priority: 1
                    }
                }
                ])
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, product) => {
                        if (err) {
                            let no_item = [];
                            resolve(no_item);
                        } else {
                            resolve(product);
                        }
                    });
            } else {
                Product.aggregate([{
                    $match: condition
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "publisher",
                        foreignField: "_id",
                        as: "publisher"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "current_offer",
                        foreignField: "_id",
                        as: "current_offer"
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $unwind: "$publisher"
                },
                {
                    $unwind: "$publisher.lang"
                },
                {
                    $project: {
                        image: imageSize,
                        previous_price: "$previous_price",
                        price: "$price",
                        name: "$lang.content.name",
                        free_delivery: "$free_delivery",
                        seo_url: "$seo_url",
                        priority: "$priority",
                        is_out_of_stock: "$is_out_of_stock",
                        is_out_of_print: "$is_out_of_print",
                        current_offer: {
                            $arrayElemAt: ["$current_offer.image", 0]
                        },
                        categoryObj: {
                            _id: {
                                $arrayElemAt: ["$category._id", 0]
                            },
                            name: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$category.lang.content.name", 0]
                                },
                                    0
                                ]
                            },
                            seo_url: {
                                $arrayElemAt: ["$category.seo_url", 0]
                            }

                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$category.lang.content.seo_url", 0] }, 0] }
                        },

                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$author._id", 0]
                            },
                            name: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$author.lang.content.name", 0]
                                },
                                    0
                                ]
                            },
                            seo_url: {
                                $arrayElemAt: ["$author.seo_url", 0]
                            }

                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$author.lang.content.seo_url", 0] }, 0] }
                        },

                        publisher: {
                            _id: "$publisher._id",
                            name: "$publisher.lang.content.name",
                            seo_url: "$publisher.seo_url"

                            // seo_url: "$publisher.lang.content.seo_url"
                        }
                    }
                },
                {
                    $sort: {
                        priority: 1
                    }
                }
                ])
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, product) => {
                        if (err) {
                            let no_item = [];
                            resolve(no_item);
                        } else {
                            resolve(product);
                        }
                    });
            }
        });
    }

    function getRandomFilterData(
        reqLang,
        condition,
        imageSize,
        itemsPerPage,
        pageNum
    ) {
        return new Promise((resolve, reject) => {
            if (reqLang == config.DEFAULT_LANGUAGE) {
                Product.aggregate([{
                    $match: condition
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "publisher",
                        foreignField: "_id",
                        as: "publisher"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "current_offer",
                        foreignField: "_id",
                        as: "current_offer"
                    }
                },
                {
                    $unwind: "$publisher"
                },
                {
                    $project: {
                        image: imageSize,
                        previous_price: "$previous_price",
                        price: "$price",
                        name: "$name",
                        seo_url: "$seo_url",
                        free_delivery: "$free_delivery",
                        priority: "$priority",
                        current_offer: {
                            $arrayElemAt: ["$current_offer.image", 0]
                        },
                        categoryObj: {
                            _id: {
                                $arrayElemAt: ["$category._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$category.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$category.seo_url", 0]
                            }
                        },

                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$author._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$author.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$author.seo_url", 0]
                            }
                        },

                        publisher: {
                            _id: "$publisher._id",
                            name: "$publisher.name",
                            seo_url: "$publisher.seo_url"
                        }
                    }
                }
                ])
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, product) => {
                        if (err) {
                            let no_item = [];
                            resolve(no_item);
                        } else {
                            resolve(product);
                        }
                    });
            } else {
                Product.aggregate([{
                    $match: condition
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "publisher",
                        foreignField: "_id",
                        as: "publisher"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "current_offer",
                        foreignField: "_id",
                        as: "current_offer"
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $unwind: "$publisher"
                },
                {
                    $unwind: "$publisher.lang"
                },
                {
                    $project: {
                        image: imageSize,
                        previous_price: "$previous_price",
                        price: "$price",
                        name: "$lang.content.name",
                        free_delivery: "$free_delivery",
                        seo_url: "$seo_url",
                        priority: "$priority",
                        current_offer: {
                            $arrayElemAt: ["$current_offer.image", 0]
                        },
                        categoryObj: {
                            _id: {
                                $arrayElemAt: ["$category._id", 0]
                            },
                            name: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$category.lang.content.name", 0]
                                },
                                    0
                                ]
                            },
                            seo_url: {
                                $arrayElemAt: ["$category.seo_url", 0]
                            }

                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$category.lang.content.seo_url", 0] }, 0] }
                        },

                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$author._id", 0]
                            },
                            name: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$author.lang.content.name", 0]
                                },
                                    0
                                ]
                            },
                            seo_url: {
                                $arrayElemAt: ["$author.seo_url", 0]
                            }

                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$author.lang.content.seo_url", 0] }, 0] }
                        },

                        publisher: {
                            _id: "$publisher._id",
                            name: "$publisher.lang.content.name",
                            seo_url: "$publisher.seo_url"

                            // seo_url: "$publisher.lang.content.seo_url"
                        }
                    }
                }
                ])
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, product) => {
                        if (err) {
                            let no_item = [];
                            resolve(no_item);
                        } else {
                            resolve(product);
                        }
                    });
            }
        });
    }


    //Stock Count
    router.route("/stock-check/:_id")
        .put((req, res) => {
            StockSummary.findOne({
                product_id: mongoose.Types.ObjectId(req.params._id)
            })
                .then(result => {
                    // console.log()
                    if (result) {
                        let count = (result.opening_stock + result.total_purchase + result.total_return) - result.total_sales;
                        if (count > 0) {
                            res.json({
                                success: true,
                                stockCount: count
                            })
                        } else {
                            res.json({
                                success: false
                            })
                        }
                    } else {
                        res.json({
                            success: false
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        success: false,
                        error: err
                    })
                })
        })

    //Hit Counter
    router.route("/hit-update/:seo_url")
        .put((req, res) => {
            Product.update({
                seo_url: req.params.seo_url
            }, {
                $inc: {
                    hit_count: 1
                }
            })
                .exec()
                .then(inf => {
                    res.json({ success: true })
                })
                .catch(err => {
                    res.json(err)
                })
        })

    router.route("/product/:id").put((req, res) => {
        Product.findOne({
            _id: req.params.id
        })
            .exec()
            .then(product => {
                let token = req.cookies.token || req.headers["token"];
                jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
                    if (err) {
                        res.json({
                            success: false,
                            message: "Your login session has expired, please login again"
                        });
                    } else {
                        let user = decoded; //user;
                        if (!user._id) {
                            user = decoded._doc;
                        }
                        if (checkReviewed(product.reviews, user)) {
                            res.json({
                                success: false,
                                message: "You have already reviewed this item"
                            });
                        } else {
                            if (req.body.speech && req.body.rate) {
                                let reviewData = {
                                    user_id: user._id,
                                    username: user.name,
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    review_at: new Date(),
                                    review_speech: req.body.speech,
                                    rate: req.body.rate,
                                    approved: false
                                };

                                product.reviews.unshift(reviewData);

                                var rates = product.rates == undefined ? [] : product.rates;
                                var rating_count =
                                    product.rating_count == undefined ? 0 : product.rating_count;
                                var rating_avg =
                                    product.rating_avg == undefined ? 0 : product.rating_avg;

                                let ratingData = {
                                    user_id: user._id,
                                    username: user.name,
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    rate_at: new Date(),
                                    rate: req.body.rate
                                };

                                calculateRating(rates, rating_count, ratingData).then(
                                    rating_info => {
                                        product.rates = rating_info.rates;
                                        product.rating_avg = rating_info.rating_avg;
                                        product.rating_count = rating_info.rate_count;
                                        return product.save(err => {
                                            if (err) {
                                                ////console.log(err);
                                                res.send(err);
                                            } else {
                                                let permited_reviews = product.reviews.filter(
                                                    review => {
                                                        return (
                                                            review.user_id == user._id || review.approved
                                                        );
                                                    }
                                                );
                                                product.reviews = permited_reviews;
                                                return res.send(product);
                                            }
                                        });
                                    }
                                );
                            }
                        }
                    }
                });
            });
    });

    router.route("/product/update-review/:id").put((req, res) => {
        let token = req.cookies.token || req.headers["token"];
        jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: "Your login session has expired, please login again"
                });
            } else {
                let user = decoded; //user;
                if (!user._id) {
                    user = decoded._doc;
                }
                updateReview(req).then(rev => {
                    if (rev.success) {
                        Product.findOne({
                            _id: req.params.id
                        })
                            .select({
                                reviews: 1,
                                rating_count: 1,
                                rating_avg: 1,
                                review_approved_counter: 1
                            })
                            .exec()
                            .then(product => {
                                let permited_reviews = product.reviews.filter(review => {
                                    return review.user_id == user._id || review.approved;
                                });
                                product.reviews = permited_reviews;
                                res.json(product);
                            });
                    } else {
                        res.json({
                            status: false
                        });
                        return false;
                    }
                });
            }
        });
    });

    function updateReview(req) {
        return new Promise((resolve, reject) => {
            Product.update({
                _id: req.params.id,
                "reviews._id": req.body._id
            }, {
                $set: {
                    "reviews.$.review_speech": req.body.speech,
                    "reviews.$.rate": req.body.rate
                }
            })
                .exec()
                .then(info => {
                    resolve({
                        success: true
                    });
                })
                .catch(err => {
                    resolve({
                        success: false
                    });
                });
        });
    }

    router.route("/author-books/:seo_url").get((req, res) => {
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
        let imageSize = "$image." + size;
        let publisherLogoSize = "$publisher.logo." + size;
        let authorImage = {
            $arrayElemAt: ["$author.image." + size, 0]
        };
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        let pageNum = req.headers["pageNum"] ? parseInt(req.headers["pageNum"]) : 1;
        let itemPerPage = 35; //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 8;
        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang || "bn";
            itemPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
        }
        let results = {
            products: [],
            totalProduct: 0
        };
        if (reqLang == config.DEFAULT_LANGUAGE) {
            Author.aggregate([{
                $match: {
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    image: imageSize,
                    seo_url: "$seo_url",
                    description: "$description",
                    meta_tag_title: "$meta_tag_title",
                    meta_tag_description: "$meta_tag_description",
                    meta_tag_keywords: "$meta_tag_keywords"
                }
            }
            ])
                .exec()
                .then(authorArray => {
                    if (
                        authorArray &&
                        Array.isArray(authorArray) &&
                        authorArray.length > 0
                    ) {
                        let condition = {
                            $or: [{
                                author: {
                                    $in: [authorArray[0]._id]
                                }
                            },
                            {
                                translator: {
                                    $in: [authorArray[0]._id]
                                }
                            },
                            {
                                editor: {
                                    $in: [authorArray[0]._id]
                                }
                            },
                            {
                                composer: {
                                    $in: [authorArray[0]._id]
                                }
                            }
                            ],

                            is_enabled: {
                                $eq: true
                            }
                        };

                        let authorId = authorArray[0]._id;
                        req.book_list_of = authorId;
                        let searchParam = {
                            lang: reqLang,
                            pageNum: pageNum,
                            imageSize: imageSize,
                            itemPerPage: itemPerPage,
                            publisherLogoSize: publisherLogoSize,
                            authorImage: authorImage
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count({
                                    $or: [{
                                        author: {
                                            $in: [authorArray[0]._id]
                                        }
                                    },
                                    {
                                        translator: {
                                            $in: [authorArray[0]._id]
                                        }
                                    },
                                    {
                                        editor: {
                                            $in: [authorArray[0]._id]
                                        }
                                    },
                                    {
                                        composer: {
                                            $in: [authorArray[0]._id]
                                        }
                                    }
                                    ],
                                    is_enabled: true
                                })
                                    .exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                return getFeaturedBarData(Author, req);
                            })
                            .then(featuredBarData => {
                                res.json({
                                    type: "author",
                                    data: authorArray[0],
                                    products: results.products,
                                    filter_data: featuredBarData,
                                    count: results.totalProduct
                                });
                            });
                    } else {
                        getDefaultFeaturedBarData(req).then(featuredBarData => {
                            res.json({
                                type: "author",
                                data: {},
                                products: [],
                                filter_data: featuredBarData,
                                count: 0
                            });
                        });
                    }
                });
        } else {
            Author.aggregate([{
                $match: {
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                }
            },
            {
                $unwind: "$lang"
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$lang.content.name",
                    image: imageSize,
                    seo_url: "$seo_url",
                    description: "$lang.content.description",
                    import_id: "$import_id",
                    meta_tag_title: "$lang.content.meta_tag_title",
                    meta_tag_description: "$lang.content.meta_tag_description",
                    meta_tag_keywords: "$lang.content.meta_tag_keywords"
                }
            }
            ])
                .exec()
                .then(authorArray => {
                    if (
                        authorArray &&
                        Array.isArray(authorArray) &&
                        authorArray.length > 0
                    ) {
                        let condition = {
                            "lang.code": reqLang,
                            $or: [{
                                author: {
                                    $in: [authorArray[0]._id]
                                }
                            },
                            {
                                translator: {
                                    $in: [authorArray[0]._id]
                                }
                            },
                            {
                                editor: {
                                    $in: [authorArray[0]._id]
                                }
                            },
                            {
                                composer: {
                                    $in: [authorArray[0]._id]
                                }
                            }
                            ],
                            is_enabled: {
                                $eq: true
                            }
                        };
                        let searchParam = {
                            lang: reqLang,
                            pageNum: pageNum,
                            imageSize: imageSize,
                            itemPerPage: itemPerPage,
                            publisherLogoSize: publisherLogoSize,
                            authorImage: authorImage
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count({
                                    $or: [{
                                        author: {
                                            $in: [authorArray[0]._id]
                                        }
                                    },
                                    {
                                        translator: {
                                            $in: [authorArray[0]._id]
                                        }
                                    },
                                    {
                                        editor: {
                                            $in: [authorArray[0]._id]
                                        }
                                    },
                                    {
                                        composer: {
                                            $in: [authorArray[0]._id]
                                        }
                                    }
                                    ],
                                    is_enabled: true
                                })
                                    .exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                let authorId = authorArray[0]._id;
                                req.book_list_of = authorId;
                                //   return getFeaturedBarData(Author, req);
                                // })
                                // .then(featuredBarData => {
                                res.json({
                                    type: "author",
                                    data: authorArray[0],
                                    products: results.products,
                                    //  filter_data: featuredBarData,
                                    count: results.totalProduct
                                });
                            });
                    } else {
                        getDefaultFeaturedBarData(req).then(featuredBarData => {
                            res.json({
                                type: "author",
                                data: {},
                                products: [],
                                filter_data: featuredBarData,
                                count: 0
                            });
                        });
                    }
                });
        }
    });

    router.route("/publisher-books/:seo_url").get((req, res) => {
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
        let imageSize = "$image." + size;
        let publisherLogoSize = "$logo." + "140X140";
        let authorImage = {
            $arrayElemAt: ["$author.image." + size, 0]
        };
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        let pageNum = req.headers["pageNum"] ? parseInt(req.headers["pageNum"]) : 1;
        let itemPerPage = 35; //parseInt(req.cookies.itemForDevice);
        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang;
            itemPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
        }
        let results = {
            products: [],
            totalProduct: 0
        };
        if (reqLang == config.DEFAULT_LANGUAGE) {
            Publisher.aggregate([{
                $match: {
                    is_enabled: true,
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        page_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    image: publisherLogoSize,
                    seo_url: "$seo_url",
                    description: "$description",
                    meta_tag_title: "$meta_tag_title",
                    meta_tag_description: "$meta_tag_description",
                    meta_tag_keywords: "$meta_tag_keywords"
                }
            }
            ])
                .exec()
                .then(publisher => {
                    if (publisher && Array.isArray(publisher) && publisher.length > 0) {
                        let condition = {
                            publisher: publisher[0]._id,
                            is_enabled: {
                                $eq: true
                            }
                        };
                        let searchParam = {
                            lang: reqLang,
                            pageNum: pageNum,
                            imageSize: imageSize,
                            itemPerPage: itemPerPage,
                            publisherLogoSize: publisherLogoSize,
                            authorImage: authorImage
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count({
                                    publisher: publisher[0]._id,
                                    is_enabled: true
                                }).exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                req.book_list_of = publisher[0]._id;
                                //   return getFeaturedBarData(Publisher, req);
                                // })
                                // .then(featuredBarData => {
                                res.json({
                                    type: "publisher",
                                    data: publisher[0],
                                    products: results.products,
                                    //   filter_data: featuredBarData,
                                    count: results.totalProduct
                                });
                            });
                    } else {
                        getDefaultFeaturedBarData(req).then(featuredBarData => {
                            res.json({
                                type: "publisher",
                                data: {},
                                products: [],
                                filter_data: featuredBarData,
                                count: 0
                            });
                        });
                    }
                });
        } else {
            Publisher.aggregate([{
                $match: {
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                }
            },
            {
                $unwind: "$lang"
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$lang.content.name",
                    image: publisherLogoSize,
                    seo_url: "$seo_url",
                    import_id: "$import_id",
                    description: "$lang.content.description",
                    meta_tag_title: "$lang.content.meta_tag_title",
                    meta_tag_description: "$lang.content.meta_tag_description",
                    meta_tag_keywords: "$lang.content.meta_tag_keywords",
                    author: "$author"
                }
            }
            ])
                .exec()
                .then(publisher => {

                    if (publisher && Array.isArray(publisher) && publisher.length > 0) {
                        let condition;
                        let searchParam;

                        if (!publisher[0].author) {

                            condition = {
                                "lang.code": reqLang,
                                publisher: publisher[0]._id,
                                is_enabled: {
                                    $eq: true
                                }
                            };
                            searchParam = {
                                lang: reqLang,
                                pageNum: pageNum,
                                imageSize: imageSize,
                                itemPerPage: itemPerPage,
                                publisherLogoSize: publisherLogoSize,
                                authorImage: authorImage,
                            };


                            getSeoUrlSearchItems(condition, searchParam)
                                .then(products => {

                                    results.products = products;
                                    return Product.count()
                                        .where("publisher")
                                        .equals(publisher[0]._id)
                                        .where("is_enabled")
                                        .equals(true)
                                        .exec();
                                })
                                .then(totalProduct => {
                                    results.totalProduct = totalProduct;
                                    req.book_list_of = publisher[0]._id;
                                    res.json({
                                        type: "publisher",
                                        data: publisher[0],
                                        products: results.products,
                                        count: results.totalProduct
                                    });
                                });

                        } else {
                            condition = {
                                "lang.code": reqLang,
                                author: publisher[0].author,
                                is_enabled: {
                                    $eq: true
                                }
                            };
                            searchParam = {
                                lang: reqLang,
                                pageNum: pageNum,
                                imageSize: imageSize,
                                itemPerPage: itemPerPage,
                                publisherLogoSize: publisherLogoSize,
                                authorImage: authorImage,
                                authorId: publisher.author
                            };

                            //console.log("aaa")

                            getSeoUrlSearchItems(condition, searchParam)
                                .then(products => {
                                    results.products = products;
                                    return Product.count()
                                        .where("author")
                                        .equals(publisher[0].author)
                                        .where("is_enabled")
                                        .equals(true)
                                        .exec();
                                })
                                .then(totalProduct => {
                                    results.totalProduct = totalProduct;
                                    req.book_list_of = publisher[0].author;
                                    res.json({
                                        type: "author",
                                        data: publisher[0],
                                        products: results.products,
                                        count: results.totalProduct
                                    });
                                });

                        }

                    } else {
                        Publisher.aggregate([{
                            $match: {

                                page_url: new RegExp(req.params.seo_url, "i")

                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $project: {
                                _id: "$_id",
                                name: "$lang.content.name",
                                image: publisherLogoSize,
                                seo_url: "$seo_url",
                                import_id: "$import_id",
                                description: "$lang.content.description",
                                meta_tag_title: "$lang.content.meta_tag_title",
                                meta_tag_description: "$lang.content.meta_tag_description",
                                meta_tag_keywords: "$lang.content.meta_tag_keywords",
                                author: "$author"
                            }
                        }
                        ])
                            .exec()
                            .then(publisher => {
                                if (publisher && Array.isArray(publisher) && publisher.length > 0) {
                                    let condition;
                                    let searchParam;

                                    if (!publisher[0].author) {

                                        condition = {
                                            "lang.code": reqLang,
                                            publisher: publisher[0]._id,
                                            is_enabled: {
                                                $eq: true
                                            }
                                        };
                                        searchParam = {
                                            lang: reqLang,
                                            pageNum: pageNum,
                                            imageSize: imageSize,
                                            itemPerPage: itemPerPage,
                                            publisherLogoSize: publisherLogoSize,
                                            authorImage: authorImage,
                                        };


                                        getSeoUrlSearchItems(condition, searchParam)
                                            .then(products => {

                                                results.products = products;
                                                return Product.count()
                                                    .where("publisher")
                                                    .equals(publisher[0]._id)
                                                    .where("is_enabled")
                                                    .equals(true)
                                                    .exec();
                                            })
                                            .then(totalProduct => {
                                                results.totalProduct = totalProduct;
                                                req.book_list_of = publisher[0]._id;
                                                res.json({
                                                    type: "publisher",
                                                    data: publisher[0],
                                                    products: results.products,
                                                    count: results.totalProduct
                                                });
                                            });

                                    } else {
                                        condition = {
                                            "lang.code": reqLang,
                                            author: publisher[0].author,
                                            is_enabled: {
                                                $eq: true
                                            }
                                        };
                                        searchParam = {
                                            lang: reqLang,
                                            pageNum: pageNum,
                                            imageSize: imageSize,
                                            itemPerPage: itemPerPage,
                                            publisherLogoSize: publisherLogoSize,
                                            authorImage: authorImage,
                                            authorId: publisher.author
                                        };

                                        //console.log("aaa")

                                        getSeoUrlSearchItems(condition, searchParam)
                                            .then(products => {
                                                results.products = products;
                                                return Product.count()
                                                    .where("author")
                                                    .equals(publisher[0].author)
                                                    .where("is_enabled")
                                                    .equals(true)
                                                    .exec();
                                            })
                                            .then(totalProduct => {
                                                results.totalProduct = totalProduct;
                                                req.book_list_of = publisher[0].author;
                                                res.json({
                                                    type: "author",
                                                    data: publisher[0],
                                                    products: results.products,
                                                    count: results.totalProduct
                                                });
                                            });

                                    }

                                } else {
                                    getDefaultFeaturedBarData(req).then(featuredBarData => {
                                        res.json({
                                            type: "publisher",
                                            data: {},
                                            products: [],
                                            filter_data: featuredBarData,
                                            count: 0
                                        });
                                    });
                                }
                            });
                    }
                });
        }
    });

    router.route("/category-books/:seo_url").get(
        // (req, res, next) => {
        //   let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        //   let device = req.device.type;
        //   let pageNum = req.headers["pageNum"] ?
        //     parseInt(req.headers["pageNum"]) :
        //     1;

        //   if (req.headers["app-device"]) {
        //     device = JSON.parse(req.headers["app-device"]);
        //     reqLang = device.lang || req.headers["lang"] || "bn";
        //   }

        //   res.express_redis_cache_name = `category-books-${
        //     req.params.seo_url
        //   }-${reqLang}-${device}-${pageNum}`;
        //   next();
        // },
        // cache.route(43200),
        (req, res) => {
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            let itemPerPage = 35; //parseInt(req.cookies.itemForDevice);
            if (req.headers["app-device"]) {
                let appDevice = JSON.parse(req.headers["app-device"]);
                reqLang = appDevice.lang;
                itemPerPage = appDevice.itemForDevice ?
                    parseInt(appDevice.itemForDevice) :
                    8;
            }
            let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
            let pageNum = req.headers["pageNum"] ?
                parseInt(req.headers["pageNum"]) :
                1;
            let imageSize = "$image." + size;
            let publisherLogoSize = "$publisher.logo." + size;
            let authorImage = {
                $arrayElemAt: ["$author.image." + size, 0]
            };

            let results = {
                products: [],
                totalProduct: 0
            };

            Category.aggregate([{
                $match: {
                    is_enabled: true,
                    "lang.code": reqLang,
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                }
            },
            {
                $unwind: "$lang"
            },
            {
                $project: {
                    name: "$lang.content.name",
                    seo_url: "$seo_url",
                    children: "$children",
                    meta_tag_title: "$meta_tag_title",
                    meta_tag_description: "$meta_tag_description",
                    meta_tag_keywords: "$meta_tag_keywords",
                    banner: "$banner"
                }
            }
            ])
                .exec()
                .then(result => {

                    if (result && Array.isArray(result) && result.length > 0) {
                        let category = result[0];
                        var category_ids = category.children.map(function (categoryId) {
                            return mongoose.Types.ObjectId(categoryId);
                        });
                        category_ids.push(mongoose.Types.ObjectId(category._id));
                        let condition = {
                            "lang.code": reqLang,
                            category: {
                                $in: category_ids
                            },
                            is_enabled: {
                                $eq: true
                            }
                        };
                        let searchParam = {
                            lang: reqLang,
                            pageNum: pageNum,
                            imageSize: imageSize,
                            itemPerPage: itemPerPage,
                            publisherLogoSize: publisherLogoSize,
                            authorImage: authorImage
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count()
                                    .where("category")
                                    .in(category_ids)
                                    .where("is_enabled")
                                    .equals(true)
                                    .exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                req.book_list_of = category._id;
                                //   return getFeaturedBarData(Category, req, category_ids);
                                // })
                                // .then(featuredBarData => {
                                res.json({
                                    type: "category",
                                    data: {
                                        _id: category._id,
                                        name: category.name,
                                        seo_url: category.seo_url,
                                        banner: category.banner,
                                        children: category.children,
                                        meta_tag_title: category.meta_tag_title,
                                        meta_tag_description: category.meta_tag_description,
                                        meta_tag_keywords: category.meta_tag_keywords
                                    },
                                    products: results.products,
                                    // filter_data: featuredBarData,
                                    count: results.totalProduct
                                });
                            });
                    } else {
                        getDefaultFeaturedBarData(req).then(featuredBarData => {
                            res.json({
                                type: "category",
                                data: {},
                                products: [],
                                filter_data: featuredBarData,
                                count: 0
                            });
                        });
                    }
                });

        }
    );

    router.route("/onscroll-pagination/:books_of/:seo_url")
        .get((req, res) => {
            let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
            let imageSize = "$image." + size;
            let publisherLogoSize = "$publisher.logo." + size;
            let authorImage = {
                $arrayElemAt: ["$author.image." + size, 0]
            };
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            let pageNum = req.headers["pagenum"] ? parseInt(req.headers["pagenum"]) : 1;

            let itemPerPage = 35; //parseInt(req.cookies.itemForDevice);
            if (req.headers["app-device"]) {
                let device = JSON.parse(req.headers["app-device"]);
                reqLang = device.lang;
                itemPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
            }
            let results = {
                products: [],
                totalProduct: 0
            };
            let books_of = req.params.books_of;
            let searchParam = {
                lang: reqLang,
                pageNum: pageNum,
                imageSize: imageSize,
                itemPerPage: itemPerPage,
                publisherLogoSize: publisherLogoSize,
                authorImage: authorImage
            };

            if (books_of == "category-books") {
                Category.findOne({
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                })
                    .exec()
                    .then(category => {
                        var category_ids = category.children.map(function (categoryId) {
                            return mongoose.Types.ObjectId(categoryId);
                        });
                        category_ids.push(mongoose.Types.ObjectId(category._id));
                        let condition = {
                            category: {
                                $in: category_ids
                            },
                            is_enabled: {
                                $eq: true
                            }
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count({
                                    category: {
                                        $in: category_ids
                                    },
                                    is_enabled: true
                                }).exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                res.json(results);
                            });
                    });
            }

            if (books_of == "publisher-books") {
                Publisher.findOne({
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                })
                    .exec()
                    .then(publisher => {
                        let condition = {
                            publisher: publisher._id,
                            is_enabled: {
                                $eq: true
                            }
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count({
                                    publisher: publisher._id,
                                    is_enabled: true
                                }).exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                res.json(results);
                            });
                    });
            }

            if (books_of == "author-books") {
                Author.findOne({
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                })
                    .exec()
                    .then(author => {
                        let condition = {
                            author: {
                                $in: [author._id]
                            },
                            is_enabled: {
                                $eq: true
                            }
                        };
                        getSeoUrlSearchItems(condition, searchParam)
                            .then(products => {
                                results.products = products;
                                return Product.count({
                                    $or: [{
                                        author: {
                                            $in: [author._id]
                                        }
                                    },
                                    {
                                        translator: {
                                            $in: [author._id]
                                        }
                                    }
                                    ],
                                    is_enabled: true
                                }).exec();
                            })
                            .then(totalProduct => {
                                results.totalProduct = totalProduct;
                                res.json(results);
                            });
                    });
            }
        });

    function getSeoUrlSearchItems(searchCond, searchParam) {
        return new Promise((resolve, reject) => {


            searchCond["priority"] = {
                $ne: 100
            };
            Product.aggregate([{
                $match: searchCond
            },
            {
                $lookup: {
                    from: "offers",
                    localField: "current_offer",
                    foreignField: "_id",
                    as: "current_offer"
                }
            },
            {
                $unwind: "$lang"
            },
            {
                $unwind: "$accessories"
            },
            {
                $project: {
                    image: searchParam.imageSize,
                    preview_images: {
                        $size: "$preview_images"
                    },
                    previous_price: "$previous_price",
                    price: "$price",
                    free_delivery: "$free_delivery",
                    name: "$lang.content.name",
                    seo_url: "$seo_url",
                    priority: "$priority",
                    is_out_of_stock: "$is_out_of_stock",
                    is_out_of_print: "$is_out_of_print",
                    current_offer: {
                        $arrayElemAt: ["$current_offer.image", 0]
                    },
                    categoryObj: {
                        _id: {
                            $arrayElemAt: ["$accessories.categories_bn._id", 0]
                        },
                        name: {
                            $arrayElemAt: ["$accessories.categories_bn.name", 0]
                        },
                        seo_url: {
                            $arrayElemAt: ["$accessories.categories_bn.seo_url", 0]
                        }
                    },

                    authorObj: {
                        _id: {
                            $arrayElemAt: ["$accessories.authors_bn._id", 0]
                        },
                        name: {
                            $arrayElemAt: ["$accessories.authors_bn.name", 0]
                        },
                        seo_url: {
                            $arrayElemAt: ["$accessories.authors_bn.seo_url", 0]
                        },

                        image: searchParam.authorImage
                    },

                    publisher: {
                        _id: "$accessories.publisher_bn._id",
                        name: "$accessories.publisher_bn.name",
                        seo_url: "$accessories.publisher_bn.seo_url"
                    }
                }
            },
            {
                $sort: {
                    priority: 1
                }
            }
            ])
                .skip(searchParam.itemPerPage * (searchParam.pageNum - 1))
                .limit(searchParam.itemPerPage)
                .exec()
                .then(result => {
                    if (result.length < searchParam.itemPerPage) {
                        searchParam.selectedId = result.map(rslt => {
                            return rslt._id;
                        });
                        searchParam.itemPerPage = searchParam.itemPerPage - result.length;
                        delete searchCond.priority;
                        getRandomSeoUrlSearchItems(searchCond, searchParam).then(
                            randoms => {
                                result = result.concat(randoms);
                                resolve(result);
                            }
                        );
                    } else {
                        resolve(result);
                    }
                })
                .catch(err => {
                    resolve([]);
                });

        });
    }



    function getRandomSeoUrlSearchItems(searchCond, searchParam) {
        searchCond["_id"] = {
            $nin: searchParam.selectedId
        };
        return new Promise((resolve, reject) => {
            if (searchParam.lang == config.DEFAULT_LANGUAGE) {
                Product.aggregate([{
                    $match: searchCond
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "current_offer",
                        foreignField: "_id",
                        as: "current_offer"
                    }
                },
                {
                    $unwind: "$accessories"
                },
                {
                    $unwind: "$publisher"
                },
                {
                    $project: {
                        image: searchParam.imageSize,
                        preview_images: {
                            $size: "$preview_images"
                        },
                        previous_price: "$previous_price",
                        price: "$price",
                        name: "$name",
                        seo_url: "$seo_url",
                        priority: "$priority",
                        free_delivery: "$free_delivery",
                        current_offer: {
                            $arrayElemAt: ["$current_offer.image", 0]
                        },
                        categoryObj: {
                            _id: {
                                $arrayElemAt: ["$accessories.categories_bn._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$accessories.categories_bn.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$accessories.categories_bn.seo_url", 0]
                            }
                        },

                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$accessories.authors_bn._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$accessories.authors_bn.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$accessories.authors_bn.seo_url", 0]
                            },

                            image: searchParam.authorImage
                        },

                        publisher: {
                            _id: "$accessories.publisher_bn._id",
                            name: "$accessories.publisher_bn.name",
                            seo_url: "$accessories.publisher_bn.seo_url"
                        }
                    }
                }
                ])
                    .skip(searchParam.itemPerPage * (searchParam.pageNum - 1))
                    .limit(searchParam.itemPerPage)
                    .exec()
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => {
                        resolve([]);
                    });
            } else {
                Product.aggregate([{
                    $match: searchCond
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "publisher",
                        foreignField: "_id",
                        as: "publisher"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "current_offer",
                        foreignField: "_id",
                        as: "current_offer"
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $unwind: "$publisher"
                },
                {
                    $unwind: "$publisher.lang"
                },
                {
                    $project: {
                        image: searchParam.imageSize,
                        preview_images: {
                            $size: "$preview_images"
                        },
                        previous_price: "$previous_price",
                        price: "$price",
                        free_delivery: "$free_delivery",
                        name: "$lang.content.name",
                        seo_url: "$seo_url",
                        priority: "$priority",
                        current_offer: {
                            $arrayElemAt: ["$current_offer.image", 0]
                        },

                        categoryObj: {
                            _id: {
                                $arrayElemAt: ["$category._id", 0]
                            },
                            name: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$category.lang.content.name", 0]
                                },
                                    0
                                ]
                            },
                            seo_url: {
                                $arrayElemAt: ["$category.seo_url", 0]
                            }

                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$category.lang.content.seo_url", 0] }, 0] }
                        },

                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$author._id", 0]
                            },
                            name: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$author.lang.content.name", 0]
                                },
                                    0
                                ]
                            },
                            seo_url: {
                                $arrayElemAt: ["$author.seo_url", 0]
                            },

                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$author.lang.content.seo_url", 0] }, 0] },
                            description: {
                                $arrayElemAt: [{
                                    $arrayElemAt: ["$author.lang.content.description", 0]
                                },
                                    0
                                ]
                            },
                            image: searchParam.authorImage
                        },

                        publisher: {
                            _id: "$publisher._id",
                            name: "$publisher.lang.content.name",
                            seo_url: "$publisher.seo_url",

                            // seo_url: "$publisher.lang.content.seo_url",
                            description: "$publisher.lang.content.description",
                            image: searchParam.publisherLogoSize
                        }
                    }
                }
                ])
                    .skip(searchParam.itemPerPage * (searchParam.pageNum - 1))
                    .limit(searchParam.itemPerPage)
                    .exec()
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => {
                        resolve([]);
                    });
            }
        });
    }

    router.route("/product/search/:terms").get((req, res) => {
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "42X60";
        let imageSize = "$image." + size;
        let expression = ".*" + req.params.terms + ".*";
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang;
        }
        if (reqLang == config.DEFAULT_LANGUAGE) {
            Product.aggregate([{
                $match: {
                    is_enabled: {
                        $eq: true
                    },
                    $or: [{
                        "lang.content.name": {
                            $regex: expression,
                            $options: "i"
                        }
                    },
                    {
                        name: {
                            $regex: expression,
                            $options: "i"
                        }
                    }
                    ]
                }
            },
            {
                $lookup: {
                    from: "authors",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $lookup: {
                    from: "publishers",
                    localField: "publisher",
                    foreignField: "_id",
                    as: "publisher"
                }
            },
            {
                $unwind: "$publisher"
            },
            {
                $project: {
                    image: imageSize,
                    previous_price: "$previous_price",
                    price: "$price",
                    free_delivery: "$free_delivery",
                    name: "$name",
                    seo_url: "$seo_url",
                    authorObj: {
                        name: {
                            $arrayElemAt: ["$author.name", 0]
                        }
                    },
                    auths: {
                        $map: {
                            input: "$author",
                            as: "ath",
                            in: "$$ath._id"
                        }
                    },
                    publisherObj: {
                        name: "$publisher.name"
                    }
                }
            }
            ])
                .limit(10)
                .exec((err, product) => {
                    if (err) res.send(err);
                    else
                        res.json({
                            product: product
                        });
                });
        } else {
            Product.aggregate([{
                $match: {
                    "lang.code": reqLang,
                    is_enabled: {
                        $eq: true
                    },
                    $or: [{
                        "lang.content.name": {
                            $regex: expression,
                            $options: "i"
                        }
                    },
                    {
                        name: {
                            $regex: expression,
                            $options: "i"
                        }
                    }
                    ]
                }
            },
            {
                $lookup: {
                    from: "authors",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $lookup: {
                    from: "publishers",
                    localField: "publisher",
                    foreignField: "_id",
                    as: "publisher"
                }
            },
            {
                $unwind: "$publisher"
            },
            {
                $unwind: "$lang"
            },
            {
                $project: {
                    image: imageSize,
                    previous_price: "$previous_price",
                    price: "$price",
                    free_delivery: "$free_delivery",
                    name: "$lang.content.name",
                    seo_url: "$seo_url",
                    publisherObj: {
                        name: "$publisher.name"
                    },
                    authorObj: {
                        name: {
                            $arrayElemAt: [{
                                $arrayElemAt: ["$author.lang.content.name", 0]
                            },
                                0
                            ]
                        }
                    },
                    auths: {
                        $map: {
                            input: "$author",
                            as: "ath",
                            in: "$$ath._id"
                        }
                    },
                    publ: "$publisher._id"
                }
            }
            ])
                .limit(10)
                .exec((err, product) => {
                    if (err) res.send(err);
                    else
                        res.json({
                            product: product
                        });
                });
        }
    });

    router.route("/product/all-search/:type").get((req, res) => {

        // setTimeout(() => {
        //   SearchHistory.findOne({
        //     // search_string: new RegExp(req.query.term, "i")
        //     search_string: req.query.term
        //   })
        //     .exec()
        //     .then(result => {
        //       if (!result) {
        //         SearchHistory.create({
        //           search_string: req.query.term,
        //           search_response: searchResponse
        //         })
        //       } else {
        //         if (result.string_count != undefined) {
        //           result.string_count = result.string_count + 1;
        //           result.save();
        //         }
        //         if (!result.search_response) {
        //           result.search_response = searchResponse;
        //           result.save();
        //         }
        //       }
        //     })
        // }, 5000);

        let pagenum = 1;
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";

        let searchType = req.params.type || "products";
        let imageSize = "$image." + size;
        let publisherLogoSize = "$logo." + size;
        let expression = req.query.term;

        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang;
        }
        let params = {
            reqLang: reqLang,
            imageSize: imageSize,
            expression: expression,
            publisherLogoSize: publisherLogoSize,
            pagenum: pagenum
        };
        let items = [];
        if (expression && expression != "" && expression.length > 0) {
            if (searchType == "products") {
                getProducts(params).then(products => {
                    res.json(products);
                });
            } else if (searchType == "authors") {
                getAuthors(params).then(authors => {
                    res.json(authors);
                });
            } else if (searchType == "publishers") {
                getPublishers(params).then(publishers => {
                    res.json(publishers);
                });
            } else if (searchType == "categories") {
                getCategories(params).then(categories => {
                    res.json(categories);
                });
            } else {
                res.json(items);
            }
        } else {
            res.json(items);
        }
    });

    router.route("/search-result/:searchType").get((req, res) => {
        let pagenum = req.query.pageNum ? parseInt(req.query.pageNum) : 2;
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
        let imageSize = "$image." + size;
        let publisherLogoSize = "$logo." + size;
        let terms = req.query.terms;

        var expression = terms;
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";

        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang;
        }

        let params = {
            reqLang: reqLang,
            imageSize: imageSize,
            expression: expression,
            publisherLogoSize: publisherLogoSize,
            pagenum: pagenum,
            terms: terms
        };

        let items = [];
        if (req.params.searchType == "products") {
            getProducts(params).then(products => {
                res.json(products);
            });
        } else if (req.params.searchType == "authors") {
            getAuthors(params).then(authors => {
                res.json(authors);
            });
        } else if (req.params.searchType == "publishers") {
            getPublishers(params).then(publishers => {
                res.json(publishers);
            });
        } else if (req.params.searchType == "categories") {
            getCategories(params).then(categories => {
                res.json(categories);
            });
        } else {
            res.json([]);
        }
    });

    function getProducts(params) {
        return new Promise((resolve, reject) => {

            //check whether the search string is ENGLISH or BANGLA based on character code 
            if (params.expression.charCodeAt(0) < 2000) { //If ENGLISH 

                //Variable to omit special characters
                var regExpr = /[^a-zA-Z0-9-. ]/g;

                var escape = require("escape-regexp");
                let search_string_escape = escape(params.expression);

                //Removing Special Characters
                var searchString = params.expression.replace(regExpr, "");

                // Preparing the search string to perform like search
                let mainstring = new RegExp(searchString, "i");

                let bookSearchString;
                let authorSearchString = '';

                let firstSearchCondition = {};
                let furtherSearchLength = 12;

                /* #region  For Splitted Words*/
                // var escape = require("escape-regexp");
                // let start = '^' + escape(params.expression);
                // let splittedString = start.split(" ");

                // var final = [];
                // if (splittedString.includes('by')) {
                //   for (let i = 0; i < splittedString.length; i++) {
                //     final[i] = new RegExp(splittedString[i], "i");
                //   }
                // } else {
                //   for (let i = 0; i < splittedString.length; i++) {
                //     final[i] = new RegExp(splittedString[i], "i");
                //   }
                // }

                //check whether Search includes Author name or not
                if (searchString.match(/ by/g) && searchString.split(' by ').length > 1) {

                    let splitString = searchString.split(' by ');
                    bookSearchString = splitString[0];
                    authorSearchString = splitString[1];

                    if (splitString[0].length < 3) {
                        furtherSearchLength = 1;

                        firstSearchCondition = {
                            is_enabled: {
                                $eq: true
                            },
                            //Exact Search
                            name: splitString[0],
                            'accessories.authors_en.name': new RegExp(splitString[1], "i")
                        }
                    } else {
                        firstSearchCondition = {
                            is_enabled: {
                                $eq: true
                            },
                            $or: [{
                                name: search_string_escape
                            },
                            {
                                //Like Search
                                name: new RegExp(splitString[0], "i"),
                                'accessories.authors_en.name': new RegExp(splitString[1], "i")
                            }
                            ]
                        }
                    }
                } else {
                    bookSearchString = searchString;
                    console.log(searchString.length)

                    //check whether the search string length is less than 3 or not
                    if (searchString.length < 3) { //if 'yes' then do an exact search

                        furtherSearchLength = 1;
                        firstSearchCondition = {
                            is_enabled: {
                                $eq: true
                            },
                            //Exact Search
                            name: searchString,
                        }
                    } else { //if 'no' then do a Like search
                        firstSearchCondition = {
                            is_enabled: {
                                $eq: true
                            },
                            $or: [{
                                name: search_string_escape,
                            },
                            {
                                //Like Search
                                name: mainstring,
                            }
                            ]
                        }
                    }
                }
                // Main String Search
                Product.aggregate([{
                    $match: firstSearchCondition
                },
                {
                    $project: {
                        image: params.imageSize,
                        previous_price: "$previous_price",
                        price: "$price",
                        name: "$lang.content.name",
                        engname: "$name",
                        seo_url: "$seo_url",
                        click_url: "book",
                        priority: "$priority",
                        is_out_of_stock: 1,
                        is_out_of_print: 1,
                        current_offer: 1,
                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$accessories.authors_bn._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$accessories.authors_bn.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$accessories.authors_en.seo_url", 0]
                            }
                        }
                    }
                }
                ])
                    .skip(12 * (params.pagenum - 1))
                    .limit(500)
                    .exec()
                    .then(product => {
                        console.log(product.length)
                        //check whether the number of products found from the search is smaller than the maximum capacity(defined) of the web page's number of products
                        if (product.length < furtherSearchLength) {
                            let condition = {};
                            let lmt = 12 - product.length;

                            //Find out the soundex_code

                            var soundex_pre = soundexSen(bookSearchString);
                            var soundex_all = soundex_pre.split(" ")
                                .map(val => {
                                    return new RegExp(val);
                                });

                            if (authorSearchString.length) {
                                condition = {
                                    is_enabled: {
                                        $eq: true
                                    },
                                    $and: [{
                                        'accessories.authors_en.name': new RegExp(authorSearchString, "i")
                                    },
                                    {
                                        $or: [{
                                            soundex_code: {
                                                $all: soundex_all
                                            }
                                        },
                                        {
                                            search_text: {
                                                $regex: params.expression,
                                                $options: "i"
                                            }
                                        }
                                        ]
                                    }
                                    ]
                                };
                            } else {
                                condition = {
                                    is_enabled: {
                                        $eq: true
                                    },

                                    $or: [{
                                        soundex_code: soundex_all
                                    },
                                    {
                                        soundex_code: {
                                            $all: soundex_all
                                        }
                                    },
                                    {
                                        search_text: {
                                            $regex: params.expression,
                                            $options: "i"
                                        }
                                    }
                                    ]
                                };
                            }

                            Product.aggregate([{
                                $match: condition
                            },
                            {
                                $project: {
                                    image: params.imageSize,
                                    previous_price: "$previous_price",
                                    price: "$price",
                                    name: "$lang.content.name",
                                    engname: "$name",
                                    seo_url: "$seo_url",
                                    click_url: "book",
                                    is_out_of_stock: "$is_out_of_stock",
                                    is_out_of_print: "$is_out_of_print",
                                    current_offer: "$current_offer",
                                    authorObj: {
                                        _id: {
                                            $arrayElemAt: ["$accessories.authors_bn._id", 0]
                                        },
                                        name: {
                                            $arrayElemAt: ["$accessories.authors_bn.name", 0]
                                        },
                                        seo_url: {
                                            $arrayElemAt: ["$accessories.authors_en.seo_url", 0]
                                        }
                                    }
                                }
                            },
                            {
                                $sort: {
                                    priority: 1,
                                    name: 1
                                }
                            }
                            ])
                                .limit(500)
                                .exec()
                                .then(soundexResult => {


                                    // var escape = require("escape-regexp");
                                    // let start = escape(params.expression);
                                    let previousResult = product;
                                    product = soundexResult;

                                    //Find Levenstein Distance
                                    let levenResult = [];
                                    product.forEach(element => {
                                        let p = levenshteinDistance(bookSearchString, element.engname);
                                        if (Math.abs(p) < 20) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        } else if (Math.abs(p) < 50) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        } else if (Math.abs(p) < 100) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        } else if (Math.abs(p) < 500) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        }
                                    });

                                    //Sorting According to Leven Distance
                                    heapSort(levenResult);

                                    //Detecting the page number and splicing to limited 12 result
                                    if (params.pagenum > 1) {
                                        levenResult = levenResult.splice(12 * (params.pagenum - 1), 12);
                                    }
                                    levenResult = levenResult.slice(0, 12);

                                    //Merge Exact and Soundex Search results
                                    Array.prototype.push.apply(previousResult, levenResult);

                                    //Make The Unique List from the merged result
                                    var obj = {};
                                    for (var i = 0, len = previousResult.length; i < len; i++) {
                                        obj[previousResult[i]['seo_url']] = previousResult[i];
                                    }
                                    var finalResult = new Array();
                                    for (var key in obj) {
                                        finalResult.push(obj[key]);
                                    }

                                    //Keep Search Response
                                    searchResponse = finalResult.map(function (value) {
                                        let nameObject = {
                                            name_bn: value.name,
                                            name_en: value.engname,
                                        }
                                        return nameObject;
                                    });

                                    //Respond the result
                                    if (finalResult.length > 0) {
                                        resolve(finalResult);
                                    } else {
                                        resolve(finalResult);
                                    }
                                })
                                .catch(err => {
                                    //console.log(err);
                                    let err_data = [];
                                    resolve(err_data);
                                });
                        } else { //IF yes

                            let myprod = [];

                            //check every resultant Data and calculate the levenshteinDistance using 'levenshteinDistance' algorithm
                            //Based on the distances find out the closest matches and keep the results in an array
                            product.forEach(element => {
                                let p = levenshteinDistance(bookSearchString, element.engname);

                                if (Math.abs(p) < 20) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                } else if (Math.abs(p) < 50) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                } else if (Math.abs(p) < 100) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                } else if (Math.abs(p) < 500) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                }
                            });

                            //Sort the the array
                            heapSort(myprod);

                            //Slice the bottom of the array depending on the number of desired result
                            if (params.pagenum > 1) {
                                myprod = myprod.splice(12 * (params.pagenum - 1), 12);
                            }
                            myprod = myprod.slice(0, 12);
                            searchResponse = myprod.map(function (value) {
                                let nameObject = {
                                    name_bn: value.name,
                                    name_en: value.engname,
                                }
                                return nameObject;
                            });
                            if (myprod.length > 0) {
                                resolve(myprod);
                            } else {
                                resolve(myprod);
                            }
                        }
                    })
                    .catch(err => {
                        //console.log(err);
                        let err_data = [];
                        resolve(err_data);
                    });
            }
            //Bangla Search
            else { //If BANGLA 
                var escape = require("escape-regexp");

                //Remove special characters
                let start = escape(params.expression);

                //Split words if more than 1 and keep it in an array
                let splittedString = start.split(" ");
                let banglaInput = escape(params.expression).split(" ");
                var final = [];

                //Prepare every splitted words for like search using regExp
                for (let i = 0; i < splittedString.length; i++) {
                    final[i] = new RegExp(splittedString[i], "i");
                }
                // start = '^' + start;

                //Match the array with Bangla names from the database (limit 500)
                Product.aggregate([{
                    $match: {
                        "lang.code": params.reqLang,
                        is_enabled: {
                            $eq: true
                        },
                        $or: [{
                            "lang.content.name": start,
                            "lang.content.name": {
                                $all: final
                            }
                        }]
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $unwind: "$accessories"
                },
                {
                    $project: {
                        image: params.imageSize,
                        previous_price: "$previous_price",
                        price: "$price",
                        engname: "$name",
                        name: "$lang.content.name",
                        seo_url: "$seo_url",
                        click_url: "book",
                        is_out_of_stock: "$is_out_of_stock",
                        is_out_of_print: "$is_out_of_print",
                        current_offer: "$current_offer",
                        authorObj: {
                            _id: {
                                $arrayElemAt: ["$accessories.authors_bn._id", 0]
                            },
                            name: {
                                $arrayElemAt: ["$accessories.authors_bn.name", 0]
                            },
                            seo_url: {
                                $arrayElemAt: ["$accessories.authors_en.seo_url", 0]
                            }
                        }
                    }
                },
                { $sort: { name: 1 } },
                ])
                    .skip(12 * (params.pagenum - 1))
                    .limit(500)
                    .exec()
                    .then(product => {

                        //check whether any data is found with the initial search 
                        if (product.length < 1) { //if NO

                            //Convert Bangla string to English
                            let englishString = banglaToEnglishConvert(banglaInput);
                            let condition = {};
                            var soundex_pre = soundexSen(englishString);
                            var soundex_all = soundex_pre.split(" ")
                                .map(val => {
                                    return new RegExp(val);
                                });
                            condition = {
                                is_enabled: {
                                    $eq: true
                                },

                                $or: [{
                                    soundex_code: {
                                        $all: soundex_all
                                    }
                                },
                                {
                                    search_text: {
                                        $regex: params.expression,
                                        $options: "i"
                                    }
                                }
                                ]
                            };

                            // Soundex Search
                            Product.aggregate([{
                                $match: condition
                            },
                            {
                                $project: {
                                    image: params.imageSize,
                                    previous_price: "$previous_price",
                                    price: "$price",
                                    name: "$lang.content.name",
                                    engname: "$name",
                                    seo_url: "$seo_url",
                                    click_url: "book",
                                    is_out_of_stock: "$is_out_of_stock",
                                    is_out_of_print: "$is_out_of_print",
                                    current_offer: "$current_offer",
                                    authorObj: {
                                        _id: {
                                            $arrayElemAt: ["$accessories.authors_bn._id", 0]
                                        },
                                        name: {
                                            $arrayElemAt: ["$accessories.authors_bn.name", 0]
                                        },
                                        seo_url: {
                                            $arrayElemAt: ["$accessories.authors_en.seo_url", 0]
                                        }
                                    }
                                }
                            },
                            {
                                $sort: {
                                    priority: 1,
                                    name: 1
                                }
                            }
                            ])
                                .limit(2000)
                                .exec()
                                .then(soundexResult => {
                                    var escape = require("escape-regexp");
                                    let start = escape(params.expression);

                                    let previousResult = product;
                                    product = soundexResult;

                                    //Find Levenstein Distance
                                    let levenResult = [];
                                    product.forEach(element => {
                                        let p = levenshteinDistance(start, element.name[0]);
                                        if (Math.abs(p) < 20) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        } else if (Math.abs(p) < 50) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        } else if (Math.abs(p) < 100) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        } else if (Math.abs(p) < 500) {
                                            element["leven_dist"] = p;
                                            levenResult = levenResult.concat(element);
                                        }
                                    });

                                    //Sorting According to Leven Distance
                                    heapSort(levenResult);

                                    //Detecting the page number and splicing to limited 12 result
                                    if (params.pagenum > 1) {
                                        levenResult = levenResult.splice(12 * (params.pagenum - 1), 12);
                                    }
                                    levenResult = levenResult.slice(0, 12);

                                    //Merge Exact and Soundex Search results
                                    Array.prototype.push.apply(previousResult, levenResult);

                                    //Make The Unique List from the merged result
                                    var obj = {};
                                    for (var i = 0, len = previousResult.length; i < len; i++) {
                                        obj[previousResult[i]['seo_url']] = previousResult[i];
                                    }
                                    var finalResult = new Array();
                                    for (var key in obj) {
                                        finalResult.push(obj[key]);
                                    }

                                    //Keep Search Response
                                    searchResponse = finalResult.map(function (value) {
                                        let nameObject = {
                                            name_bn: value.name,
                                            name_en: value.engname,
                                        }
                                        return nameObject;
                                    });

                                    //Response the result
                                    if (finalResult.length > 0) {
                                        resolve(finalResult);
                                    } else {
                                        resolve(finalResult);
                                    }
                                })
                                .catch(err => {
                                    //console.log(err);
                                    let err_data = [];
                                    resolve(err_data);
                                });

                        } else { //if YES 
                            let myprod = [];

                            //Find Levenstein Distance
                            product.forEach(element => {
                                let p = levenshteinDistance(start, element.engname);

                                if (Math.abs(p) < 20) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                } else if (Math.abs(p) < 50) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                } else if (Math.abs(p) < 100) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                } else if (Math.abs(p) < 500) {
                                    element["leven_dist"] = p;
                                    myprod = myprod.concat(element);
                                }
                            });

                            //Sorting According to Leven Distance
                            heapSort(myprod);

                            //Detecting the page number and splicing to limited 12 result
                            if (params.pagenum > 1) {
                                myprod = myprod.splice(12 * (params.pagenum - 1), 12);
                            }
                            myprod = myprod.slice(0, 12);


                            //Keep Search Response
                            searchResponse = myprod.map(function (value) {
                                let nameObject = {
                                    name_bn: value.name,
                                    name_en: value.engname,
                                }
                                return nameObject;
                            });
                            if (myprod.length > 0) {
                                resolve(myprod);
                            } else {
                                resolve(myprod);
                            }
                        }
                    })
                    .catch(err => {
                        //console.log(err);
                        let err_data = [];
                        resolve(err_data);
                    });
            }

        });
    }

    function getAuthors(params) {
        return new Promise((resolve, reject) => {

            //English Search
            if (params.expression.charCodeAt(0) < 2000) {

                var regExpr = /[^a-zA-Z0-9-. ]/g;
                var searchString = params.expression.replace(regExpr, ""); //Removing Special Character
                let mainstring = new RegExp(searchString, "i");

                let firstSearchCondition = {};
                let furtherSearchLength = 12;

                /* #region  For Splitted Words*/
                var escape = require("escape-regexp");
                let start = '^' + escape(params.expression);
                let splittedString = start.split(" ");
                var final = [];
                for (let i = 0; i < splittedString.length; i++) {
                    final[i] = new RegExp(splittedString[i], "i");
                }

                if (searchString.length < 3) {
                    furtherSearchLength = 1;
                    firstSearchCondition = {
                        is_enabled: {
                            $eq: true
                        },
                        //Exact Search
                        name: searchString,
                    }
                } else {
                    firstSearchCondition = {
                        is_enabled: {
                            $eq: true
                        },
                        $or: [{
                            //Like Search
                            name: mainstring,
                        }]
                    }
                }

                Author.aggregate([{
                    $match: firstSearchCondition
                },
                {
                    $project: {
                        image: params.imageSize,
                        engname: "$name",
                        name: "$lang.content.name",
                        seo_url: "$seo_url",
                        click_url: "author-books"
                    }
                }
                ])
                    .skip(12 * (params.pagenum - 1))
                    .limit(500)
                    .exec((err, authors) => {

                        if (err) reject(err);
                        else {
                            if (authors.length < furtherSearchLength) {

                                let condition = {};
                                let lmt = 12 - authors.length;
                                var soundex_pre = soundexSen(searchString);
                                var soundex_all = soundex_pre.split(" ")
                                    .map(val => {
                                        return new RegExp(val);
                                    });
                                condition = {
                                    is_enabled: {
                                        $eq: true
                                    },

                                    $or: [{
                                        soundex_code: {
                                            $all: soundex_all
                                        }
                                    },
                                    {
                                        search_text: {
                                            $regex: params.expression,
                                            $options: "i"
                                        }
                                    }
                                    ]
                                };


                                Author.aggregate([{
                                    $match: condition
                                },
                                {
                                    $project: {
                                        image: params.imageSize,
                                        name: "$lang.content.name",
                                        engname: "$name",
                                        seo_url: "$seo_url",
                                        click_url: "author-books"
                                    }
                                }
                                ])
                                    //.skip(12 * (params.pagenum - 1))
                                    .limit(500)
                                    .exec((err, soundexAuthors) => {
                                        if (err) reject(err);
                                        else {
                                            var escape = require("escape-regexp");
                                            let start = escape(params.expression);
                                            let previousAuthors = authors;
                                            authors = soundexAuthors;

                                            //Find Levenstein Distance
                                            let levenAuthor = [];
                                            authors.forEach(element => {
                                                let p = levenshteinDistance(start, element.engname);
                                                if (Math.abs(p) < 10) {
                                                    element["leven_dist"] = p;
                                                    levenAuthor = levenAuthor.concat(element);
                                                } else if (Math.abs(p) < 50) {
                                                    element["leven_dist"] = p;
                                                    levenAuthor = levenAuthor.concat(element);
                                                } else if (Math.abs(p) < 100) {
                                                    element["leven_dist"] = p;
                                                    levenAuthor = levenAuthor.concat(element);
                                                } else if (Math.abs(p) < 500) {
                                                    element["leven_dist"] = p;
                                                    levenAuthor = levenAuthor.concat(element);
                                                }
                                            });

                                            //Sorting According to Leven Distance
                                            heapSort(levenAuthor);

                                            //Detecting the page number and splicing to limited 12 result
                                            if (params.pagenum > 1) {
                                                levenAuthor = levenAuthor.splice(12 * (params.pagenum - 1), 12);
                                            }
                                            levenAuthor = levenAuthor.slice(0, 12);

                                            //Merge Exact and Soundex Search results
                                            Array.prototype.push.apply(previousAuthors, levenAuthor);

                                            //Make The Unique List from the merged result
                                            var obj = {};
                                            for (var i = 0, len = previousAuthors.length; i < len; i++) {
                                                obj[previousAuthors[i]['seo_url']] = previousAuthors[i];
                                            }
                                            var finalAuthor = new Array();
                                            for (var key in obj) {
                                                finalAuthor.push(obj[key]);
                                            }

                                            //Detecting the page number and splicing to limited 12 result
                                            // if ((previousAuthors && params.pagenum > 2) || (!previousAuthors && params.pagenum > 1)) {
                                            //   finalAuthor = finalAuthor.splice(12 * (params.pagenum - 1), 12);
                                            // }
                                            // finalAuthor = finalAuthor.slice(0, 12);


                                            //Response the result
                                            if (finalAuthor.length > 0) {
                                                resolve(finalAuthor);
                                            } else {
                                                resolve(finalAuthor);
                                            }
                                        }

                                    });
                            } else {


                                var escape = require("escape-regexp");
                                let start = escape(params.expression);

                                let myauthor = [];
                                authors.forEach(element => {
                                    let p = levenshteinDistance(start, element.engname);

                                    if (Math.abs(p) < 20) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    } else if (Math.abs(p) < 50) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    } else if (Math.abs(p) < 100) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    } else if (Math.abs(p) < 500) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    }
                                });
                                heapSort(myauthor);
                                if (params.pagenum > 1) {
                                    myauthor = myauthor.splice(12 * (params.pagenum - 1), 12);
                                }
                                myauthor = myauthor.slice(0, 12);

                                if (myauthor.length > 0) {
                                    resolve(myauthor);
                                } else {
                                    resolve(false);
                                }

                            }
                        }
                    });
            }
            //Bangla Search
            else {
                var escape = require("escape-regexp");
                let start = escape(params.expression);
                let splittedString = start.split(" ");
                let banglaInput = escape(params.expression).split(" ");

                var final = [];

                for (let i = 0; i < splittedString.length; i++) {
                    final[i] = new RegExp(splittedString[i], "i");
                }

                Author.aggregate([{
                    $match: {
                        "lang.code": params.reqLang,
                        'is_enabled': true,
                        $or: [{
                            "lang.content.name": {
                                $all: final
                            }
                        }]
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $project: {
                        image: params.imageSize,
                        name: "$lang.content.name",
                        engname: "$name",
                        seo_url: "$seo_url",
                        click_url: "author-books"
                    }
                }
                ])
                    .skip(12 * (params.pagenum - 1))
                    .limit(500)
                    .exec((err, authors) => {
                        if (err) reject(err);
                        else {


                            if (authors.length < 1) {

                                let lmt = 12 - authors.length;

                                let finalString;
                                let mainStr = params.expression;
                                let splitStr = mainStr.split(" ");

                                let englishString = banglaToEnglishConvert(banglaInput);
                                let condition = {};
                                var soundex_pre = soundexSen(englishString);
                                var soundex_all = soundex_pre.split(" ")
                                    .map(val => {
                                        return new RegExp(val);
                                    });
                                condition = {
                                    is_enabled: {
                                        $eq: true
                                    },
                                    soundex_code: {
                                        $all: soundex_all
                                    }
                                };



                                Author.aggregate([{
                                    $match: condition
                                },
                                {
                                    $unwind: "$lang"
                                },
                                {
                                    $project: {
                                        image: params.imageSize,
                                        name: "$lang.content.name",
                                        seo_url: "$seo_url",
                                        click_url: "author-books"
                                    }
                                }
                                ])
                                    .skip(12 * (params.pagenum - 1))
                                    .limit(2000)
                                    .exec((err, restAuthors) => {
                                        if (err) reject(err);
                                        else {
                                            start = "^" + start;
                                            authors = authors.concat(restAuthors);
                                            let myauthor = [];
                                            authors.forEach(element => {
                                                let p = levenshteinDistance(start, element.name);
                                                if (Math.abs(p) < 10) {
                                                    myauthor = myauthor.concat(element);
                                                } else if (Math.abs(p) < 50) {
                                                    myauthor = myauthor.concat(element);
                                                } else if (Math.abs(p) < 100) {
                                                    myauthor = myauthor.concat(element);
                                                } else if (Math.abs(p) < 500) {
                                                    myauthor = myauthor.concat(element);
                                                }
                                            });
                                            myauthor = myauthor.slice(0, 12);
                                            resolve(myauthor);
                                        }
                                    });
                            } else {


                                let myauthor = [];
                                authors.forEach(element => {
                                    let p = levenshteinDistance(start, element.name);

                                    if (Math.abs(p) < 20) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    } else if (Math.abs(p) < 50) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    } else if (Math.abs(p) < 100) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    } else if (Math.abs(p) < 500) {
                                        element["leven_dist"] = p;
                                        myauthor = myauthor.concat(element);
                                    }
                                });
                                heapSort(myauthor);
                                if (params.pagenum > 1) {
                                    myauthor = myauthor.splice(12 * (params.pagenum - 1), 12);
                                }
                                myauthor = myauthor.slice(0, 12);

                                if (myauthor.length > 0) {
                                    resolve(myauthor);
                                } else {
                                    resolve(authors);
                                }
                                // resolve(authors);
                            }
                        }
                    });
            }

        });
    }

    function getPublishers(params) {
        return new Promise((resolve, reject) => {
            if (params.reqLang == config.DEFAULT_LANGUAGE) {
                if (params.expression.charCodeAt(0) < 2000) {
                    var escape = require("escape-regexp");
                    let start = escape(params.expression);

                    let splittedString = start.split(" ");
                    var final = [];
                    for (let i = 0; i < splittedString.length; i++) {
                        final[i] = new RegExp(splittedString[i], "i");
                    }
                    Publisher.aggregate([{
                        $match: {
                            name: {
                                $all: final
                            }
                        }
                    },
                    {
                        $project: {
                            image: params.publisherLogoSize,
                            name: "$name",
                            seo_url: "$seo_url",
                            click_url: "publisher-books"
                        }
                    }
                    ])
                        .skip(8 * (params.pagenum - 1))
                        .limit(8)
                        .exec((err, publishers) => {
                            if (err) reject(err);
                            else resolve(publishers);
                        });
                } else {
                    //BANGLA CharCode
                    var escape = require("escape-regexp");
                    let start = escape(params.expression);

                    let splittedString = start.split(" ");
                    var final = [];
                    for (let i = 0; i < splittedString.length; i++) {
                        final[i] = new RegExp(splittedString[i], "i");
                    }

                    Publisher.aggregate([{
                        $match: {
                            name: {
                                $all: final
                            }
                        }
                    },
                    {
                        $project: {
                            image: params.publisherLogoSize,
                            name: "$name",
                            seo_url: "$seo_url",
                            click_url: "publisher-books"
                        }
                    }
                    ])
                        .skip(8 * (params.pagenum - 1))
                        .limit(8)
                        .exec((err, publishers) => {
                            if (err) reject(err);
                            else resolve(publishers);
                        });
                }
            } else {
                //Lang Change

                if (params.expression.charCodeAt(0) < 2000) {
                    var escape = require("escape-regexp");
                    let start = escape(params.expression);

                    let splittedString = start.split(" ");
                    var final = [];
                    for (let i = 0; i < splittedString.length; i++) {
                        final[i] = new RegExp(splittedString[i], "i");
                    }
                    Publisher.aggregate([{
                        $match: {
                            "lang.code": params.reqLang,
                            name: {
                                $all: final
                            }
                        }
                    },
                    {
                        $unwind: "$lang"
                    },
                    {
                        $project: {
                            image: params.publisherLogoSize,
                            name: "$lang.content.name",
                            seo_url: "$seo_url",
                            click_url: "publisher-books"
                        }
                    }
                    ])
                        .skip(12 * (params.pagenum - 1))
                        .limit(12)
                        .exec((err, publishers) => {
                            if (err) reject(err);
                            else {
                                // //console.log(publishers.length);
                                if (publishers.length < 1) {
                                    let condition = {};
                                    let lmt = 12 - publishers.length;
                                    var soundex_all = soundexSen(params.expression)
                                        .split(" ")
                                        .map(val => {
                                            return new RegExp(val);
                                        });

                                    condition = {
                                        soundex_code: {
                                            $all: soundex_all
                                        }
                                    };
                                    Publisher.aggregate([{
                                        $match: condition
                                    },
                                    {
                                        $unwind: "$lang"
                                    },
                                    {
                                        $project: {
                                            image: params.imageSize,
                                            name: "$lang.content.name",
                                            seo_url: "$seo_url",
                                            click_url: "publisher-books"
                                        }
                                    }
                                    ])
                                        .skip(12 * (params.pagenum - 1))
                                        .limit(12)
                                        .exec((err, restPublishers) => {
                                            if (err) reject(err);
                                            else {
                                                start = "^" + start;

                                                publishers = publishers.concat(restPublishers);
                                                let mypublisher = [];
                                                publishers.forEach(element => {
                                                    let p = levenshteinDistance(start, element.name);
                                                    if (Math.abs(p) < 10) {
                                                        mypublisher = mypublisher.concat(element);
                                                    } else if (Math.abs(p) < 50) {
                                                        mypublisher = mypublisher.concat(element);
                                                    } else if (Math.abs(p) < 100) {
                                                        mypublisher = mypublisher.concat(element);
                                                    } else if (Math.abs(p) < 500) {
                                                        mypublisher = mypublisher.concat(element);
                                                    }
                                                });
                                                mypublisher = mypublisher.slice(0, 12);
                                                resolve(mypublisher);
                                            }
                                        });
                                } else {
                                    resolve(publishers);
                                }
                            }
                        });
                } else {
                    // CharCode Lang Check Bangla

                    var escape = require("escape-regexp");
                    let start = escape(params.expression);

                    let splittedString = start.split(" ");
                    var final = [];
                    for (let i = 0; i < splittedString.length; i++) {
                        final[i] = new RegExp(splittedString[i], "i");
                    }

                    Publisher.aggregate([{
                        $match: {
                            "lang.code": params.reqLang,
                            $or: [{
                                "lang.content.name": {
                                    $all: final
                                }
                            }]
                        }
                    },
                    {
                        $unwind: "$lang"
                    },
                    {
                        $project: {
                            image: params.imageSize,
                            name: "$lang.content.name",
                            seo_url: "$seo_url",
                            click_url: "publisher-books"
                        }
                    }
                    ])
                        .skip(12 * (params.pagenum - 1))
                        .limit(12)
                        .exec((err, publishers) => {
                            if (err) reject(err);
                            else {
                                if (publishers.length < 1) {
                                    let condition = {};
                                    let lmt = 12 - publishers.length;

                                    let finalString;
                                    let mainStr = params.expression;
                                    let splitStr = mainStr.split(" ");

                                    //double or single check
                                    if (splitStr.length == 1) {
                                        let size = splitStr[0].length;
                                        let div = Math.ceil(size / 2);
                                        var search_string = [];
                                        search_string[0] = splitStr[0].substr(0, div);
                                        search_string[1] = splitStr[0].substr(
                                            div,
                                            splitStr[0].length
                                        );

                                        finalString = search_string.map(val => {
                                            return new RegExp(val);
                                        });
                                    } else if (splitStr.length > 1) {
                                        let splitStr = mainStr.split(" ").map(val => {
                                            return new RegExp(val);
                                        });

                                        finalString = mainStr.split(" ").map(val => {
                                            return new RegExp(val);
                                        });
                                    }

                                    condition = {
                                        "lang.content.name": {
                                            $in: finalString
                                        }
                                    };

                                    Publisher.aggregate([{
                                        $match: condition
                                    },
                                    {
                                        $unwind: "$lang"
                                    },
                                    {
                                        $project: {
                                            image: params.imageSize,
                                            name: "$lang.content.name",
                                            seo_url: "$seo_url",
                                            click_url: "author-books"
                                        }
                                    }
                                    ])
                                        .skip(12 * (params.pagenum - 1))
                                        .limit(12)
                                        .exec((err, restPublishers) => {
                                            if (err) reject(err);
                                            else {
                                                start = "^" + start;
                                                publishers = publishers.concat(restPublishers);
                                                let mypublisher = [];
                                                publishers.forEach(element => {
                                                    let p = levenshteinDistance(start, element.name);
                                                    if (Math.abs(p) < 10) {
                                                        mypublisher = mypublisher.concat(element);
                                                    } else if (Math.abs(p) < 50) {
                                                        mypublisher = mypublisher.concat(element);
                                                    } else if (Math.abs(p) < 100) {
                                                        mypublisher = mypublisher.concat(element);
                                                    } else if (Math.abs(p) < 500) {
                                                        mypublisher = mypublisher.concat(element);
                                                    }
                                                });
                                                mypublisher = mypublisher.slice(0, 12);
                                                resolve(mypublisher);
                                            }
                                        });
                                } else {
                                    resolve(publishers);
                                }
                            }
                        });
                }
            }
        });
    }

    function getCategories(params) {
        return new Promise((resolve, reject) => {
            if (params.reqLang == config.DEFAULT_LANGUAGE) {
                Category.aggregate([{
                    $match: {
                        hide_on_public: false,
                        is_enabled: true,
                        $or: [{
                            "lang.content.name": {
                                $regex: params.expression,
                                $options: "i"
                            }
                        },
                        {
                            name: {
                                $regex: params.expression,
                                $options: "i"
                            }
                        }
                        ]
                    }
                },
                {
                    $project: {
                        name: "$name",
                        seo_url: "$seo_url",
                        click_url: "category-books"
                    }
                }
                ])
                    .skip(12 * (params.pagenum - 1))
                    .limit(12)
                    .exec((err, categories) => {
                        if (err) reject(err);
                        else resolve(categories);
                    });
            } else {
                Category.aggregate([{
                    $match: {
                        "lang.code": params.reqLang,
                        hide_on_public: false,
                        is_enabled: true,
                        $or: [{
                            "lang.content.name": {
                                $regex: params.expression,
                                $options: "i"
                            }
                        },
                        {
                            name: {
                                $regex: params.expression,
                                $options: "i"
                            }
                        }
                        ]
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $project: {
                        name: "$lang.content.name",
                        seo_url: "$seo_url",
                        click_url: "category-books"
                    }
                }
                ])
                    .skip(12 * (params.pagenum - 1))
                    .limit(12)
                    .exec((err, categories) => {
                        if (err) reject(err);
                        else resolve(categories);
                    });
            }
        });
    }

    router.route("/similar-product-load/:seo_url")
        .get((req, res) => {

            var size = "250X360";
            var imageSize = "$image." + size;
            let reqLang = "bn";

            let match_criteria = {};
            let product_detail = {};

            match_criteria = {
                is_enabled: {
                    $eq: true
                },
                category: {
                    $in: category_ids_similar
                },
                "lang.code": reqLang,
                _id: {
                    $ne: product_id_similar
                }
            };

            Product.aggregate([{
                $match: match_criteria
            },
            {
                $unwind: "$lang"
            },
            {
                $lookup: {
                    from: "offers",
                    localField: "current_offer",
                    foreignField: "_id",
                    as: "current_offer"
                }
            },
            {
                $unwind: "$accessories"
            },
            {
                $project: {
                    image: imageSize,
                    previous_price: "$previous_price",
                    current_offer: {
                        $arrayElemAt: ["$current_offer.image", 0]
                    },
                    categoryObj: {
                        _id: {
                            $arrayElemAt: ["$accessories.categories_bn._id", 0]
                        },
                        name: {
                            $arrayElemAt: ["$accessories.categories_bn.name", 0]
                        },
                        seo_url: {
                            $arrayElemAt: ["$accessories.categories_bn.seo_url", 0]
                        }
                    },
                    authorObj: {
                        _id: {
                            $arrayElemAt: ["$accessories.authors_bn._id", 0]
                        },
                        name: {
                            $arrayElemAt: ["$accessories.authors_bn.name", 0]
                        },
                        seo_url: {
                            $arrayElemAt: ["$accessories.authors_bn.seo_url", 0]
                        }
                    },

                    publisher: {
                        _id: "$accessories.publisher_bn._id",
                        name: "$accessories.publisher_bn.name",
                        seo_url: "$accessories.publisher_bn.seo_url"
                    },
                    price: "$price",
                    name: "$lang.content.name",
                    seo_url: "$seo_url",
                    free_delivery: "$free_delivery",
                    priority: "$priority"
                }
            },
            {
                $sort: {
                    priority: 1
                }
            },
            {
                $limit: 10
            }

            ])
                .exec()
                .then(relatedProduct => {
                    //  //console.log(relatedProduct);
                    product_detail.related_product = relatedProduct;
                    res.json(product_detail);
                });
        });

    router.route("/product/:seo_url").get((req, res) => {
        let smart_link = req.headers["smart_link"];
        var smart_search_param = "";

        if (smart_link.includes("author-books")) {
            smart_search_param = "author-books";
        } else if (smart_link.includes("publisher-books")) {
            smart_search_param = "publisher-books";
        } else {
            smart_search_param = "category-books";
        }

        let size1 = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
        let imageSize_detail = "$image." + size1;
        let size2 = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
        let imageSize = "$image." + size2;

        let bundleImageSize = "$$bundle.image." + size2;
        let author_imageSize = "$$auth.image." + size2;
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";

        if (req.headers["app-device"]) {
            let device = JSON.parse(req.headers["app-device"]);
            reqLang = device.lang;
        }

        let token = req.cookies.token || req.headers["token"];
        let user = new Object({});
        jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
            if (!err) {
                user = decoded; //user;
                if (!user._id) {
                    user = decoded._doc;
                }
            }
            let product_detail = {};

            Product.aggregate([{
                $match: {
                    "lang.code": reqLang,
                    is_enabled: {
                        $eq: true
                    },
                    $or: [{
                        seo_url: req.params.seo_url
                    },
                    {
                        "lang.content.seo_url": req.params.seo_url
                    }
                    ]
                }
            },
            {
                $unwind: "$accessories"
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $lookup: {
                    from: "authors",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $lookup: {
                    from: "authors",
                    localField: "editor",
                    foreignField: "_id",
                    as: "editor"
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "bundle_items",
                    foreignField: "_id",
                    as: "bundle_items"
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "list_of_bundle",
                    foreignField: "_id",
                    as: "list_bundle"
                }
            },
            {
                $lookup: {
                    from: "authors",
                    localField: "translator",
                    foreignField: "_id",
                    as: "translator"
                }
            },
            {
                $lookup: {
                    from: "offers",
                    localField: "current_offer",
                    foreignField: "_id",
                    as: "current_offer"
                }
            },
            {
                $unwind: "$lang"
            },

            {
                $project: {
                    image: imageSize_detail,
                    import_id: '$import_id',
                    preview_images: {
                        $filter: {
                            input: "$preview_images",
                            as: "preview_images",
                            cond: {
                                $eq: ["$$preview_images.disabled", false]
                            }
                        }
                    },
                    rating_avg: "$rating_avg",
                    rating_count: "$rating_count",
                    previous_price: "$previous_price",
                    price: "$price",
                    is_bundle: "$is_bundle",
                    free_delivery: "$free_delivery",
                    reviews: {
                        $filter: {
                            input: "$reviews",
                            as: "review",
                            cond: {
                                $or: [{
                                    $eq: [
                                        "$$review.user_id",
                                        mongoose.Types.ObjectId(user._id)
                                    ]
                                },
                                {
                                    $eq: ["$$review.approved", true]
                                }
                                ]
                            }
                        }
                    },
                    description: "$lang.content.description",
                    name: "$lang.content.name",
                    seo_url: "$seo_url",
                    review_approved_counter: "$review_approved_counter",
                    is_out_of_stock: "$is_out_of_stock",
                    is_out_of_print: "$is_out_of_print",
                    meta_tag_title: "$lang.content.meta_tag_title",
                    meta_tag_description: "$lang.content.meta_tag_description",
                    meta_tag_keywords: "$lang.content.meta_tag_keywords",
                    is_bundle: "$is_bundle",
                    is_in_bundle: "$is_in_bundle",
                    current_offer: {
                        $arrayElemAt: ["$current_offer.image", 0]
                    },
                    isbn: "$isbn",
                    published_year: "$published_year",
                    book_language: "$book_language",
                    edition: "$edition",
                    number_of_pages: "$number_of_pages",
                    published_from: "$published_from",

                    authors: {
                        $map: {
                            input: "$author",
                            as: "auth",
                            in: {
                                _id: {
                                    $arrayElemAt: ["$author._id", 0]
                                },
                                name: {
                                    $arrayElemAt: ["$$auth.lang.content.name", 0]
                                },
                                description: {
                                    $arrayElemAt: ["$$auth.lang.content.description", 0]
                                },
                                seo_url: "$$auth.seo_url",

                                // 'seo_url': { $arrayElemAt: ['$$auth.lang.content.seo_url', 0] },
                                image: author_imageSize
                            }
                        }
                    },
                    bundle_items: {
                        $map: {
                            input: "$bundle_items",
                            as: "bundle",
                            in: {
                                _id: "$$bundle._id",
                                name: {
                                    $arrayElemAt: ["$$bundle.lang.content.name", 0]
                                },
                                previous_price: "$$bundle.previous_price",
                                price: "$$bundle.price",
                                seo_url: "$$bundle.seo_url",

                                // 'seo_url': { $arrayElemAt: ['$$bundle.lang.content.seo_url', 0] },

                                image: bundleImageSize
                            }
                        }
                    },
                    list_bundle: {
                        $map: {
                            input: "$list_bundle",
                            as: "bundle",
                            in: {
                                _id: "$$bundle._id",
                                name: {
                                    $arrayElemAt: ["$$bundle.lang.content.name", 0]
                                },
                                previous_price: "$$bundle.previous_price",
                                price: "$$bundle.price",
                                is_enabled: "$$bundle.is_enabled",
                                seo_url: "$$bundle.seo_url",
                                image: bundleImageSize
                            }
                        }
                    },
                    translators: {
                        $map: {
                            input: "$translator",
                            as: "trnslt",
                            in: {
                                _id: {
                                    $arrayElemAt: ["$translator._id", 0]
                                },
                                name: {
                                    $arrayElemAt: ["$$trnslt.lang.content.name", 0]
                                },
                                description: {
                                    $arrayElemAt: ["$$trnslt.lang.content.description", 0]
                                },
                                seo_url: "$$trnslt.seo_url"

                                // 'seo_url': { $arrayElemAt: ['$$trnslt.lang.content.seo_url', 0] }
                            }
                        }
                    },
                    editors: {
                        $map: {
                            input: "$editor",
                            as: "editor",
                            in: {
                                _id: {
                                    $arrayElemAt: ["$editor._id", 0]
                                },
                                name: {
                                    $arrayElemAt: ["$$editor.lang.content.name", 0]
                                },
                                description: {
                                    $arrayElemAt: ["$$editor.lang.content.description", 0]
                                },
                                seo_url: "$$editor.seo_url"

                                // 'seo_url': { $arrayElemAt: ['$$trnslt.lang.content.seo_url', 0] }
                            }
                        }
                    },
                    publisher: {
                        name: "$accessories.publisher_bn.name",
                        seo_url: "$accessories.publisher_en.seo_url"

                    },
                    categories: {
                        $slice: [{
                            $map: {
                                input: "$category",
                                as: "cat",
                                in: {
                                    _id: "$$cat._id",
                                    hide_on_public: "$$cat.hide_on_public",
                                    name: {
                                        $arrayElemAt: ["$$cat.lang.content.name", 0]
                                    },
                                    seo_url: "$$cat.seo_url"

                                    // 'seo_url': { $arrayElemAt: ['$$cat.lang.content.seo_url', 0] },
                                }
                            }
                        }, -3]
                    }
                }
            }
            ])
                .exec()
                .then(product => {
                    // //console.log("AMI HIT KORECHI")

                    if (product && Array.isArray(product) && product.length > 0) {
                        product_detail.product = product[0];

                        var category_ids = product[0].categories.map(function (category) {
                            return mongoose.Types.ObjectId(category._id);
                        });

                        category_ids_similar = category_ids;
                        product_id_similar = product[0]._id;

                        var author_ids = product[0].authors.map(function (author) {
                            return mongoose.Types.ObjectId(author._id);
                        });

                        var publishers_id = mongoose.Types.ObjectId(
                            product[0].publisher._id
                        );

                        product_detail.related_product = [];
                        res.json(product_detail);

                        // let match_criteria = {};

                        // if (smart_search_param == "author-books") {
                        //     match_criteria = {
                        //         is_enabled: {
                        //             $eq: true
                        //         },
                        //         author: {
                        //             $in: author_ids
                        //         },
                        //         "lang.code": reqLang,
                        //         _id: {
                        //             $ne: product[0]._id
                        //         }
                        //     };
                        // } else if (smart_search_param == "publisher-books") {
                        //     match_criteria = {
                        //         is_enabled: {
                        //             $eq: true
                        //         },

                        //         publisher: publishers_id,
                        //         "lang.code": reqLang,
                        //         _id: {
                        //             $ne: product[0]._id
                        //         }
                        //     };
                        // } else {
                        //     match_criteria = {
                        //         is_enabled: {
                        //             $eq: true
                        //         },
                        //         category: {
                        //             $in: category_ids
                        //         },
                        //         "lang.code": reqLang,
                        //         _id: {
                        //             $ne: product[0]._id
                        //         }
                        //     };
                        // }


                        // Product.aggregate([{
                        //             $match: match_criteria
                        //         },
                        //         {
                        //             $unwind: "$lang"
                        //         },
                        //         {
                        //             $lookup: {
                        //                 from: "offers",
                        //                 localField: "current_offer",
                        //                 foreignField: "_id",
                        //                 as: "current_offer"
                        //             }
                        //         },
                        //         {
                        //             $unwind: "$accessories"
                        //         },
                        //         {
                        //             $project: {
                        //                 image: imageSize,
                        //                 previous_price: "$previous_price",
                        //                 current_offer: {
                        //                     $arrayElemAt: ["$current_offer.image", 0]
                        //                 },
                        //                 categoryObj: {
                        //                     _id: {
                        //                         $arrayElemAt: ["$accessories.categories_bn._id", 0]
                        //                     },
                        //                     name: {
                        //                         $arrayElemAt: ["$accessories.categories_bn.name", 0]
                        //                     },
                        //                     seo_url: {
                        //                         $arrayElemAt: ["$accessories.categories_bn.seo_url", 0]
                        //                     }
                        //                 },
                        //                 authorObj: {
                        //                     _id: {
                        //                         $arrayElemAt: ["$accessories.authors_bn._id", 0]
                        //                     },
                        //                     name: {
                        //                         $arrayElemAt: ["$accessories.authors_bn.name", 0]
                        //                     },
                        //                     seo_url: {
                        //                         $arrayElemAt: ["$accessories.authors_bn.seo_url", 0]
                        //                     }
                        //                 },

                        //                 publisher: {
                        //                     _id: "$accessories.publisher_bn._id",
                        //                     name: "$accessories.publisher_bn.name",
                        //                     seo_url: "$accessories.publisher_bn.seo_url"
                        //                 },
                        //                 price: "$price",
                        //                 name: "$lang.content.name",
                        //                 seo_url: "$seo_url",
                        //                 free_delivery: "$free_delivery",
                        //                 priority: "$priority"
                        //             }
                        //         },
                        //         {
                        //             $sort: {
                        //                 priority: 1
                        //             }
                        //         },
                        //         {
                        //             $limit: 10
                        //         }

                        //     ])
                        //     .exec()
                        //     .then(relatedProduct => {
                        //         //  //console.log(relatedProduct);
                        //         product_detail.related_product = relatedProduct;
                        //         res.json(product_detail);
                        //     });
                    } else {
                        res.json({
                            product: {
                                authors: [],
                                attributes: [],
                                categories: []
                            },
                            related_product: []
                        });
                    }
                });

        });
    });

    router.route("/product/category/new-released").get(
        (req, res, next) => {
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            var cacheKeyName = "new-released-" + reqLang;

            let paginationHeader = req.headers["bz-pagination"];
            if (paginationHeader) {
                cacheKeyName = cacheKeyName + "-page-" + paginationHeader;
            }

            res.express_redis_cache_name = cacheKeyName;
            next();
        },
        cache.route(),
        (req, res) => {
            getNewReleases(req).then(data => {
                res.json(data);
            });
        }
    );

    router.route("/product/feature-category/:catName").get(
        (req, res, next) => {
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            var cacheKeyName = req.params.catName + "-" + reqLang;

            let paginationHeader = req.headers["bz-pagination"];
            if (paginationHeader) {
                cacheKeyName = cacheKeyName + "-page-" + paginationHeader;
            }

            res.express_redis_cache_name = cacheKeyName;
            next();
        },
        cache.route(),
        (req, res) => {
            getCategoryProductsByName(req, req.params.catName).then(data => {
                res.json(data);
            });
        }
    );

    function calculateRating(rates, rate_count, new_rate_infos) {
        return new Promise((resolve, reject) => {
            var new_rate_object = {
                rate_count: 0,
                rates: [],
                rating_avg: 0
            };
            rate_count++;
            new_rate_object.rate_count = rate_count;
            var new_rate = new_rate_infos.rate;

            if (rates.length > 0) {
                var previous_points = [];
                for (var i = 0; i < rates.length; i++) {
                    previous_points.push(rates[i].rate);
                }
                var point_index = previous_points.indexOf(new_rate);
                if (point_index == -1) {
                    var new_object = {
                        rate: new_rate,
                        users: []
                    };
                    new_object.users.push(new_rate_infos);
                    rates.push(new_object);
                } else {
                    rates[point_index].users.push(new_rate_infos);
                }
            } else {
                var new_object = {
                    rate: new_rate,
                    users: []
                };
                new_object.users.push(new_rate_infos);
                rates.push(new_object);
            }

            new_rate_object.rates = rates;
            var total = 0;
            for (var j = 0; j < rates.length; j++) {
                var point = rates[j].rate;
                var this_count =
                    rates[j].users.length == undefined ? 0 : rates[j].users.length;
                total = total + point * this_count;
            }

            var new_rating_avg = total / rate_count;
            new_rating_avg = Number(new_rating_avg).toFixed(2);
            new_rate_object.rating_avg = new_rating_avg;

            resolve(new_rate_object);
        });
    }

    function checkReviewed(reviews, user) {
        let hasReview = reviews.filter(review => {
            return review.user_id == user._id;
        });
        return (hasReview = hasReview.length > 0 ? true : false);
    }

    router.route("/custom-filter/").get((req, res) => {
        let size = req.cookies.deviceName == "desktop" ? "120X175" : "120X175";
        let authorImage = {
            $arrayElemAt: ["$author.image." + size, 0]
        };
        let imageSize = "$image." + size;
        let filterType = req.headers["type"];
        let filterSeoUrl = req.headers["seo_url"];

        let filterId = req.headers["filter_id"];


        let filterIds = filterId.split(';');
        let filterIdArray = [];
        filterIds.forEach(function (element, i) {
            filterIdArray[i] = mongoose.Types.ObjectId(element);

        });

        let published_date = new Date(req.headers["new_release"]);



        //Search
        let searchCondition = req.query.terms;


        let splittedString = searchCondition.split(" ");
        var finalSearch = [];
        for (let i = 0; i < splittedString.length; i++) {
            finalSearch[i] = new RegExp(splittedString[i], "i");
        }

        let country = req.headers["published_country"];
        let language = req.headers["language"];

        let price_range = req.headers["price_range"];
        price_range = price_range.split(",");

        let discountCondition = parseInt(req.headers["discount_condition"]);
        let disLower;

        let author_filter = req.headers["author_filter"];
        author_filter = author_filter.split(",");

        let publisher_filter = req.headers["publisher_filter"];
        publisher_filter = publisher_filter.split(",");

        let category_filter = req.headers["category_filter"];
        category_filter = category_filter.split(",");





        //Select Page Type
        let condition = {};
        if (filterType == "category-books") {
            condition = {
                is_enabled: true,
                $or: [{
                    category: {
                        $in: filterIdArray
                    }
                },
                {
                    "accessories.categories_en.seo_url": filterSeoUrl
                },
                {
                    "accessories.categories_bn.seo_url": filterSeoUrl
                }
                ]
            };
        } else if (filterType == "author-books") {
            condition = {
                is_enabled: true,
                $or: [{
                    author: {
                        $in: filterIdArray
                    }
                },
                {
                    "accessories.authors_en.seo_url": filterSeoUrl
                },
                {
                    "accessories.authors_bn.seo_url": filterSeoUrl
                }
                ]
            };
        } else if (filterType == "publisher-books") {
            condition = {
                is_enabled: true,
                $or: [{
                    publisher: {
                        $in: filterIdArray
                    }
                },
                {
                    "accessories.publisher_en.seo_url": filterSeoUrl
                },
                {
                    "accessories.publisher_bn.seo_url": filterSeoUrl
                }
                ]
            };
        }


        //Filter By Search
        if (searchCondition != "no") {
            condition["$and"] = [{
                '$or': [{
                    name: {
                        $all: finalSearch
                    }
                },
                {
                    "lang.content.name": {
                        $all: finalSearch
                    }
                }
                ]
            }];
        }


        //Filter By Data
        if (author_filter != "no") {
            condition["accessories.authors_en.seo_url"] = {
                $in: author_filter
            };
        }
        if (publisher_filter != "no") {
            condition["accessories.publisher_en.seo_url"] = {
                $in: publisher_filter
            };
        }
        if (category_filter != "no") {
            condition["accessories.categories_en.seo_url"] = {
                $in: category_filter
            };
        }

        //Filter By Criteria
        if (!isNaN(discountCondition)) {
            disLower = parseInt(discountCondition - 15);
            condition["discount_rate"] = {
                $gt: disLower,
                $lte: discountCondition
            };
        }

        if (country != "no") {
            let countryArray = country.split(",");
            condition["published_from"] = {
                $in: countryArray
            };
        }
        if (language != "no") {
            let languageArray = language.split(",");
            condition["book_language"] = {
                $in: languageArray
            };
        }
        if (!isNaN(published_date.getTime()) && published_date != "no") {
            condition["published_at"] = {
                $gt: new Date(published_date)
            };
        }
        if (price_range != "no") {
            condition["price"] = {
                $gte: parseInt(price_range[0]),
                $lte: parseInt(price_range[1])
            };
        }
        //console.log(condition);

        Product.aggregate([{
            $match: condition
        },

        {
            $unwind: "$accessories",
            $unwind: "$lang"
        },

        {
            $project: {
                image: imageSize,
                preview_images: {
                    $size: "$preview_images"
                },
                previous_price: "$previous_price",
                price: "$price",
                name: "$lang.content.name",
                seo_url: "$seo_url",
                priority: "$priority",
                free_delivery: "$free_delivery",
                is_out_of_stock: "$is_out_of_stock",
                is_out_of_print: "$is_out_of_print",
                current_offer: {
                    $arrayElemAt: ["$current_offer.image", 0]
                },
                categoryObj: {
                    _id: {
                        $arrayElemAt: ["$accessories.categories_bn._id", 0]
                    },
                    name: {
                        $arrayElemAt: ["$accessories.categories_bn.name", 0]
                    },
                    seo_url: {
                        $arrayElemAt: ["$accessories.categories_bn.seo_url", 0]
                    }
                },

                authorObj: {
                    _id: {
                        $arrayElemAt: ["$accessories.authors_bn._id", 0]
                    },
                    name: {
                        $arrayElemAt: ["$accessories.authors_bn.name", 0]
                    },
                    seo_url: {
                        $arrayElemAt: ["$accessories.authors_bn.seo_url", 0]
                    },

                    image: authorImage
                },

                publisher: {
                    _id: "$accessories.publisher_bn._id",
                    name: "$accessories.publisher_bn.name",
                    seo_url: "$accessories.publisher_bn.seo_url"
                }
            }
        },
        {
            $sort: {
                priority: 1
            }
        }
        ])
            .limit(50)
            .exec((err, product) => {
                Product.count(condition)
                    .exec()
                    .then(totalBooks => {
                        // //console.log(product)
                        if (err) {
                            res.json("Error");
                        } else {
                            res.json({
                                count: totalBooks,
                                product: product
                            });
                        }
                    })


            });
    });

    router.route("/filter").get((req, res) => {
        let filterType = req.headers["type"];
        let filterSeoUrl = req.headers["seo_url"];
        let filterId = req.headers["filter_id"];

        let filterIds = filterId.split(';');
        let filterIdArray = [];
        filterIds.forEach(function (element, i) {
            filterIdArray[i] = mongoose.Types.ObjectId(element);

        });
        //console.log(filterIdArray);
        let condition = {};
        if (filterType == "category-books") {
            condition = {
                is_enabled: {
                    $eq: true
                },
                $or: [{
                    category: {
                        $in: filterIdArray
                    }
                },
                    // {
                    //   "accessories.categories_en.seo_url": filterSeoUrl
                    // },
                    // {
                    //   "accessories.categories_bn.seo_url": filterSeoUrl
                    // }
                ]
            };
        } else if (filterType == "author-books") {
            condition = {
                is_enabled: {
                    $eq: true
                },
                $or: [{
                    $or: [{
                        author: {
                            $in: filterIdArray
                        }
                    },
                    {
                        translator: {
                            $in: filterIdArray
                        }
                    },
                    {
                        editor: {
                            $in: filterIdArray
                        }
                    },
                    {
                        composer: {
                            $in: filterIdArray
                        }
                    }
                    ]
                },

                {
                    "accessories.authors_en.seo_url": filterSeoUrl
                },
                {
                    "accessories.authors_bn.seo_url": filterSeoUrl
                }
                ]
            };
        } else if (filterType == "publisher-books") {
            condition = {
                is_enabled: {
                    $eq: true
                },
                $or: [{
                    publisher: {
                        $in: filterIdArray
                    }
                },
                {
                    "accessories.publisher_en.seo_url": filterSeoUrl
                },
                {
                    "accessories.publisher_bn.seo_url": filterSeoUrl
                }
                ]
            };
        }
        Product.aggregate([{
            $match: condition
        },
        {
            $sort: {
                priority: 1
            }
        },
        {
            $project: {
                author: {
                    $arrayElemAt: ["$accessories.authors_bn", 0]
                },
                category: {
                    $arrayElemAt: ["$accessories.categories_bn", 0]
                },
                publisher: "$accessories.publisher_bn",
                author_en: {
                    $arrayElemAt: ["$accessories.authors_en", 0]
                },
                category_en: {
                    $arrayElemAt: ["$accessories.categories_en", 0]
                },
                publisher_en: "$accessories.publisher_en"
            }
        }
        ])
            .limit(10000)
            .exec((err, product) => {
                if (err) {
                    // //console.log(product)
                    res.json("ERROR DATA");
                } else {
                    ////console.log(product)

                    var flagAuthor = [],
                        flagPublisher = [],
                        flagCategory = [],
                        author = [],
                        publisher = [],
                        category = [],
                        author_en = [],
                        publisher_en = [],
                        category_en = [],
                        l = product.length,
                        i;

                    for (i = 0; i < l; i++) {
                        if (!product[i].author ||
                            (product[i].author &&
                                flagAuthor[product[i].author.seo_url] &&
                                filterType != "author-books")
                        )
                            continue;
                        if (!product[i].publisher ||
                            (product[i].publisher &&
                                flagPublisher[product[i].publisher.seo_url] &&
                                filterType != "publisher-books")
                        )
                            continue;
                        if (!product[i].category ||
                            (product[i].category &&
                                flagCategory[product[i].category.seo_url] &&
                                filterType != "category-books")
                        )
                            continue;

                        flagAuthor[product[i].author.seo_url] = true;
                        flagPublisher[product[i].publisher.seo_url] = true;
                        flagCategory[product[i].category.seo_url] = true;

                        author.push(product[i].author);
                        publisher.push(product[i].publisher);
                        category.push(product[i].category);
                        author_en.push(product[i].author_en);
                        publisher_en.push(product[i].publisher_en);
                        category_en.push(product[i].category_en);
                    }
                    var combined = Object.assign({}, [
                        author,
                        publisher,
                        category,
                        author_en,
                        publisher_en,
                        category_en
                    ]);
                    // //console.log(combined)
                    res.json(combined);
                }
            });
    });

    router.route("/product-preview").get((req, res) => {
        let page_num = parseInt(req.query.page_num);
        let size = req.cookies.deviceName == "desktop" ? "1200X1600" : "650X800";
        let imageSize = "$preview_images.image." + size;
        Product.findOne({
            _id: req.query.id
        })
            .exec()
            .then(prod => {
                let count = prod.preview_images.length;
                Product.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(req.query.id)
                    }
                },
                {
                    $unwind: "$preview_images"
                },
                {
                    $match: {
                        "preview_images.page_num": page_num
                    }
                },
                {
                    $project: {
                        image: imageSize
                    }
                }
                ])
                    .exec()
                    .then(imges => {
                        if (Array.isArray(imges) && imges.length > 0) {
                            res.json({
                                count: count,
                                image: imges[0],
                                found: true
                            });
                        } else {
                            res.json({
                                count: count,
                                found: false
                            });
                        }
                    })
                    .catch(err => {
                        res.json({
                            count: 0,
                            found: false
                        });
                    });
            });
    });

    function getProductInfo(results) {
        let updates = results.map(rslt => {
            return new Promise((resolve, reject) => {
                Product.find({
                    category: rslt._id
                })
                    .select({
                        author: 1,
                        publisher: 1,
                        category: 1
                    })
                    .exec()
                    .then(products => {
                        if (products && products.length > 0) {
                            let book_list = [];
                            products.map(prd => {
                                let updateObj = {
                                    product_id: prd._id,
                                    author: prd.author[0],
                                    category: prd.category[0],
                                    publisher: prd.publisher
                                };
                                book_list.push(updateObj);
                            });
                            rslt.book_list = book_list;
                            rslt.save(err => {
                                resolve(rslt);
                            });
                        } else {
                            resolve(rslt);
                        }
                    });
            });
        });
        return Promise.all(updates);
    }

    // url: 'https://checkout.sandbox.bka.sh/v1.0.0-beta/checkout/payment/create'
    //      "https://checkout.pay.bka.sh/v1.0.0-beta/checkout/payment/execute/" +

    // var granBkashUrl,createBkashUrl,executeBkashUrl;
    router.route("/bkash/grant-create").post((req, res) => {

        ////console.log(granBkashUrl)
        var bkashInvoiceNo = "bbp-" + new Date().getTime();

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

            //Create Payment
            var options = {
                method: "POST",
                url: createBkashUrl,
                headers: {
                    "x-app-key": app_key,
                    authorization: auth_token
                },
                body: {
                    amount: req.headers["amount"],
                    currency: "BDT",
                    intent: "sale",
                    merchantInvoiceNumber: bkashInvoiceNo
                },
                json: true
            };

            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                res.json(response.body);
            });
        });
    });

    router.route("/bkash/execute/:paymentID").get((req, res) => {
        var paymentID = req.params.paymentID;
        let myurl = executeBkashUrl + paymentID;
        var request = require("request");

        var options = {
            method: "POST",
            url: myurl,
            headers: {
                "x-app-key": app_key,
                authorization: auth_token
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            res.json(response.body);
        });
    });
};

function heap_root(input, i) {
    var left = 2 * i + 1;
    var right = 2 * i + 2;
    var max = i;

    if (left < array_length && input[left].leven_dist > input[max].leven_dist) {
        max = left;
    }

    if (right < array_length && input[right].leven_dist > input[max].leven_dist) {
        max = right;
    }

    if (max != i) {
        swap(input, i, max);
        heap_root(input, max);
    }
}

function swap(input, index_A, index_B) {
    var temp = input[index_A];

    input[index_A] = input[index_B];
    input[index_B] = temp;
}

function heapSort(input) {
    array_length = input.length;

    for (var i = Math.floor(array_length / 2); i >= 0; i -= 1) {
        heap_root(input, i);
    }

    for (i = input.length - 1; i > 0; i--) {
        swap(input, 0, i);
        array_length--;
        heap_root(input, 0);
    }
}



function getAuthorFromPublisher(searchCon, searchParam) {

    return new Promise((resolve, reject) => {
        Product.aggregate([{
            $match: searchCon
        },
        {
            $lookup: {
                from: "offers",
                localField: "current_offer",
                foreignField: "_id",
                as: "current_offer"
            }
        },
        {
            $unwind: "$lang"
        },
        {
            $unwind: "$accessories"
        },
        {
            $project: {
                image: searchParam.imageSize,
                preview_images: {
                    $size: "$preview_images"
                },
                previous_price: "$previous_price",
                price: "$price",
                free_delivery: "$free_delivery",
                name: "$lang.content.name",
                seo_url: "$seo_url",
                priority: "$priority",
                is_out_of_stock: "$is_out_of_stock",
                is_out_of_print: "$is_out_of_print",
                current_offer: {
                    $arrayElemAt: ["$current_offer.image", 0]
                },
                categoryObj: {
                    _id: {
                        $arrayElemAt: ["$accessories.categories_bn._id", 0]
                    },
                    name: {
                        $arrayElemAt: ["$accessories.categories_bn.name", 0]
                    },
                    seo_url: {
                        $arrayElemAt: ["$accessories.categories_bn.seo_url", 0]
                    }
                },

                authorObj: {
                    _id: {
                        $arrayElemAt: ["$accessories.authors_bn._id", 0]
                    },
                    name: {
                        $arrayElemAt: ["$accessories.authors_bn.name", 0]
                    },
                    seo_url: {
                        $arrayElemAt: ["$accessories.authors_bn.seo_url", 0]
                    },

                    image: searchParam.authorImage
                },

                publisher: {
                    _id: "$accessories.publisher_bn._id",
                    name: "$accessories.publisher_bn.name",
                    seo_url: "$accessories.publisher_bn.seo_url"
                }
            }
        },
        {
            $sort: {
                priority: 1
            }
        }
        ])
            .skip(searchParam.itemPerPage * (searchParam.pageNum - 1))
            .limit(searchParam.itemPerPage)
            .exec()
            .then(result => {
                //console.log("2nd Log")
                //console.log(result.length)
                if (result.length < searchParam.itemPerPage) {
                    //console.log('3r')
                    searchParam.selectedId = result.map(rslt => {
                        return rslt._id;
                    });
                    searchParam.itemPerPage = searchParam.itemPerPage - result.length;
                    delete searchCon.priority;
                    getRandomSeoUrlSearchItems(searchCon, searchParam).then(
                        randoms => {
                            result = result.concat(randoms);
                            resolve(result);
                        }
                    );
                } else {
                    //console.log('4r')
                    resolve(result);
                }
            })
            .catch(err => {
                resolve([]);
            });
    });
}


function banglaToEnglishConvert(banglaString) {
    let englishString = ' ';
    let englishWord = ' ';

    banglaString.forEach(word => {
        for (let k = 0; k < word.length; k++) {
            var resultObject = searchBangla(word[k], patterns);
            if (resultObject) {
                englishWord += resultObject;
            }
        }
        englishString = englishString + ' ' + englishWord;
        englishWord = ' ';

    });

    return englishString;
}

function searchBangla(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].r == nameKey) {
            return myArray[i].f;
        }
    }
}



let patterns = [{
    f: "a",
    r: "আ"
},
{
    f: "bhl",
    r: "ভ্ল"
}, {
    f: "bh",
    r: "ভ"
}, {
    f: "v",
    r: "ভ"
}, {
    f: "b",
    r: "ব"
}, {
    f: "ch",
    r: "ছ"
}, {
    f: "c",
    r: "চ"
}, {
    f: "d",
    r: "ঢ"
}, {
    f: "dh",
    r: "ধ"
}, {
    f: "D",
    r: "ড"
}, {
    f: "d",
    r: "দ"
}, {
    f: "gh",
    r: "ঘ"
}, {
    f: "g",
    r: "গ"
}, {
    f: "G",
    r: "গ"
}, {
    f: "h",
    r: "হ"
}, {
    f: "jh",
    r: "ঝ"
}, {
    f: "j",
    r: "জ"
}, {
    f: "J",
    r: "জ"
}, {
    f: "kh",
    r: "খ"
}, {
    f: "k",
    r: "ক"
}, {
    f: "l",
    r: "ল"
}, {
    f: "m",
    r: "ম"
}, {
    f: "0",
    r: "০"
}, {
    f: "1",
    r: "১"
}, {
    f: "2",
    r: "২"
}, {
    f: "3",
    r: "৩"
}, {
    f: "4",
    r: "৪"
}, {
    f: "5",
    r: "৫"
}, {
    f: "6",
    r: "৬"
}, {
    f: "7",
    r: "৭"
}, {
    f: "8",
    r: "৮"
}, {
    f: "9",
    r: "৯"
}, {
    f: "Ng",
    r: "ঙ"
}, {
    f: "NG",
    r: "ঞ"
}, {
    f: "ng",
    r: "ং"
}, {
    f: "n",
    r: "ন"
}, {
    f: "N",
    r: "ণ"
}, {
    f: "OI",
    r: "ৈ"
}, {
    f: "OU",
    r: "ৌ"
}, {
    f: "O",
    r: "ো"
}, {
    f: "OI",
    r: "ঐ"

}, {
    f: "OU",
    r: "ঔ"

}, {
    f: "O",
    r: "ও"
}, {
    f: "ph",
    r: "ফ"
}, {
    f: "f",
    r: "ফ"
}, {
    f: "po",
    r: "প"
}, {
    f: "ri",
    r: "ৃ"
}, {
    r: "`",
    f: "র"
}, {
    f: "ri",
    r: "ঋ"
}, {
    f: "Rh",
    r: "ঢ়"
}, {
    f: "R",
    r: "ড়"
}, {
    f: "r",
    r: "্র"
}, {
    f: "r",
    r: "`",
},
{
    f: "r",
    r: "র",
}, {
    f: "sh",
    r: "শ"
}, {
    f: "Sh",
    r: "ষ"
}, {
    f: "s",
    r: "স"
}, {
    f: "S",
    r: "শ"
}, {
    f: "oo",
    r: "ু"
}, {
    f: "oo",
    r: "উ"
}, {
    f: "o",
    r: "অ"
}, {
    f: "t",
    r: "ৎ"
}, {
    f: "Th",
    r: "ঠ"
}, {
    f: "th",
    r: "থ"
}, {
    f: "To",
    r: "ট"
}, {
    f: "to",
    r: "ত"
}, {
    f: "a",
    r: "া"
}, {
    f: "A",
    r: "া"
}, {
    f: "a",
    r: "আ"
}, {
    f: "i",
    r: "ি"
}, {
    f: "i",
    r: "ই",

}, {
    f: "I",
    r: "ঈ"
}, {
    f: "u",
    r: "ু"
}, {
    f: "u",
    r: "উ"
}, {
    f: "U",
    r: "ূ"
}, {
    f: "U",
    r: "ঊ"

}, {
    f: "ee",
    r: "ী"
}, {
    f: "ee",
    r: "ঈ"
}, {
    f: "e",
    r: "ে"
}, {
    f: "e",
    r: "এ"
}, {
    f: "z",
    r: "য"
}, {
    f: "Z",
    r: "্য"
}, {
    f: "y",
    r: "্য"
}, {
    f: "Y",
    r: "য়"
}, {
    f: "q",
    r: "ক"
}, {
    f: "w",
    r: "ও"
}, {
    f: "x",
    r: "ক্স",
    u: [{
        m: [{
            t: "p",
            s: "p"
        }],
        r: "এক্স"
    }]
}, {
    f: ":",
    r: ":"
}, {
    f: ":",
    r: "ঃ"
}, {
    f: "^",
    r: "^"
}, {
    f: "^",
    r: "ঁ"
}, {
    f: ",,",
    r: "্‌"
}, {
    f: ",",
    r: ","
}, {
    f: "$",
    r: "৳"
}
]