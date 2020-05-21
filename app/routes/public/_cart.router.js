import Cart from "../../models/cart.model";
import config from "../../../config/config.json";
import Product from "../../models/product.model";
import Subscriber from "../../models/subscriber.model";
import Wallet from "../../models/wallet.model";
import {
    getNextSequence
} from "./api.service.js";
import mongoose from "mongoose";
import {
    request
} from "https";

export default (app, router, jwt) => {
    router
        .route("/cart")
        .get((req, res) => {
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            let paginationHeader = req.headers["bz-pagination"];
            let pageNum =
                paginationHeader == undefined ? 1 : parseInt(paginationHeader);
            let itemPerPage = parseInt(
                req.cookies.itemForDevice || req.headers["itemForDevice"]
            );

            let size =
                req.cookies.deviceName || req.headers["deviceName"] == "desktop" ?
                    "250X360" :
                    "250X360";
            let imageSize = "$image." + size;
            let authorImageSize = "$author.image." + size;

            let cart_similar_product = {
                cart: {},
                similar_product: []
            };

            let cart_filter_param;
            let subId = req.cookies.sub_id || req.headers["sub_id"];
            let cartId = req.cookies.cart_id || req.headers["cart_id"];



            if (subId) {
                //  //console.log("I am subId");
                cart_filter_param = {
                    created_by: subId
                };
            } else if (cartId) {
                //  //console.log("I am cartId");
                cart_filter_param = {
                    cart_id: cartId
                };
            } else {
                // //console.log("I am Blank");
                cart_filter_param = {
                    cart_id: ""
                };
            }

            Cart.findOne(cart_filter_param)
                .exec()
                .then(cart => {

                    if (cart && cart._id) {
                        if (cart.products.length > 0) {
                            cart_similar_product.cart = cart;
                            let updatePrice = cart_similar_product.cart.products.map(product => {
                                return new Promise(function (resolve, reject) {
                                    Product.findOne({
                                        _id: product.product_id
                                    }, {
                                        price: 1
                                    })
                                        .then(updatedProduct => {
                                            product.price = updatedProduct.price;
                                            resolve(product)
                                        })
                                })
                            })
                            return Promise.all(updatePrice)
                                .then(function () {
                                    res.json(cart_similar_product);
                                })
                                .catch(function (err) {
                                    console.log(err);
                                })



                            // });
                        } else {
                            if (cartId) {
                                cart_filter_param = {
                                    cart_id: cartId
                                };
                            } else {
                                cart_filter_param = {
                                    cart_id: ""
                                };
                            }
                            Cart.findOne(cart_filter_param)
                                .exec()
                                .then(cart => {
                                    cart_similar_product.cart = cart;
                                    res.json(cart_similar_product);
                                })
                        }
                    } else {
                        if (cartId) {
                            cart_filter_param = {
                                cart_id: cartId
                            };
                        } else {
                            cart_filter_param = {
                                cart_id: ""
                            };
                        }
                        Cart.findOne(cart_filter_param)
                            .exec()
                            .then(cart => {
                                if (!cart) {
                                    cart_similar_product.cart = {
                                        products: []
                                    };
                                } else {
                                    cart_similar_product.cart = cart;
                                }
                                res.json(cart_similar_product);
                            })
                    }
                })
                .catch({
                    products: []
                });
        })

        .post((req, res) => {
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            let paginationHeader = req.headers["bz-pagination"];
            let pageNum =
                paginationHeader == undefined ? 1 : parseInt(paginationHeader);
            let itemPerPage = parseInt(
                req.cookies.itemForDevice || req.headers["itemForDevice"]
            );
            let size =
                req.cookies.deviceName || req.headers["deviceName"] == "desktop" ?
                    "250X360" :
                    "250X360";
            let imageSize = "$image." + size;
            let authorImageSize = "$author.image." + size;
            let cart_similar_product = {
                cart: {},
                similar_product: []
            };

            let cart_filter_param;
            let subId = req.cookies.sub_id || req.headers["sub_id"];
            let cartId = req.cookies.cart_id || req.headers["cart_id"];

            if (subId) {
                cart_filter_param = {
                    created_by: subId
                };
            } else if (cartId) {
                cart_filter_param = {
                    cart_id: cartId
                };
            } else {
                cart_filter_param = {
                    cart_id: ""
                };
            }

            Cart.findOne(cart_filter_param).exec((err, cart) => {
                if (err) {
                    res.send(err);
                } else {


                    if (cart != null) {
                        if (req.body && req.body.products instanceof Array) {
                            if (req.cookies.sub_id || req.headers["sub_id"]) {
                                cart.created_by = req.cookies.sub_id || req.headers["sub_id"];
                                cart.discount = req.body.discount;
                                cart.promo_id = req.body.promo_id;
                                cart.referral_code = req.body.referral_code;
                            }

                            //Already Added Check
                            var book = req.body.products[0].product_id;

                            function search(nameKey, myArray) {
                                for (var i = 0; i < myArray.length; i++) {
                                    if (myArray[i].product_id == nameKey) {
                                        return myArray[i];
                                    }
                                }
                            }
                            var result = search(book, cart.products);

                            if (result == undefined) {
                                cart.products.push(req.body.products[0]);
                                cart
                                    .save()
                                    .then(cart => {
                                        cart_similar_product.cart = cart;
                                        return {
                                            products: cart.products
                                        };
                                    })
                                    .then(getCartInfo)
                                    .then(params => {
                                        return {
                                            categories: params.categories,
                                            products: params.products,
                                            reqLang: reqLang,
                                            imageSize: imageSize,
                                            authorImageSize: authorImageSize,
                                            pageNum: pageNum
                                        };
                                    })
                                    .then(findSimilarProduct)
                                    .then(similarProduct => {
                                        cart_similar_product.similar_product = similarProduct;
                                        res.json(cart_similar_product);
                                    });
                            } else {
                                return res.send({
                                    success: false,
                                    message: "Book Already Added",
                                    error: "added"
                                });
                            }
                        } else {
                            return res.send({
                                success: false,
                                message: "cart items not set or not instance of Array."
                            });
                        }
                    } else {
                        getNextSequence("cart_id").then(seq => {
                            Cart.create({
                                cart_id: seq,
                                status: req.body.status,
                                quantity: req.body.quantity,
                                wrapping_charge: req.body.wrapping_charge,
                                wallet_amount: req.body.wallet_amount,
                                wallet_id: req.body.wallet_id,
                                discount: req.body.discount,
                                promo_id: req.body.promo_id,
                                referral_code: req.body.referral_code,
                                total: req.body.total,
                                products: req.body.products,
                                created_by: req.cookies.sub_id ?
                                    req.cookies.sub_id : req.headers["sub_id"]
                            },
                                (err, cart) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        cart_similar_product.cart = cart;
                                        getCartInfo({
                                            products: cart.products
                                        })
                                            .then(params => {
                                                return {
                                                    categories: params.categories,
                                                    products: params.products,
                                                    reqLang: reqLang,
                                                    imageSize: imageSize,
                                                    authorImageSize: authorImageSize,
                                                    pageNum: pageNum
                                                };
                                            })
                                            .then(findSimilarProduct)
                                            .then(similarProduct => {
                                                cart_similar_product.similar_product = similarProduct;
                                                res.json(cart_similar_product);
                                            });
                                    }
                                }
                            );
                        });
                    }
                }
            });
        })

        .delete((req, res) => {
            let token = req.cookies.token || req.headers["token"];
            jwt.verify(token, config.SESSION_SECRET, function (err, decoded) {
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
                    Cart.findOne({
                        created_by: user._id
                    })
                        .exec()
                        .then(cart => {
                            if (cart != null) {
                                return Cart.remove({
                                    _id: cart._id
                                }, (err, message) => {
                                    if (err) res.send(err);

                                    res.send({
                                        message: "Cart removed"
                                    });
                                });
                            } else {
                                res.send({
                                    message: "There have no cart"
                                });
                            }
                        });
                }
            });
        });

    router
        .route("/cart/:id")
        .get((req, res) => {
            let token = req.cookies.token || req.headers["token"];
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
            let paginationHeader = req.headers["bz-pagination"];
            let pageNum =
                paginationHeader == undefined ? 1 : parseInt(paginationHeader);
            let itemPerPage = parseInt(
                req.cookies.itemForDevice || req.headers["itemForDevice"]
            );
            let size =
                req.cookies.deviceName || req.headers["deviceName"] == "desktop" ?
                    "250X360" :
                    "250X360";
            let imageSize = "$image." + size;
            let authorImageSize = "$author.image." + size;
            let cart_similar_product = {
                cart: {},
                similar_product: []
            };

            Cart.findOne({
                _id: req.params.id
            })
                .exec((err, cart) => {
                    if (err) {
                        res.send(err);
                    } else {
                        cart_similar_product.cart = cart;
                        return {
                            products: cart.products
                        };
                    }
                })
                .then(getCartInfo)
                .then(params => {
                    return {
                        categories: params.categories,
                        products: params.products,
                        reqLang: reqLang,
                        imageSize: imageSize,
                        authorImageSize: authorImageSize,
                        pageNum: pageNum
                    };
                })
                .then(findSimilarProduct)
                .then(similarProduct => {
                    cart_similar_product.similar_product = similarProduct;
                    res.json(cart_similar_product);
                });
            //     }
            // })
        })
        .put((req, res) => {

            let token = req.cookies.token || req.headers["token"];
            let reqLang = req.cookies.lang || req.headers["lang"] || "bn";

            if (req.body.promo_id) {
                req.body.referral_code = undefined;
            } else if (req.body.referral_code) {
                req.body.promo_id = undefined;
            }

            let paginationHeader = req.headers["bz-pagination"];
            let pageNum =
                paginationHeader == undefined ? 1 : parseInt(paginationHeader);
            let itemPerPage = parseInt(
                req.cookies.itemForDevice || req.headers["itemForDevice"]
            );
            let size =
                req.cookies.deviceName || req.headers["deviceName"] == "desktop" ?
                    "250X360" :
                    "250X360";
            let imageSize = "$image." + size;
            let authorImageSize = "$author.image." + size;
            let cart_similar_product = {
                cart: {},
                similar_product: []
            };

            Cart.findOne({
                _id: req.params.id
            },
                (err, cart) => {
                    if (err) res.send(err);
                    if (req.body._id) {
                        cart.products = req.body.products;
                        cart.wrapping_charge = req.body.wrapping_charge;
                        if (req.body.discount) cart.discount = req.body.discount;
                        cart.wallet_amount = req.body.wallet_amount;
                        cart.wallet_id = req.body.wallet_id;
                        cart.promo_id = req.body.promo_id;
                        cart.referral_code = req.body.referral_code;
                    }
                    cart.save()
                        .then(cart => {
                            cart_similar_product.cart = cart;
                            return {
                                products: cart.products
                            };
                        })
                        .then(getCartInfo)
                        .then(params => {
                            if (params != undefined) {
                                return {
                                    categories: params.categories,
                                    products: params.products,
                                    reqLang: reqLang,
                                    imageSize: imageSize,
                                    authorImageSize: authorImageSize,
                                    pageNum: pageNum
                                };
                            } else {
                                return false;
                            }
                        })
                        .then(findSimilarProduct)
                        .then(similarProduct => {
                            if (similarProduct) {
                                cart_similar_product.similar_product = similarProduct;
                                res.json(cart_similar_product);
                            } else {
                                res.json({
                                    item: false
                                });
                            }
                        });
                }
            );
        });

    function getCartInfo(params) {
        if (params.products != undefined) {
            return new Promise((resolve, reject) => {
                var products = params.products;
                var product_ids = products.map(product => {
                    return mongoose.Types.ObjectId(product.product_id);
                });

                Product.find()
                    .select({
                        _id: 0,
                        category: 1
                    })
                    .where("_id")
                    .in(product_ids)
                    .exec()
                    .then(result => {

                        var categories = [];
                        result.map(item => {
                            item.category.map(cat => {
                                categories.push(mongoose.Types.ObjectId(cat));
                            });
                        });
                        var results = {
                            categories: categories,
                            products: product_ids
                        };
                        resolve(results);
                    });
            });
        }
    }

    function findSimilarProduct(params) {
        if (params) {
            let categories = params.categories;
            let product_ids = params.products;
            let reqLang = params.reqLang;
            let imageSize = params.imageSize;
            let pageNum = params.pageNum;
            let authorImageSize = params.authorImageSize;
            if (reqLang == config.DEFAULT_LANGUAGE) {
                return Product.aggregate([{
                    $match: {
                        category: {
                            $in: categories
                        },
                        _id: {
                            $nin: product_ids
                        },
                        is_enabled: true
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
                            },
                            seo_url: {
                                $arrayElemAt: ["$author.seo_url", 0]
                            }
                        },
                        publisher: {
                            name: "$publisher.name",
                            seo_url: "$publisher.seo_url"
                        }
                    }
                }
                ])
                    .skip(5 * (pageNum - 1))
                    .limit(5)
                    .exec()
                    .then(similarproducts => {
                        return similarproducts;
                    });
            } else {
                return Product.aggregate([{
                    $match: {
                        "lang.code": reqLang,
                        category: {
                            $in: categories
                        },
                        _id: {
                            $nin: product_ids
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
                        free_delivery: "$free_delivery",
                        name: "$lang.content.name",
                        seo_url: "$seo_url",
                        authorObj: {
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
                        },
                        publisher: {
                            name: "$publisher.lang.content.name",
                            seo_url: "$publisher.seo_url"
                            // seo_url: "$publisher.lang.content.seo_url"
                        }
                    }
                }
                ])

                    .skip(5 * (pageNum - 1))
                    .limit(5)
                    .exec()
                    .then(similarproducts => {
                        return similarproducts;
                    });
            }
        }
    }
};

function searchProduct(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].r == nameKey) {
            return myArray[i].f;
        }
    }
}