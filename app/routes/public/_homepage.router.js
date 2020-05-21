import config from "../../../config/config.json";
import mongoose from "mongoose";

import Category from "../../models/category.model";
import Order from "../../models/order.model";
import Product from "../../models/product.model";
import Testimonial from "../../models/testimonial.model";
import PurchaseHistory from "../../models/order.model";

import {
    getAuthors,
    getPublishers,
    getFeatureCategories,
    getNewReleases,
    getHomeBanner,
    getMobileProducts,
    getTabsData,
    getCategorys
} from "./api.service.js";

export default (app, router, cache, jwt) => {
    router.route("/home-content").get(
        // (req, res, next) => {



        //     let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
        //     let device = req.device.type;
        //     let scroll_no = 0;

        //     //Check the scroll on home page
        //     if (req.headers["scroll_no"]) {
        //         scroll_no = req.headers["scroll_no"];
        //     }

        //     if (req.headers['app-device']) {
        //         device = JSON.parse(req.headers['app-device']);
        //         reqLang = device.lang;
        //     }
        //     res.express_redis_cache_name = 'home-content-' + reqLang + '-' + device + '-' + scroll_no;

        //     //Whether to use Cache or not
        //     // let use_cache = false;
        //     // if (scroll_no > 0) {
        //     //   use_cache = true;
        //     // }
        //     // res.use_express_redis_cache = use_cache;
        //     next();
        // },
        // cache.route(43200),
        (req, res) => {

            req.scroll_no = req.headers["scroll_no"];

            var content = {};
            getTabsData(req)

            .then(tabsData => {
                    content["tabCategory"] = tabsData;
                    //   return getBlog(req);
                    // })
                    // .then(blogs => {
                    //   content.blogs = blogs;
                    //   return getVideo(req);
                    // })
                    // .then(videos => {
                    //   content.videos = videos;
                    //   return getHomeBlock(req);
                    // })
                    // .then(homeblocks => {
                    //   content.homeblocks = homeblocks;
                    return getHomeBanner(req);
                })
                .then(banners => {
                    content.banners = banners;
                    res.json(content);
                })
                .catch(err => {
                    res.send(err);
                });
        }
    );

    router.route("/layout-menu/data")
        .get((req, res) => {
            var content = {};
            getCategorys(req)
                .then(categorys => {
                    content.featureCategories = categorys;
                    return getAuthors(req);
                })
                .then(authors => {
                    content.authors = authors;
                    return getPublishers(req);
                })
                .then(publishers => {
                    content.publishers = publishers;
                    res.json(content);
                })
                .catch(err => {
                    res.send(err);
                });
        });

    router.route("/home-content-mobile").get((req, res) => {
        var content = {};
        getFeatureCategories(req)
            .then(featureCategories => {
                content.featureCategories = featureCategories;
                return getAuthors(req);
            })
            .then(authors => {
                content.authors = authors;
                return getPublishers(req);
            })
            .then(publishers => {
                content.publishers = publishers;
                return getHomeBanner();
            })
            .then(banners => {
                content.banners = banners;
                return getMobileProducts(req);
            })
            .then(products => {
                content.products = products.data;
                res.json(content);
            })
            .catch(err => {
                res.send(err);
            });
    });

    router.route("/home-content-mobile/product").get((req, res) => {
        getMobileProducts(req).then(products => {
            res.json(products);
        });
    });

    router.route("/category-tab/:id").get((req, res) => {
        if (req.params.id == "new-release") {
            getNewReleases(req).then(data => {
                res.json(data);
            });
        } else {
            let itemsPerPage = req.cookies.itemForDevice ?
                parseInt(req.cookies.itemForDevice) :
                10;
            let pageNum = 2;
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            var paginationHeader = req.headers["bz-pagination"];
            if (paginationHeader) {
                pageNum = parseInt(paginationHeader);
            }
            let size = req.cookies.deviceName == "desktop" ? "250X360" : "250X360";
            let imageSize = "$image." + size;
            if (reqLang == config.DEFAULT_LANGUAGE) {
                Category.findOne({
                    _id: req.params.id
                }).exec((err, category) => {
                    let all_category = [];
                    if (category.children && category.children.length > 0) {
                        all_category = category.children.map(childrenId => {
                            return mongoose.Types.ObjectId(childrenId);
                        });
                    }
                    all_category.push(category._id);
                    return Product.aggregate([{
                                $match: {
                                    category: {
                                        $in: all_category
                                    },
                                    is_enabled: {
                                        $eq: true
                                    }
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
                                $lookup: {
                                    from: "offers",
                                    localField: "current_offer",
                                    foreignField: "_id",
                                    as: "current_offer"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "author",
                                    foreignField: "_id",
                                    as: "authors"
                                }
                            },
                            {
                                $project: {
                                    image: imageSize,
                                    previous_price: "$previous_price",
                                    price: "$price",
                                    name: "$name",
                                    seo_url: "$seo_url",
                                    current_offer: {
                                        $arrayElemAt: ["$current_offer.image", 0]
                                    },
                                    free_delivery: "$free_delivery",
                                    publisher: {
                                        _id: "$publisher._id",
                                        name: "$publisher.name",
                                        seo_url: "$publisher.seo_url"
                                    },
                                    author: {
                                        $let: {
                                            vars: {
                                                firstElem: {
                                                    $arrayElemAt: ["$authors", 0]
                                                }
                                            },
                                            in: {
                                                name: "$$firstElem.name",
                                                seo_url: "$$firstElem.seo_url"
                                            }
                                        }
                                    }
                                }
                            }
                        ])
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                        .exec()
                        .then(products => {
                            res.json(products);
                        })
                        .catch(err => {
                            res.send(err);
                        });
                });
            } else {
                Category.findOne({
                    _id: req.params.id
                }).exec((err, category) => {
                    let all_category = [];
                    if (category.children && category.children.length > 0) {
                        all_category = category.children.map(childrenId => {
                            return mongoose.Types.ObjectId(childrenId);
                        });
                    }
                    all_category.push(category._id);
                    Product.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    category: {
                                        $in: all_category
                                    },
                                    is_enabled: {
                                        $eq: true
                                    }
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
                                $unwind: "$lang"
                            },
                            {
                                $unwind: "$publisher"
                            },
                            {
                                $unwind: "$publisher.lang"
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
                                $lookup: {
                                    from: "authors",
                                    localField: "author",
                                    foreignField: "_id",
                                    as: "authors"
                                }
                            },
                            {
                                $project: {
                                    image: imageSize,
                                    previous_price: "$previous_price",
                                    price: "$price",
                                    name: "$lang.content.name",
                                    seo_url: "$seo_url",
                                    current_offer: {
                                        $arrayElemAt: ["$current_offer.image", 0]
                                    },
                                    free_delivery: "$free_delivery",
                                    publisher: {
                                        _id: "$publisher._id",
                                        name: "$publisher.lang.content.name",
                                        seo_url: "$publisher.seo_url"
                                            // seo_url: "$publisher.lang.content.seo_url"
                                    },
                                    author: {
                                        $let: {
                                            vars: {
                                                firstElem: {
                                                    $arrayElemAt: ["$authors", 0]
                                                }
                                            },
                                            in: {
                                                name: "$$firstElem.lang.content.name",
                                                seo_url: "$$firstElem.seo_url"
                                                    //   seo_url: "$$firstElem.lang.content.seo_url"
                                            }
                                        }
                                    }
                                }
                            }
                        ])
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                        .exec()
                        .then(products => {
                            res.json(products);
                        })
                        .catch(err => {
                            res.send(err);
                        });
                });
            }
        }
    });

    router.route("/content/reviews").get((req, res) => {
        let paginationHeader = req.headers["bz-pagination"];
        let pageNum =
            paginationHeader == undefined ? 1 : parseInt(paginationHeader);
        let itemsPerPage = parseInt(req.cookies.itemForDevice);
        let size = req.cookies.deviceName == "desktop" ? "250X360" : "42X60";
        let imageSize = "$image." + size;

        Product.count({
                reviews: {
                    $exists: true,
                    $not: {
                        $size: 0
                    }
                }
            },
            (err, count) => {
                return count;
            }
        ).then(count => {
            Product.aggregate([{
                        $match: {
                            reviews: {
                                $exists: true,
                                $not: {
                                    $size: 0
                                }
                            }
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
                        $unwind: "$author"
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
                            review: {
                                $slice: ["$reviews", 1]
                            },
                            seo_url: "$seo_url",
                            authorObj: {
                                name: "$author.name",
                                seo_url: "$author.seo_url",
                                description: "$author.description"
                            },
                            publisher: {
                                name: "$publisher.name",
                                seo_url: "$publisher.seo_url"
                            }
                        }
                    }
                ])
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec()
                .then(product => {
                    res.json({
                        count: count,
                        data: product
                    });
                })
                .catch(err => {
                    res.json(err);
                });
        });
    });

    router.route("/content/testimonials").get((req, res) => {
        let paginationHeader = req.headers["bz-pagination"];
        let pageNum =
            paginationHeader == undefined ? 1 : parseInt(paginationHeader);
        let itemsPerPage = parseInt(req.cookies.itemForDevice);
        let size = req.cookies.deviceName == "desktop" ? "150X150" : "50X50";
        let imageSize = "$image." + size;
        Testimonial.count((err, count) => {
            return count;
        }).then(count => {
            Testimonial.aggregate([{
                        $match: {
                            is_enabled: true
                        }
                    },
                    {
                        $project: {
                            name: "$name",
                            image: imageSize,
                            occupation: "$occupation",
                            designation: "$designation",
                            speech: "$speech",
                            speech_at: "$speech_at"
                        }
                    }
                ])
                .sort({
                    order: -1
                })
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec((err, testimonial) => {
                    if (err) {
                        res.send(err);
                    }
                    res.json({
                        count: count,
                        data: testimonial
                    });
                });
        });
    });

    /* GET purchase list */

    router.route("/content/purchases").get((req, res) => {
        let token = req.cookies.token || req.headers["token"];
        let paginationHeader = req.headers["bz-pagination"];
        let pageNum =
            paginationHeader == undefined ? 1 : parseInt(paginationHeader);
        let itemsPerPage = 20;

        let size = req.cookies.deviceName == "desktop" ? "250X360" : "42X60";
        let imageSize = "$image." + size;

        jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: "Please login first"
                });
            } else {


                let user = decoded; //user;
                if (!user._id) {
                    user = decoded._doc;
                }


                let result = new Object();
                PurchaseHistory.count({
                        created_by: user._id,
                        is_partially_processed: {
                            $ne: true
                        }
                    })
                    .exec()
                    .then(count => {
                        result.count = count;
                        return PurchaseHistory.find({
                                created_by: user._id,
                                is_partially_processed: {
                                    $ne: true
                                }
                            })
                            .populate({
                                path: "products.product_id",
                                select: "seo_url"
                            })
                            .sort({
                                order_at: -1
                            })
                            .skip(itemsPerPage * (pageNum - 1))
                            .limit(itemsPerPage);
                    })
                    .then(histories => {
                        result.histories = histories;
                        res.json(result);
                    })
                    .catch(err => {
                        res.json(err);
                    });
            }
        });
    });

    router.route("/content/purchases/cancel/:id").put((req, res) => {
        let token = req.cookies.token;
        let reqLang = req.cookies.lang || req.headers["lang"] || "bn";

        let current_order = new Object();
        Order.findOne({
                _id: req.params.id
            },
            (err, order) => {
                current_order = order;
                //   //console.log(current_order);
                if (err) {
                    res.send(err);
                } else {
                    order.current_order_status = {
                        status_id: "5a0d18fbead4e7ff21abce69",
                        status_name: "Cancelled",
                        updated_at: new Date()
                    };
                    order.performed_order_statuses.push(order.current_order_status);
                    // order.updated_by = req.user._id;
                    order.save(err => {
                        if (err) {
                            res.json({
                                success: false,
                                message: "Order Cancellation failed"
                            });
                        } else {
                            res.json({
                                success: true,
                                message: "Your order is cancelled successfully"
                            });
                        }
                    });
                }
            }
        );
    });

    router.route("/content/guest-purchase")
        .get((req, res) => {
            Order.findOne({
                    order_no: req.query.order_no
                })
                .exec()
                .then(order => {
                    if (order) {
                        Order.findOne({
                                order_no: req.query.order_no,
                                "delivery_address.phone_number": req.query.phone_number
                            })
                            .exec()
                            .then(order_phone => {
                                if (order_phone && order_phone._id) {
                                    res.json({
                                        status: true,
                                        info: order_phone
                                    });
                                } else {
                                    res.json({
                                        status: false,
                                        error: 'phone',
                                        message: "Invalid Phone Number"
                                    });
                                }
                            })
                    } else {
                        res.json({
                            status: false,
                            error: 'order',
                            message: "Invalid Order ID"
                        });
                    }

                })
                .catch(err => {
                    res.json({
                        status: false,
                        message: "Internal error. Please try again later."
                    });
                });
        });
};