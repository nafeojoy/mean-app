import Publisher from '../../models/publisher.model';
import Category from '../../models/category.model';
import Author from '../../models/author.model';
import Product from '../../models/product.model';
import Attributes from '../../models/attributes.model';
import config from '../../../config/config.json';
import api_config from './api_config.json';
import Counter from '../../models/seq.counter.model';
import Testimonial from '../../models/testimonial.model';
import Banner from '../../models/banner.model';
import Blog from '../../models/blog_content.model';
import Video from '../../models/video_content.model';
import Homeblock from '../../models/homeblock_content.model';
import PromotionalImage from '../../models/promotional-image.model';
import mongoose from 'mongoose';

let homePageRandom = 1;
export function getMenuCategories(req) {
    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Category.find({
                    parents: {
                        $size: 0
                    },
                    is_enabled: true
                })
                .select({
                    name: 1,
                    seo_url: 1,
                    order: 1
                })
                .sort({
                    order: 1
                })
                .limit(10)
                .exec().then(category => {
                    resolve(category)
                }).catch(err => {
                    reject(err);
                })
        });
    } else {
        return new Promise(function(resolve, reject) {
            Category.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                "parents": {
                                    $size: 0
                                },
                                "is_enabled": true
                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $project: {
                                name: "$lang.content.name",
                                order: "$order",
                                seo_url: "$seo_url",
                            }
                        },
                        {
                            $sort: {
                                order: 1
                            }
                        }
                    ]
                )
                .limit(10)
                .exec()
                .then(categories => {
                    resolve(categories)
                }).catch(err => {
                    reject(err);
                })
        });
    }
}


export function getFeatureCategories(req) {

    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang || req.headers['lang'] || 'bn';
    }
    let pageNum = 1;
    let itemsPerPage = 36 //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 8;
    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$featured_item." + size;
    let paginationHeader = req.headers['bz-pagination'];


    if (paginationHeader) {
        pageNum = parseInt(paginationHeader);
    }
    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Category.count((err, count) => {
                return count
            }).then(count => {
                Category.aggregate(
                        [{
                                $match: {
                                    hide_on_public: {
                                        $ne: true
                                    },
                                    "is_enabled": true
                                }
                            },
                            {
                                $sort: {
                                    featured_order: 1,
                                    name: 1
                                }
                            },
                            {
                                $project: {
                                    name: "$name",
                                    featured_item: imageSize,
                                    order: "$order",
                                    seo_url: "$seo_url"
                                }
                            },
                            // { $sort: { order: 1 } }
                        ]
                    )
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec().then(category => {
                        resolve(category);
                    }).catch(err => {
                        reject(err);
                    })
            })

        });
    } else {


        return new Promise(function(resolve, reject) {
            Category.count((err, count) => {
                return count
            }).then(count => {
                Category.aggregate(
                        [{
                                $match: {
                                    "lang.code": reqLang,
                                    hide_on_public: {
                                        $ne: true
                                    },
                                    // 'is_featured': true,
                                    "priority": { $exists: true },
                                    "is_enabled": true
                                }
                            },
                            {
                                $sort: {
                                    // featured_order: 1,
                                    priority: 1,
                                    name: 1
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $project: {
                                    featured_item: imageSize,
                                    name: "$lang.content.name",
                                    order: "$order",
                                    seo_url: "$seo_url",
                                    priority: "$priority",
                                }
                            },
                            // { $sort: { order: 1 } }
                        ]
                    )
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec().then(category => {

                        if (category.length < 1) {
                            Category.aggregate(
                                    [{
                                            $match: {
                                                "lang.code": reqLang,
                                                hide_on_public: {
                                                    $ne: true
                                                },
                                                $or: [{
                                                        'is_featured': false
                                                    },
                                                    {
                                                        'is_featured': {
                                                            $exists: false
                                                        }
                                                    }
                                                ],
                                                "is_enabled": true,

                                            }
                                        },
                                        {
                                            $sort: {
                                                featured_order: 1,
                                                name: 1
                                            }
                                        },
                                        {
                                            $unwind: "$lang"
                                        },
                                        {
                                            $project: {
                                                featured_item: imageSize,
                                                name: "$lang.content.name",
                                                order: "$order",
                                                seo_url: "$seo_url",
                                                priority: "$priority"

                                            }
                                        },
                                        // { $sort: { order: 1 } }
                                    ]
                                )
                                .skip(itemsPerPage * (pageNum - 1))
                                .limit(itemsPerPage)
                                .exec().then(categories => {
                                    resolve(categories)
                                })
                        } else {
                            resolve(category);
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })

        });
    }
}

function findCategoryProducts(params) {
    var categories = params.categories;
    var reqLang = params.lang;
    var itemsPerPage = parseInt(params.itemNumber);
    var imageSize = params.imageSize;
    homePageRandom = homePageRandom * (-1);

    var sortQuery = {}

    if (homePageRandom == 1) {
        sortQuery = {
            priority: 1
        }
    } else {
        sortQuery = {
            name: 1
        }
    }

    var productPromises = categories.map((category) => {
        return new Promise((resolve, reject) => {
            Product.aggregate(
                    [{
                            $match: {
                                "priority": {
                                    $ne: 100
                                },
                                "category": {
                                    $in: [category._id]
                                },
                                "is_enabled": {
                                    $eq: true
                                }
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
                            $project: {
                                image: imageSize,
                                preview_images: {
                                    $size: "$preview_images"
                                },
                                previous_price: "$previous_price",
                                price: "$price",
                                priority: "$priority",
                                free_delivery: "$free_delivery",
                                name: api_config.name[reqLang],
                                seo_url: "$seo_url",
                                is_out_of_stock: "$is_out_of_stock",
                                is_out_of_print: "$is_out_of_print",
                                publisher: api_config.publisher[reqLang],
                                author: api_config.single_author[reqLang],
                                current_offer: {
                                    $arrayElemAt: ["$current_offer.image", 0]
                                }
                            }
                        },
                        {
                            $sort: sortQuery
                        }
                    ]
                )
                .limit(itemsPerPage)
                .exec()
                .then((products) => {
                    var item = {};
                    item.category = category;
                    item.products = products;
                    resolve(item);
                }).catch(err => {
                    reject(err);
                });

        })
    });

    return Promise.all(productPromises);
}


export function getTabsData(req) {


    let skip = 0;
    if (req.scroll_no == 1) {
        skip = 5;
    }
    if (req.scroll_no == 2) {
        skip = 10;
    }

    //console.log('skip')
    //console.log(skip)

    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    return new Promise((resolve, reject) => {
        Category.aggregate([{
                    $match: {
                        "featured.status": true,
                        "is_enabled": true
                    }
                },
                {
                    $sort: {
                        'featured.tab_priority': 1
                    }
                },
                {
                    $unwind: "$lang"
                },
                {
                    $project: {
                        _id: "$_id",
                        seo_url: reqLang == config.DEFAULT_LANGUAGE ? "$seo_url" : "$seo_url",
                        name: reqLang == config.DEFAULT_LANGUAGE ? "$name" : "$lang.content.name",
                        'featured.tab_priority': 1
                    }
                }
            ])
            .skip(skip)
            .limit(5) // Should be 5

        .exec()
            .then(features => {

                let itemsPerPage = 15; //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 12;
                if (req.headers['app-device']) {
                    let device = JSON.parse(req.headers['app-device']);
                    reqLang = device.lang;
                    itemsPerPage = parseInt(device.itemForDevice);
                }
                let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
                let imageSize = "$image." + size;
                return findCategoryProducts({
                    "lang": reqLang,
                    "categories": features,
                    "itemNumber": itemsPerPage,
                    "imageSize": imageSize
                })
            })
            .then(tabsProd => {
                resolve(tabsProd)
            })
    })
}

function getTabsProduct(req, features) {
    let tabsProduct = features.map(feature => {
        return new Promise((resolve, reject) => {
            let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
            let itemsPerPage = req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 8;
            if (req.headers['app-device']) {
                let device = JSON.parse(req.headers['app-device']);
                reqLang = device.lang;
                itemsPerPage = parseInt(device.itemForDevice);
            }


            let size = req.cookies.deviceName == 'phone' ? '250X360' : '250X360';
            let imageSize = "$image." + size;
            findCategoryProducts({
                    "lang": reqLang,
                    "categories": feature.items,
                    "itemNumber": itemsPerPage,
                    "imageSize": imageSize
                })
                .then(pro => {
                    let res_data = {
                        type: feature._id,
                        data: pro
                    }
                    resolve(res_data)
                })
        })
    })
    return Promise.all(tabsProduct);
}



export function getCategoryTabs(req) {
    let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
    let itemsPerPage = req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 8;
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = parseInt(device.itemForDevice);
    }



    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {

            Category.find()
                .select({
                    name: 1
                })
                .where('is_show_home_tab').equals(true)
                .limit(5)
                .exec()
                .then((categories) => {
                    return {
                        "lang": reqLang,
                        "categories": categories,
                        "itemNumber": itemsPerPage,
                        "imageSize": imageSize
                    }
                })
                .then(findCategoryProducts)
                .then((items) => {
                    resolve(items)
                }).catch(err => {
                    reject(err);
                })
        });
    } else {
        return new Promise(function(resolve, reject) {
            Category.aggregate(
                [{
                        $match: {
                            "lang.code": reqLang,
                            "is_show_home_tab": {
                                $eq: true
                            },
                            "is_enabled": true
                        }
                    },
                    {
                        $unwind: "$lang"
                    },
                    {
                        $project: {
                            name: "$lang.content.name",
                            seo_url: "$seo_url",
                        }
                    }
                ]
            )

            .limit(itemsPerPage)
                .exec()
                .then((categories) => {
                    return {
                        lang: reqLang,
                        categories: categories,
                        "itemNumber": itemsPerPage,
                        "imageSize": imageSize
                    }
                })
                .then(findCategoryProducts)
                .then((items) => {
                    resolve(items)
                }).catch(err => {
                    reject(err);
                })
        });
    }
}

export function getCategorys(req) {
    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    let pageNum = 1;
    let itemsPerPage = 12 //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 5;
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }

    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    let paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
        pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Category.aggregate(
                    [{
                            $match: {
                                'is_featured': true,
                                'is_enabled': true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1,
                                name: 1
                            }
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$name",
                                seo_url: "$seo_url",
                                description: {
                                    $substrCP: ["$description", 0, 60]
                                }
                            }
                        }

                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(categorys => {
                    resolve(categorys)
                }).catch(err => {
                    reject(err);
                })
        });
    } else {
        return new Promise(function(resolve, reject) {
            Category.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                'is_featured': true,
                                'is_enabled': true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1,
                                name: 1
                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$lang.content.name",
                                seo_url: "$seo_url",
                                description: {
                                    $substrCP: ["$lang.content.description", 0, 60]
                                }
                            }
                        }
                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(categorys => {
                    resolve(categorys)
                }).catch(err => {
                    reject(err);
                })
        });
    }
}

export function getAuthors(req) {
    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    let pageNum = 1;
    let itemsPerPage = 12 //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 5;
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }

    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    let paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
        pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Author.aggregate(
                    [{
                            $match: {
                                'is_featured': true,
                                'is_enabled': true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1,
                                name: 1
                            }
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$name",
                                seo_url: "$seo_url",
                                description: {
                                    $substrCP: ["$description", 0, 60]
                                }
                            }
                        }
                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(authors => {
                    resolve(authors)
                }).catch(err => {
                    reject(err);
                })
        });
    } else {
        return new Promise(function(resolve, reject) {

            // console.log('layout')

            Author.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                'is_featured': true,
                                'is_enabled': true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1,
                                name: 1
                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$lang.content.name",
                                seo_url: "$seo_url",
                                description: {
                                    $substrCP: ["$lang.content.description", 0, 60]
                                }
                            }
                        }
                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(authors => {
                    resolve(authors)
                }).catch(err => {
                    reject(err);
                })
        });
    }
}

export function getPublishers(req) {
    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    let pageNum = 1;
    let itemsPerPage = 12 //req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 5;
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }

    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    let paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
        pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Publisher.aggregate(
                    [{
                            $match: {
                                'is_featured': true,
                                'is_enabled': true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1,
                                name: 1
                            }
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$name",
                                seo_url: "$seo_url",
                                description: {
                                    $substrCP: ["$description", 0, 60]
                                }
                            }
                        }
                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(publishers => {
                    resolve(publishers)
                }).catch(err => {
                    reject(err);
                })
        });
    } else {
        return new Promise(function(resolve, reject) {
            Publisher.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                'is_featured': true,
                                'is_enabled': true
                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $sort: {
                                featured_order: 1,
                                name: 1
                            }
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$lang.content.name",
                                seo_url: "$seo_url",
                                description: {
                                    $substrCP: ["$lang.content.description", 0, 60]
                                }
                            }
                        }
                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .exec().then(publishers => {
                    resolve(publishers)
                }).catch(err => {
                    reject(err);
                })
        });
    }
}


export function getNewReleases(req) {
    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
    let pageNum = 1;
    let itemsPerPage = req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 8;
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }
    var paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
        pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Product.aggregate(
                [{
                        $match: {
                            "is_enabled": {
                                $eq: true
                            }
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
                            name: "$name",
                            free_delivery: "$free_delivery",
                            price: "$price",
                            seo_url: "$seo_url",
                            publisher: {
                                _id: "$publisher._id",
                                name: "$publisher.name",
                                seo_url: "$publisher.seo_url"
                            },
                            current_offer: {
                                $arrayElemAt: ["$current_offer.image", 0]
                            }
                        }
                    }
                ]
            )

            .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .sort({
                    published_at: -1
                })
                .exec()
                .then(products => {
                    resolve(products)
                }).catch(err => {
                    reject(err);
                })
        });
    } else {
        return new Promise(function(resolve, reject) {
            Product.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                "is_enabled": {
                                    $eq: true
                                },
                            }
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
                            $unwind: "$publisher.lang"
                        },
                        {
                            $project: {
                                image: imageSize,
                                name: "$lang.content.name",
                                price: "$price",
                                free_delivary: "$free_delivary",
                                previous_price: "$previous_price",
                                seo_url: "$seo_url",
                                publisher: {
                                    _id: "$publisher._id",
                                    name: "$publisher.lang.content.name",
                                    seo_url: "$publisher.seo_url"
                                },
                                current_offer: {
                                    $arrayElemAt: ["$current_offer.image", 0]
                                }
                            }
                        }
                    ]
                )
                .skip(itemsPerPage * (pageNum - 1))
                .limit(itemsPerPage)
                .sort({
                    published_at: -1
                })
                .exec()
                .then(products => {
                    resolve(products)
                }).catch(err => {
                    reject(err);
                })
        });
    }
}

export function getCategoryProductsByName(req, catName) {
    let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
    var pageNum = 1,
        itemsPerPage = parseInt(req.cookies.itemForDevice);
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }
    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;
    var paginationHeader = req.headers['bz-pagination'];

    if (paginationHeader) {
        pageNum = parseInt(paginationHeader);
    }

    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise(function(resolve, reject) {
            Category.findOne()
                .where('hierarchy_path').equals(catName)
                .exec()
                .then(category => {
                    let search_cat_ids = category.children.map(function(childrenId) {
                        return mongoose.Types.ObjectId(childrenId)
                    });
                    search_cat_ids.push(category._id);
                    Product.aggregate(
                            [{
                                    $match: {
                                        "category": {
                                            $in: search_cat_ids
                                        },
                                        "is_enabled": {
                                            $eq: true
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
                                        from: "offers",
                                        localField: "current_offer",
                                        foreignField: "_id",
                                        as: "current_offer"
                                    }
                                },
                                // {$unwind: "$current_offer"},
                                {
                                    $project: {
                                        image: imageSize,
                                        price: "$price",
                                        previous_price: "$previous_price",
                                        name: "$name",
                                        seo_url: "$seo_url",
                                        current_offer: {
                                            $arrayElemAt: ["$current_offer.image", 0]
                                        },
                                        authorObj: {
                                            name: {
                                                $arrayElemAt: ["$author.name", 0]
                                            },
                                            seo_url: {
                                                $arrayElemAt: ["$author.seo_url", 0]
                                            }
                                        },
                                    }
                                }
                            ]
                        )
                        .exec()
                        .then(product => {
                            resolve(product)
                        }).catch(err => {
                            reject(err);
                        })
                })
        });
    } else {
        return new Promise(function(resolve, reject) {
            Category.findOne()
                .where('hierarchy_path').equals(catName)
                .exec()
                .then(category => {
                    let search_cat_ids = category.children.map(function(childrenId) {
                        return mongoose.Types.ObjectId(childrenId)
                    });
                    search_cat_ids.push(category._id);
                    Product.aggregate(
                            [{
                                    $match: {
                                        "lang.code": reqLang,
                                        "category": {
                                            $in: search_cat_ids
                                        },
                                        "is_enabled": {
                                            $eq: true
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
                                // {$unwind: "$current_offer"},
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
                                        authorObj: {
                                            name: {
                                                $arrayElemAt: [{
                                                    $arrayElemAt: ["$author.lang.content.name", 0]
                                                }, 0]
                                            },
                                            seo_url: {
                                                $arrayElemAt: ["$author.seo_url", 0]
                                            }

                                            // seo_url: { $arrayElemAt: [{ $arrayElemAt: ["$author.lang.content.seo_url", 0] }, 0] }
                                        },
                                    }
                                }
                            ]
                        )
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                        .sort({
                            published_at: -1
                        })
                        .exec()
                        .then(products => {
                            resolve(products)
                        }).catch(err => {
                            reject(err);
                        })

                })
        });
    }
}

export function getFeatureTabs(req) {

    var newProducts = [];
    let reqLang = req.cookies.lang || req.headers["lang"] || "bn";
    let itemsPerPage = req.cookies.itemForDevice ? parseInt(req.cookies.itemForDevice) : 8;
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang;
        itemsPerPage = device.itemForDevice ? parseInt(device.itemForDevice) : 8;
    }

    let size = req.cookies.deviceName == 'desktop' ? '250X360' : '250X360';
    let imageSize = "$image." + size;

    return new Promise(function(resolve, reject) {
        if (reqLang == config.DEFAULT_LANGUAGE) {
            getNewReleases(req)
                .then(newReleases => {
                    newProducts = newReleases;
                    let items = [];
                    return Category.find({
                            "is_show_feature_tab": true
                        }, {
                            name: 1,
                            seo_url: 1,
                            hierarchy_path: 1
                        })
                        .limit(5)
                })
                .then(categories => {
                    return {
                        lang: reqLang,
                        categories: categories,
                        itemNumber: itemsPerPage,
                        "imageSize": imageSize
                    }
                })
                .then(findCategoryProducts)
                .then((items) => {
                    items.unshift({
                        "category": {
                            _id: "new-release",
                            "name": "New Released"
                        },
                        "products": newProducts
                    })
                    resolve(items)
                }).catch(err => {
                    reject(err);
                })
        } else {
            getNewReleases(req)
                .then(newReleases => {
                    newProducts = newReleases;
                    let items = [];
                    return Category.aggregate(
                            [{
                                    $match: {
                                        "lang.code": reqLang,
                                        "is_show_feature_tab": {
                                            $eq: true
                                        }
                                    }
                                },
                                {
                                    $unwind: "$lang"
                                },
                                {
                                    $project: {
                                        hierarchy_path: "$hierarchy_path",
                                        name: "$lang.content.name",
                                        seo_url: "$seo_url",
                                    }
                                }
                            ]
                        )
                        .limit(5)
                        .exec()
                })
                .then(categories => {
                    return {
                        lang: reqLang,
                        categories: categories,
                        itemNumber: itemsPerPage,
                        "imageSize": imageSize
                    }
                })
                .then(findCategoryProducts)
                .then((items) => {
                    items.unshift({
                        "category": {
                            _id: "new-release",
                            "name": "নতুন উন্মোচিত"
                        },
                        "products": newProducts
                    })
                    resolve(items)
                }).catch(err => {
                    reject(err);
                })
        }
    })
}

function detailOfIds(barItem, req, cat_ids) {
    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang || req.headers['lang'] || 'bn';
    }
    let res_bar_item = {
        author: [],
        publisher: [],
        category: [],
        attributes: []
    }
    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise((resolve, reject) => {
            Author.find({
                    _id: {
                        $in: barItem.auths
                    }
                })
                .select({
                    name: 1,
                    seo_url: 1
                })
                .limit(20)
                .exec()
                .then(authors => {
                    res_bar_item.author = authors;
                    let search_ids = cat_ids ? cat_ids : barItem.cats;
                    return Category.find({
                            _id: {
                                $in: search_ids
                            }
                        })
                        .select({
                            name: 1,
                            seo_url: 1
                        })
                        .limit(20)
                })
                .then(categories => {
                    return getProductCountOfCategory(categories)
                })
                .then(categoryNItems => {
                    res_bar_item.category = categoryNItems.filter(itm => {
                        return itm.total_items > 0
                    });
                    return Publisher.find({
                            _id: {
                                $in: barItem.pubs
                            }
                        })
                        .select({
                            name: 1,
                            seo_url: 1
                        })
                        .limit(20)
                })
                .then(publishers => {
                    res_bar_item.publisher = publishers;
                    resolve(res_bar_item);
                })
                .catch(err => {
                    resolve(res_bar_item);
                })
        })
    } else {
        return new Promise((resolve, reject) => {
            Author.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                _id: {
                                    $in: barItem.auths
                                }
                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $group: {
                                _id: "$_id",
                                lang: {
                                    $first: "$lang"
                                }
                            }
                        },
                        {
                            $project: {
                                name: "$lang.content.name",
                                seo_url: "$seo_url",
                            }
                        }
                    ]
                )
                .limit(20)
                .exec()
                .then(fAuthor => {
                    res_bar_item.author = fAuthor
                    return Publisher.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    _id: {
                                        $in: barItem.pubs
                                    }
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    lang: {
                                        $first: "$lang"
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: "$lang.content.name",
                                    seo_url: "$seo_url",
                                }
                            }
                        ])
                        .limit(20)
                        .exec()
                })
                .then((fPublisher) => {
                    res_bar_item.publisher = fPublisher;
                    return Attributes.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    "is_featured": true
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    lang: {
                                        $first: "$lang"
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: "$lang.content.name",
                                }
                            }
                        ])
                        .limit(20)
                        .exec()
                })
                .then((fAttribute) => {
                    res_bar_item.attributes = fAttribute;
                    let search_ids = cat_ids ? cat_ids : barItem.cats;
                    return Category.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    _id: {
                                        $in: search_ids
                                    }
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $project: {
                                    name: "$lang.content.name",
                                    seo_url: "$seo_url",
                                }
                            }
                        ])
                        .limit(40)
                        .exec()
                })
                .then((fCategories) => {
                    return getProductCountOfCategory(fCategories)
                })
                .then(categoryNItems => {
                    res_bar_item.category = categoryNItems.filter(itm => {
                        return itm.total_items > 0
                    });
                    resolve(res_bar_item);
                })
        })
    }
}

export function getFeaturedBarData(model, req, cat_ids) {
    return new Promise((resolve, reject) => {
        model.findOne({
                _id: req.book_list_of
            })
            .select({
                name: 1,
                seo_url: 1,
                book_list: 1
            })
            .exec()
            .then(data => {
                let bar_data = {
                    cats: [],
                    auths: [],
                    pubs: []
                }
                data.book_list.map(bList => {
                    bar_data.cats.push(bList.category);
                    bar_data.auths.push(bList.author);
                    bar_data.pubs.push(bList.publisher);
                })
                return detailOfIds(bar_data, req, cat_ids)
            })
            .then(res_bar_data => {
                resolve(res_bar_data);
            })
    })
}

export function getDefaultFeaturedBarData(req) {
    let reqLang = req.cookies.lang || req.headers['lang'] || 'bn';
    if (req.headers['app-device']) {
        let device = JSON.parse(req.headers['app-device']);
        reqLang = device.lang || req.headers['lang'] || 'bn';
    }
    let featured = {
        author: [],
        publisher: [],
        category: [],
        attributes: []
    }
    if (reqLang == config.DEFAULT_LANGUAGE) {
        return new Promise((resolve, reject) => {
            Author.find()
                .where('is_featured').equals(true)
                .select({
                    name: 1,
                    seo_url: 1
                })
                .sort({
                    featured_order: 1
                })
                .limit(20)
                .exec()
                .then((fAuthor) => {
                    featured.author = fAuthor
                    return Publisher.find()
                        .where('is_featured').equals(true)
                        .select({
                            name: 1,
                            seo_url: 1
                        })
                        .sort({
                            featured_order: 1
                        })
                        .limit(20)
                })
                .then((fPublisher) => {
                    featured.publisher = fPublisher;
                    return Attributes.find()
                        .where('is_featured').equals(true)
                        .select({
                            name: 1
                        })
                        .sort({
                            featured_order: 1
                        })
                        .limit(20)
                })
                .then((fAttribute) => {
                    featured.attributes = fAttribute;
                    return Category.find()
                        .where('is_featured').equals(true)
                        .select({
                            name: 1,
                            seo_url: 1
                        })
                        .limit(20)
                })
                .then((fCategories) => {
                    return getProductCountOfCategory(fCategories)
                })
                .then(categoryNItems => {
                    featured.category = categoryNItems.filter(itm => {
                        return itm.total_items > 0
                    });
                    resolve(featured);
                })
        })
    } else {
        return new Promise((resolve, reject) => {
            Author.aggregate(
                    [{
                            $match: {
                                "lang.code": reqLang,
                                "is_featured": true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1
                            }
                        },
                        {
                            $unwind: "$lang"
                        },
                        {
                            $project: {
                                name: "$lang.content.name",
                                seo_url: "$seo_url",
                            }
                        }
                    ]
                )
                .limit(20)
                .exec()
                .then(fAuthor => {
                    featured.author = fAuthor
                    return Publisher.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    "is_featured": true
                                }
                            },
                            {
                                $sort: {
                                    featured_order: 1
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $project: {
                                    name: "$lang.content.name",
                                    seo_url: "$seo_url",
                                }
                            }
                        ])
                        .limit(20)
                        .exec()
                })
                .then((fPublisher) => {
                    featured.publisher = fPublisher;
                    return Attributes.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    "is_featured": true
                                }
                            },
                            {
                                $sort: {
                                    featured_order: 1
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $project: {
                                    name: "$lang.content.name",
                                }
                            }
                        ])
                        .limit(20)
                        .exec()
                })
                .then((fAttribute) => {
                    featured.attributes = fAttribute;
                    return Category.aggregate([{
                                $match: {
                                    "lang.code": reqLang,
                                    "is_featured": true
                                }
                            },
                            {
                                $unwind: "$lang"
                            },
                            {
                                $project: {
                                    name: "$lang.content.name",
                                    seo_url: "$seo_url",
                                }
                            }
                        ])
                        .limit(40)
                        .exec()
                })
                .then((fCategories) => {
                    return getProductCountOfCategory(fCategories)
                })
                .then(categoryNItems => {
                    featured.category = categoryNItems.filter(itm => {
                        return itm.total_items > 0
                    });
                    resolve(featured);
                })
        })
    }
}



function getProductCountOfCategory(categories) {
    let toBeResolved = categories.map(ctgr => {
        return new Promise((resolve, reject) => {
            Product.count({
                    category: ctgr._id
                })
                .exec()
                .then(num => {
                    resolve({
                        _id: ctgr._id,
                        name: ctgr.name,
                        seo_url: ctgr.seo_url,
                        total_items: num
                    })
                })
                .catch(err => {
                    resolve({
                        _id: ctgr._id,
                        name: ctgr.name,
                        seo_url: ctgr.seo_url,
                        total_items: 0
                    })
                })

        })
    })
    return Promise.all(toBeResolved);
}


export function getNextSequence(name) {
    return new Promise((resolve, reject) => {
        Counter.findByIdAndUpdate({
            _id: name
        }, {
            $inc: {
                seq: 1
            }
        }, {
            new: true
        }, function(error, counter) {
            if (error) {
                reject(error)
            }
            resolve(counter.seq)
        });
    });
}

export function getDateString(date_param) {
    let date_obj = new Date(date_param);
    return date_obj.getFullYear() + '-' + (date_obj.getMonth() + 1) + '-' + date_obj.getDate();
}


export function getHomeTestimonial(req) {
    return new Promise((resolve, reject) => {
        let size = req.cookies.deviceName == 'desktop' ? '150X150' : '50X50';
        let imageSize = "$image." + size;
        Testimonial.aggregate(
                [{
                        $match: {
                            "is_enabled": true
                        }
                    },
                    {
                        $project: {
                            name: "$name",
                            image: imageSize,
                            occupation: "$occupation",
                            designation: "$designation",
                            speech: "$speech",
                            speech_at: "$speech_at",
                        }
                    }
                ]
            )
            .sort({
                order: -1
            })
            .limit(5)
            .exec((err, testimonial) => {
                if (err) {
                    reject(err)
                }
                resolve(testimonial);
            })
    });
}

export function getHomeBanner() {
    return new Promise((resolve, reject) => {
        let res_result = new Object({
            success: true
        });
        Banner.find({
                is_enabled: true
            })
            .sort({
                'priority': 1
            })
            .exec()
            .then(banners => {
                resolve(banners);
            })
            .catch(err => {
                resolve(banners)
            })
    })
}
export function getBlog() {
    return new Promise((resolve, reject) => {
        let res_result = new Object({
            success: true
        });
        Blog.find({
                is_enabled: true
            })
            .sort({
                'priority': 1
            })
            .exec()
            .then(blogs => {
                resolve(blogs);
            })
            .catch(err => {
                resolve(blogs)
            })
    })
}
export function getVideo() {
    return new Promise((resolve, reject) => {
        let res_result = new Object({
            success: true
        });
        Video.find({
                is_enabled: true
            })
            .sort({
                'priority': 1
            })
            .exec()
            .then(videos => {
                resolve(videos);
            })
            .catch(err => {
                resolve(videos)
            })
    })
}
export function getHomeBlock() {
    return new Promise((resolve, reject) => {
        let res_result = new Object({
            success: true
        });
        Homeblock.find({
                is_enabled: true
            })
            .sort({
                'priority': 1
            })
            .exec()
            .then(homeblocks => {
                resolve(homeblocks);
            })
            .catch(err => {
                resolve(homeblocks)
            })
    })
}

export function getMobileProducts(req) {
    return new Promise((resolve, reject) => {
        let device = req.headers['app-device'] ? JSON.parse(req.headers['app-device']) : {};
        let reqLang = device.lang ? device.lang : 'bn';
        let pagenum = req.headers['bz-pagination'] ? parseInt(req.headers['bz-pagination']) : 1;
        let imageSize = "$image." + "250X360";
        if (reqLang == config.DEFAULT_LANGUAGE) {
            let resResult = new Object();
            Product.count({
                    "is_enabled": {
                        $eq: true
                    }
                })
                .exec()
                .then(count => {
                    resResult.count = count;
                    return Product.aggregate(
                            [{
                                    $match: {
                                        "is_enabled": {
                                            $eq: true
                                        },
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
                                    $project: {
                                        image: imageSize,
                                        previous_price: "$previous_price",
                                        price: "$price",
                                        name: "$name",
                                        seo_url: "$seo_url",
                                        click_url: "book",
                                        authorObj: {
                                            name: {
                                                $arrayElemAt: ["$author.name", 0]
                                            },
                                        }
                                    }
                                }
                            ]
                        )
                        .skip(8 * (pagenum - 1))
                        .limit(8)
                        .exec()

                })
                .then(products => {
                    resResult.data = products;
                    resolve(resResult);
                })
        } else {
            let resResult = new Object();
            Product.count({
                    "is_enabled": {
                        $eq: true
                    }
                })
                .exec()
                .then(count => {
                    resResult.count = count;
                    return Product.aggregate(
                            [{
                                    $match: {
                                        "lang.code": reqLang,
                                        "is_enabled": {
                                            $eq: true
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
                                    $unwind: "$lang"
                                },
                                {
                                    $project: {
                                        image: imageSize,
                                        previous_price: "$previous_price",
                                        price: "$price",
                                        name: "$lang.content.name",
                                        seo_url: "$seo_url",
                                        click_url: "book",
                                        authorObj: {
                                            name: {
                                                $arrayElemAt: [{
                                                    $arrayElemAt: ["$author.lang.content.name", 0]
                                                }, 0]
                                            },
                                        }
                                    }
                                }
                            ]
                        )
                        .skip(8 * (pagenum - 1))
                        .limit(8)
                        .exec()
                })
                .then(products => {
                    resResult.data = products;
                    resolve(resResult);
                })
                .catch(err => {
                    resResult = {
                        count: 0,
                        data: []
                    }
                    resolve(resResult);
                })
        }
    })
}


export function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

export function soundexSen(MyStr) {
    var GROUPSEPARATOR = " ";
    // replace certain text in strings with a slash
    var re = / v | v\. | vel | aka | false | recte | on zhe /gi;
    MyStr = MyStr.replace(re, '');

    // append soundex of each individual word
    var result = '';
    var MyStrArray = MyStr.split(/[\s|,]+/); // use space or comma as token delimiter

    // soundexExtra(MyStrArray).join(" ");

    for (var i in MyStrArray) {
        if (MyStrArray[i].length > 0) { // ignore null at ends of array (due to leading or trailing space)
            if (i != 0) {
                result += GROUPSEPARATOR;
            }
            result += soundex(MyStrArray[i]);
            if ((MyStrArray.length - 1) == i) {
                result += "";
            }
        }
    }

    let last_length = (MyStrArray[MyStrArray.length - 1]).length;
    if (result.slice(-3) == '000' && result.length > 4 && last_length < 3) {
        result = result.slice(0, -3);
    }
    return result;
}


//Update Existing Soundex Codes of Prducts
export function soundexUpdate(MyStr) {
    var GROUPSEPARATOR = " ";
    // replace certain text in strings with a slash
    // var re = / v | v\. | vel | aka | f | f. | r | r. | false | recte | on zhe /gi;
    var re = / v | v\. | vel | aka | false | recte | on zhe /gi;

    MyStr = MyStr.replace(re, '');


    // append soundex of each individual word
    var result = '';
    var MyStrArray = '';

    MyStrArray = MyStr.split(/[\s|,]+/); // use space or comma as token delimiter
    soundexExtra(MyStrArray).join(" ");

    for (var i in MyStrArray) {
        if (MyStrArray[i].length > 0) { // ignore null at ends of array (due to leading or trailing space)
            if (i != 0) {
                result += GROUPSEPARATOR;
            }
            result += soundex(MyStrArray[i]);
            if ((MyStrArray.length - 1) == i) {
                result += "";
            }
        }
    }
    let last_length = (MyStrArray[MyStrArray.length - 1]).length;

    if (result.slice(-3) == '000' && result.length > 4 && last_length < 3) {
        result = result.slice(0, -3);
    }


    return result;
}

export function soundex(s) {
    var a = s.toLowerCase().split(''),
        f = a.shift(),
        r = '',
        codes = {
            a: '',
            e: '',
            i: '',
            o: '',
            u: '',
            b: 1,
            f: 1,
            p: 1,
            v: 1,
            c: 2,
            g: 2,
            j: 2,
            k: 2,
            q: 2,
            s: 2,
            x: 2,
            z: 2,
            d: 3,
            t: 3,
            l: 4,
            m: 5,
            n: 5,
            r: 6
        };

    r = f +
        a
        .map(function(v, i, a) {
            return codes[v]
        })
        .filter(function(v, i, a) {
            return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
        })
        .join('');

    return (r + '000').slice(0, 4).toUpperCase();
};

//Generate Extra Soundex Code for optimum search results
export function soundexExtra(soundex) {

    let soundex_array = soundex;
    for (var i in soundex_array) {

        //Vowel Replaces
        if (soundex_array[i].charAt(0).toUpperCase() == 'A') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'E'));
            soundex_array.push(soundex_array[i].replaceAt(0, 'O'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'E') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'I'));
            soundex_array.push(soundex_array[i].replaceAt(0, 'A'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'I') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'E'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'O') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'A'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'V') {
            soundex_array.push(soundex_array[i].toUpperCase().replace('V', 'BH'));
        } else if (soundex_array[i].substring(0, 2).toUpperCase() == 'BH') {
            soundex_array.push(soundex_array[i].toUpperCase().replace('BH', 'V'));
        } else if (soundex_array[i].substring(0, 2).toUpperCase() == 'PH') {
            soundex_array.push(soundex_array[i].toUpperCase().replace('PH', 'F'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'F') {
            soundex_array.push(soundex_array[i].toUpperCase().replace('F', 'PH'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'C') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'K'));
            soundex_array.push(soundex_array[i].replaceAt(0, 'Q'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'K') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'C'));
            soundex_array.push(soundex_array[i].replaceAt(0, 'Q'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'Q') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'C'));
            soundex_array.push(soundex_array[i].replaceAt(0, 'K'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'J') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'Z'));
        } else if (soundex_array[i].charAt(0).toUpperCase() == 'Z') {
            soundex_array.push(soundex_array[i].replaceAt(0, 'J'));
        }
    }

    return soundex_array;

}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}