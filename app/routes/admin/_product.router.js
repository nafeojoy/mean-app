import Product from '../../models/product.model';
import Author from '../../models/author.model';
import Category from '../../models/category.model';
import Publisher from '../../models/publisher.model';

import {
    isSeoUnique,
    soundexSen,
    levenshteinDistance
} from './admin-api.service';
import {
    slugGenerate
} from '../../../config/slug-generator.service.js';
import mongoose from 'mongoose';

import {
    getNextSequence,
    imageIndex
} from './sequence.service';

import {
    updateProductsForBundleCreate,
    updateProductsForBundleUpdate,
    createProductSearchText
} from './product.service';

var array_length;
export default (app, router, auth, slug) => {

    router.route('/product')
        .post(auth, slug(Product), (req, res) => {
            let discounts_history = [{
                amount: req.body.previous_price,
                discounted_at: new Date()
            }]
            Product.create({
                name: req.body.name,
                description: req.body.description,
                published_at: req.body.published_at ? req.body.published_at : new Date(),
                published_year: req.body.published_at ? new Date(req.body.published_at).getFullYear() + "" : new Date().getFullYear() + "",
                import_id: req.body.image && req.body.image['120X175'] ? parseInt(req.body.image['120X175'].split('/')[4]) : undefined,
                image: req.body.image,
                is_checked_after_last_update: false,
                isbn: req.body.isbn,
                number_of_pages: req.body.number_of_pages,
                is_enabled: req.body.is_enabled,
                price: req.body.price == 0 ? req.body.previous_price : req.body.price,
                current_offer: req.body.current_offer,
                free_delivery: req.body.free_delivery,
                priority: req.body.priority,
                quantity: req.body.quantity,
                discounts: discounts_history,
                previous_price: req.body.previous_price,
                attributes: req.body.attributes,
                category: req.body.category,
                publisher: req.body.publisher._id,
                author: req.body.author,
                translator: req.body.translator,
                editor: req.body.editor,
                authors_are: req.body.authors_are,
                composer: req.body.composer,
                is_out_of_stock: req.body.is_out_of_stock,
                is_out_of_print: req.body.is_out_of_print,
                is_bundle: req.body.is_bundle,
                bundle_items: req.body.bundle_items,
                is_translated: (req.body.translator && req.body.translator.length > 0) ? true : false,
                meta_tag_title: req.body.meta_tag_title,
                meta_tag_description: req.body.meta_tag_description,
                meta_tag_keywords: req.body.meta_tag_keywords,
                seo_url: req.slug.seo_url,
                lang: req.body.lang,
                created_by: req.user._id,
                updated_by: req.user._id
            }, (err, product) => {
                if (err) {
                    res.send(err);
                } else {
                    createProductSearchText(product._id).then(search_text => {
                        getNextSequence('product_import_id').then(seq => {
                            product.import_id = seq;
                            product.discount_rate = product.previous_price == 0 ? 0 : ((product.previous_price - product.price) * 100) / product.previous_price
                            product.price = Math.ceil(product.price);
                            product.save(err => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    if (product.is_bundle) {
                                        updateProductsForBundleCreate(product.bundle_items, product._id).then(upSt => {
                                            res.json(product)
                                        });
                                    } else {
                                        res.json(product);
                                    }
                                }
                            })
                        })
                    })
                }
            });

        })

    .get((req, res, next) => {
        var pageNum = 1,
            itemsPerPage = 10,
            search = '';
        var paginationHeader = req.headers['bz-pagination'];

        if (paginationHeader) {
            var params = paginationHeader.split(',');
            pageNum = parseInt(params[0]);
            itemsPerPage = parseInt(params[1]);
        }
        Product.count((err, count) => {
                return count
            })
            .then(count => {
                let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
                let imageSize = "$image." + size;
                Product.aggregate(
                        [{
                                $lookup: {
                                    from: "authors",
                                    localField: "author",
                                    foreignField: "_id",
                                    as: "authorObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "bundle_items",
                                    foreignField: "_id",
                                    as: "bundle_itemsObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "translator",
                                    foreignField: "_id",
                                    as: "translatorObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "composer",
                                    foreignField: "_id",
                                    as: "composerObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "editor",
                                    foreignField: "_id",
                                    as: "editorObjects"
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
                                    from: "users",
                                    localField: "updated_by",
                                    foreignField: "_id",
                                    as: "updated_by"
                                }
                            },
                            {
                                $lookup: {
                                    from: "categories",
                                    localField: "category",
                                    foreignField: "_id",
                                    as: "categoryObject"
                                }
                            },
                            {
                                $unwind: "$publisher"
                            },
                            {
                                $unwind: "$updated_by"
                            },
                            {
                                $project: {
                                    name: "$name",
                                    sngImage: imageSize,
                                    image: "$image",
                                    import_id: "$import_id",
                                    is_enabled: "$is_enabled",
                                    description: "$description",
                                    published_at: "$published_at",
                                    current_offer: "$current_offer",
                                    priority: "$priority",
                                    price: "$price",
                                    previous_price: "$previous_price",
                                    discounted_price: "$discounted_price",
                                    discount_rate: "$discount_rate",
                                    preview_images: "$preview_images",
                                    back_cover_image: "$back_cover_image",
                                    lang: "$lang",
                                    isbn: "$isbn",
                                    number_of_pages: "$number_of_pages",
                                    seo_url: "$seo_url",
                                    quantity: "$quantity",
                                    meta_tag_title: "$meta_tag_title",
                                    meta_tag_description: "$meta_tag_description",
                                    meta_tag_keywords: "$meta_tag_keywords",
                                    author: "$authorObjects",
                                    is_bundle: "$is_bundle",
                                    bundle_items: "$bundle_itemsObjects",
                                    authors_are: '$authors_are',
                                    translator: "$translatorObjects",
                                    composer: "$composerObjects",
                                    editor: "$editorObjects",
                                    attributes: "$attributes",
                                    free_delivery: "$free_delivery",
                                    is_out_of_stock: "$is_out_of_stock",
                                    is_out_of_print: "$is_out_of_print",
                                    discount_rate: "$discount_rate",
                                    updated_by: {
                                        $concat: ["$updated_by.first_name", " ", "$updated_by.last_name"]
                                    },
                                    publisher: {
                                        _id: "$publisher._id",
                                        name: "$publisher.name",
                                        description: "$publisher.description"
                                    },
                                    category: "$categoryObject",
                                    updated_at: "$updated_at"
                                }
                            }
                        ]
                    )
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, products) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json({
                                'items': products,
                                'count': count
                            });
                        }
                    });
            }).catch(err => {
                res.send(err);
            });
    });

    router.route('/product/check-availability/:model')
        .get(auth, (req, res) => {
            let dataModel;
            let cond = new Object();
            switch (req.params.model) {
                case 'Author':
                    dataModel = Author.findOne({
                        seo_url: req.query.seo_url
                    })
                    break;
                case 'Category':
                    dataModel = Category.findOne({
                        seo_url: req.query.seo_url
                    })
                    break;
                case 'Publisher':
                    dataModel = Publisher.findOne({
                        seo_url: req.query.seo_url
                    })
                    break;
                default:
                    dataModel = Author.findOne({
                        seo_url: req.query.seo_url
                    })
            }
            dataModel.exec()
                .then(data => {
                    cond[req.params.model.toLowerCase()] = data._id;
                    return Product.count(cond)
                })
                .then(count => {
                    res.json({
                        success: true,
                        count: count,
                        cond: cond
                    })
                })
                .catch(err => {
                    res.json({
                        success: false,
                        err: err
                    })
                })
        })


    router.route('/product/bulk-update/price')
        .post(auth, (req, res) => {
            Product.find(req.body.cond)
                .exec()
                .then(products => {
                    return updateProductPrice(products, parseInt(req.body.amount))
                })
                .then(updates => {
                    res.json({
                        success: true
                    });
                })
                .catch(err => {
                    res.json({
                        success: false,
                        err: err
                    });
                })
        })

    function updateProductPrice(products, discount) {
        let updates = products.map(product => {
            return new Promise((resolve, reject) => {
                product.price = Math.ceil(product.previous_price - (product.previous_price * (discount / 100)));
                product.save(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: product._id
                        });
                    }
                })
            })
        })
        return Promise.all(updates);
    }

    router.route('/product-export/search-result')
        .post((req, res) => {
            let searchCriterionObj = new Object();
            if (req.body.discount_range) {
                searchCriterionObj.discount_rate = {
                    $lte: req.body.discount_range.to,
                    $gte: req.body.discount_range.from
                }
            }
            if (req.body.price_range) {
                searchCriterionObj.price = {
                    $lte: req.body.price_range.to,
                    $gte: req.body.price_range.from
                }
            }
            if (req.body.publisher_name || req.body.author_name || req.body.category_name) {
                var elmnt = [];
                if (req.body.publisher_name) {
                    elmnt.push(new RegExp(req.body.publisher_name, 'i'))
                }
                if (req.body.author_name) {
                    elmnt.push(new RegExp(req.body.author_name, 'i'))
                }
                if (req.body.category_name) {
                    elmnt.push(new RegExp(req.body.category_name, 'i'))
                }
                searchCriterionObj.search_text = {
                    $all: elmnt
                };
            }
            Product.aggregate(
                    [{
                            $match: searchCriterionObj
                        },
                        {
                            $project: {
                                name: "$name",
                                import_id: "$import_id",
                                discount_rate: "$discount_rate",
                                previous_price: "$previous_price",
                                current_price: "$price",
                                isbn: "$isbn",
                                description: "$description",
                                priority: "$priority",
                                look_inside: {
                                    $size: "$preview_images"
                                },
                                author: {
                                    $arrayElemAt: ["$accessories.authors_en.name", 0]
                                },
                                publisher: "$accessories.publisher_en.name",
                                category: {
                                    $arrayElemAt: ["$accessories.categories_en.name", 0]
                                }
                            }
                        }
                    ]
                )
                .exec()
                .then(result => {
                    res.json({
                        success: true,
                        data: result
                    })
                })
                .catch(err => {
                    res.json({
                        success: false
                    })
                })

        })



    router.route('/product-search')
        .post((req, res) => {
            let searchCriterionObj = new Object();
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let imageSize = "$image." + size;

            if (req.body.discount_range) {
                searchCriterionObj.discount_rate = {
                    $lte: req.body.discount_range.to,
                    $gte: req.body.discount_range.from
                }
            }

            if (req.body.price_range) {
                searchCriterionObj.price = {
                    $lte: req.body.price_range.to,
                    $gte: req.body.price_range.from
                }
            }

            if (req.body.import_id && req.body.import_id != '') {
                searchCriterionObj.import_id = req.body.import_id;
            }

            if (req.body.seo_url && req.body.seo_url != '') {
                req.body.seo_url = req.body.seo_url.trim();
                //console.log(req.body.seo_url);
                searchCriterionObj.seo_url = req.body.seo_url;
            }

            let itemsPerPage = req.body.itemsPerPage || 10;
            let pageNum = req.body.pageNum || 1;

            if (req.body.publisher_name || req.body.author_name || req.body.category_name) {
                var elmnt = [];
                if (req.body.publisher_name) {
                    elmnt.push(new RegExp(req.body.publisher_name, 'i'))
                }
                if (req.body.author_name) {
                    elmnt.push(new RegExp(req.body.author_name, 'i'))
                }
                if (req.body.category_name) {
                    elmnt.push(new RegExp(req.body.category_name, 'i'))
                }
                searchCriterionObj.search_text = {
                    $all: elmnt
                };
            }
            Product.count(searchCriterionObj, (err, count) => {
                Product.aggregate(
                        [{
                                $match: searchCriterionObj
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "author",
                                    foreignField: "_id",
                                    as: "authorObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "bundle_items",
                                    foreignField: "_id",
                                    as: "bundle_itemsObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "translator",
                                    foreignField: "_id",
                                    as: "translatorObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "composer",
                                    foreignField: "_id",
                                    as: "composerObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "editor",
                                    foreignField: "_id",
                                    as: "editorObjects"
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
                                    from: "categories",
                                    localField: "category",
                                    foreignField: "_id",
                                    as: "categoryObject"
                                }
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "updated_by",
                                    foreignField: "_id",
                                    as: "updated_by"
                                }
                            },
                            {
                                $unwind: "$updated_by"
                            },
                            {
                                $unwind: "$publisher"
                            },
                            {
                                $project: {
                                    name: "$name",
                                    sngImage: imageSize,
                                    image: "$image",
                                    import_id: "$import_id",
                                    is_enabled: "$is_enabled",
                                    description: "$description",
                                    published_at: "$published_at",
                                    current_offer: "$current_offer",
                                    priority: "$priority",
                                    price: "$price",
                                    previous_price: "$previous_price",
                                    discounted_price: "$discounted_price",
                                    discount_rate: "$discount_rate",
                                    preview_images: "$preview_images",
                                    back_cover_image: "$back_cover_image",
                                    lang: "$lang",
                                    isbn: "$isbn",
                                    number_of_pages: "$number_of_pages",
                                    seo_url: "$seo_url",
                                    quantity: "$quantity",
                                    meta_tag_title: "$meta_tag_title",
                                    meta_tag_description: "$meta_tag_description",
                                    meta_tag_keywords: "$meta_tag_keywords",
                                    authors_are: '$authors_are',
                                    author: "$authorObjects",
                                    is_bundle: "$is_bundle",
                                    bundle_items: "$bundle_itemsObjects",
                                    translator: "$translatorObjects",
                                    composer: "$composerObjects",
                                    editor: "$editorObjects",
                                    discount_rate: "$discount_rate",
                                    attributes: "$attributes",
                                    free_delivery: "$free_delivery",
                                    updated_by: {
                                        $concat: ["$updated_by.first_name", " ", "$updated_by.last_name"]
                                    },
                                    publisher: {
                                        _id: "$publisher._id",
                                        name: "$publisher.name",
                                        description: "$publisher.description"
                                    },
                                    category: "$categoryObject",
                                }
                            }
                        ]
                    )
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, products) => {
                        if (!err) {
                            res.json({
                                count: count,
                                items: products
                            })
                        } else {
                            res.json({
                                count: 0,
                                items: [],
                                err: err
                            })
                        }
                    })
            })
        })
        .get((req, res, next) => {
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let imageSize = "$image." + size;
            var pageNum = 1,
                itemsPerPage = 10,
                search = '';
            var escape = require('escape-regexp');
            var paginationHeader = req.headers['bz-pagination'];
            let searchCriterionObj = new Object();
            if (paginationHeader) {
                var params = paginationHeader.split(',');
                pageNum = parseInt(params[0]);
                itemsPerPage = parseInt(params[1]);
                let bname = req.query.bname;
                if (bname == 'undefined' || bname == '') {
                    search = '';
                } else {
                    search = bname;
                    search = escape(search);
                    searchCriterionObj.name = {
                        $regex: search,
                        $options: 'i'
                    }
                }
            }
            Product.count(searchCriterionObj, (err, count) => {
                    return count
                })
                // .where('name').equals(new RegExp(search, 'i'))
                .then(count => {
                    Product.aggregate(
                            [{
                                    $match: searchCriterionObj
                                },
                                {
                                    $lookup: {
                                        from: "authors",
                                        localField: "author",
                                        foreignField: "_id",
                                        as: "authorObjects"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "products",
                                        localField: "bundle_items",
                                        foreignField: "_id",
                                        as: "bundle_itemsObjects"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "authors",
                                        localField: "translator",
                                        foreignField: "_id",
                                        as: "translatorObjects"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "authors",
                                        localField: "composer",
                                        foreignField: "_id",
                                        as: "composerObjects"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "authors",
                                        localField: "editor",
                                        foreignField: "_id",
                                        as: "editorObjects"
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
                                        from: "categories",
                                        localField: "category",
                                        foreignField: "_id",
                                        as: "categoryObject"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "updated_by",
                                        foreignField: "_id",
                                        as: "updated_by"
                                    }
                                },
                                {
                                    $unwind: "$updated_by"
                                },
                                {
                                    $unwind: "$publisher"
                                },
                                {
                                    $project: {
                                        name: "$name",
                                        sngImage: imageSize,
                                        image: "$image",
                                        import_id: "$import_id",
                                        is_enabled: "$is_enabled",
                                        description: "$description",
                                        published_at: "$published_at",
                                        current_offer: "$current_offer",
                                        priority: "$priority",
                                        price: "$price",
                                        previous_price: "$previous_price",
                                        discounted_price: "$discounted_price",
                                        discount_rate: "$discount_rate",
                                        preview_images: "$preview_images",
                                        back_cover_image: "$back_cover_image",
                                        lang: "$lang",
                                        isbn: "$isbn",
                                        number_of_pages: "$number_of_pages",
                                        seo_url: "$seo_url",
                                        quantity: "$quantity",
                                        meta_tag_title: "$meta_tag_title",
                                        meta_tag_description: "$meta_tag_description",
                                        meta_tag_keywords: "$meta_tag_keywords",
                                        author: "$authorObjects",
                                        authors_are: '$authors_are',
                                        is_bundle: "$is_bundle",
                                        bundle_items: "$bundle_itemsObjects",
                                        translator: "$translatorObjects",
                                        editor: "$editorObjects",
                                        composer: "$composerObjects",
                                        discount_rate: "$discount_rate",
                                        attributes: "$attributes",
                                        free_delivery: "$free_delivery",
                                        updated_by: {
                                            $concat: ["$updated_by.first_name", " ", "$updated_by.last_name"]
                                        },
                                        publisher: {
                                            _id: "$publisher._id",
                                            name: "$publisher.name",
                                            description: "$publisher.description"
                                        },
                                        category: "$categoryObject",
                                    }
                                }
                            ]
                        )
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                        .exec((err, products) => {
                            if (err) {
                                res.send(err);
                            } else {
                                if (products.length < 1 && search.length > 0) {
                                    let condition = {};
                                    let lmt = 12 - products.length;
                                    var soundex_all = soundexSen(search).split(" ").map(val => {
                                        return new RegExp(val)
                                    })
                                    condition = {
                                        $or: [{
                                                "soundex_code": {
                                                    $all: soundex_all
                                                }
                                            },
                                            {
                                                "search_text": {
                                                    $regex: search,
                                                    $options: 'i'
                                                }
                                            }
                                        ]
                                    }

                                    Product.aggregate([{
                                                $match: condition
                                            },
                                            {
                                                $lookup: {
                                                    from: "authors",
                                                    localField: "author",
                                                    foreignField: "_id",
                                                    as: "authorObjects"
                                                }
                                            },

                                            {
                                                $lookup: {
                                                    from: "products",
                                                    localField: "bundle_items",
                                                    foreignField: "_id",
                                                    as: "bundle_itemsObjects"
                                                }
                                            },

                                            {
                                                $lookup: {
                                                    from: "authors",
                                                    localField: "translator",
                                                    foreignField: "_id",
                                                    as: "translatorObjects"
                                                }
                                            },
                                            {
                                                $lookup: {
                                                    from: "authors",
                                                    localField: "composer",
                                                    foreignField: "_id",
                                                    as: "composerObjects"
                                                }
                                            },
                                            {
                                                $lookup: {
                                                    from: "authors",
                                                    localField: "editor",
                                                    foreignField: "_id",
                                                    as: "editorObjects"
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
                                                    from: "categories",
                                                    localField: "category",
                                                    foreignField: "_id",
                                                    as: "categoryObject"
                                                }
                                            },
                                            {
                                                $unwind: "$publisher"
                                            },
                                            {
                                                $project: {
                                                    name: "$name",
                                                    sngImage: imageSize,
                                                    image: "$image",
                                                    is_enabled: "$is_enabled",
                                                    import_id: "$import_id",
                                                    description: "$description",
                                                    published_at: "$published_at",
                                                    current_offer: "$current_offer",
                                                    price: "$price",
                                                    previous_price: "$previous_price",
                                                    discounted_price: "$discounted_price",
                                                    discount_rate: "$discount_rate",
                                                    lang: "$lang",
                                                    isbn: "$isbn",
                                                    number_of_pages: "$number_of_pages",
                                                    priority: "$priority",
                                                    seo_url: "$seo_url",
                                                    quantity: "$quantity",
                                                    meta_tag_title: "$meta_tag_title",
                                                    meta_tag_description: "$meta_tag_description",
                                                    meta_tag_keywords: "$meta_tag_keywords",
                                                    author: "$authorObjects",
                                                    authors_are: '$authors_are',
                                                    translator: "$translatorObjects",
                                                    editor: "$editorObjects",
                                                    composer: "$composerObjects",
                                                    free_delivery: "$free_delivery",
                                                    is_bundle: "$is_bundle",
                                                    bundle_items: "$bundle_itemsObjects",
                                                    preview_images: "$preview_images",
                                                    back_cover_image: "$back_cover_image",
                                                    discount_rate: "$discount_rate",
                                                    attributes: "$attributes",
                                                    publisher: {
                                                        _id: "$publisher._id",
                                                        name: "$publisher.name",
                                                        description: "$publisher.description"
                                                    },
                                                    category: "$categoryObject"
                                                }
                                            },
                                        ])
                                        .skip(itemsPerPage * (pageNum - 1))
                                        .exec()
                                        .then(restProduct => {
                                            search = '^' + search;
                                            let myprod = [];

                                            restProduct.forEach(element => {
                                                let p = levenshteinDistance(search, element.name);
                                                if (Math.abs(p) < 10) {
                                                    myprod = myprod.concat(element)
                                                } else if (Math.abs(p) < 50) {
                                                    myprod = myprod.concat(element)
                                                } else if (Math.abs(p) < 100) {
                                                    myprod = myprod.concat(element)
                                                } else if (Math.abs(p) < 500) {
                                                    myprod = myprod.concat(element)
                                                }
                                            });
                                            myprod = myprod.slice(0, 20);
                                            res.json({
                                                'items': myprod,
                                                'count': count
                                            });
                                        })
                                        .catch(err => {
                                            let err_data = [];
                                            res.json(err_data)
                                        })

                                } else {
                                    res.json({
                                        'items': products,
                                        'count': count
                                    });
                                }
                            }
                        })

                }).catch(err => {
                    res.send(err);
                });
        });


    router.route('/product/:id')
        .get((req, res) => {
            Product.findOne({
                    '_id': req.params.id
                })
                .populate({
                    path: 'publisher',
                    select: 'name description'
                })
                .populate({
                    path: 'author',
                    select: 'name description'
                })
                .populate({
                    path: 'category',
                    select: 'hierarchy_path'
                })
                .exec((err, product) => {
                    if (err)
                        res.send(err);
                    else
                        res.json(product);
                })
        })
        .put(auth, (req, res) => {
            let bundleObj = new Object();
            let product;
            Product.findOne({
                    _id: req.params.id
                })
                .exec()
                .then(data => {
                    if (data && data._id) {
                        product = data;
                        if (product.name != req.body.name) {
                            //console.log("Generate");
                            return slugGenerate(Product, req)
                        } else {
                            //console.log("No Generate");
                            return Promise.resolve({
                                seo_not_change: true
                            })
                        }
                    } else {
                        res.json({
                            success: false
                        });
                        return false;
                    }
                })
                .then(info => {
                    //console.log(info);
                    try {
                        req.body.lang[0].content.seo_url = product.lang[0].content.seo_url;
                    } catch (error) {
                        //console.log(error);
                    }
                    if (!info.seo_not_change) {
                        product.seo_url = info.seo_url;
                    }
                    if (req.body.price) {
                        let discount = {
                            amount: req.body.price,
                            discounted_at: new Date()
                        }
                        product.discounts.unshift(discount);
                        product.previous_price = req.body.previous_price;
                    }

                    if (req.body.is_bundle) {
                        bundleObj.old_bundle_item = product.bundle_items;
                        bundleObj.new_bundle_items = req.body.bundle_items;
                        bundleObj.is_enabled = req.body.is_enabled;
                        bundleObj.has_bundle_change = JSON.stringify(req.body.bundle_item) == JSON.stringify(product.bundle_item);
                    }

                    try {
                        product.name = req.body.name;
                        product.description = req.body.description;
                        product.published_at = req.body.published_at;
                        product.is_out_of_stock = req.body.is_out_of_stock;
                        product.is_out_of_print = req.body.is_out_of_print;
                        product.published_year = new Date(req.body.published_at).getFullYear() + "";
                        product.image = req.body.image;
                        product.isbn = req.body.isbn;
                        product.number_of_pages = req.body.number_of_pages;
                        product.is_enabled = req.body.is_enabled;
                        product.price = req.body.price == undefined ? req.body.previous_price : req.body.price;
                        product.price = Math.ceil(product.price);
                        product.discount_rate = req.body.discount_rate;
                        product.current_offer = req.body.current_offer;
                        product.priority = req.body.priority;
                        product.quantity = req.body.quantity;
                        product.category = req.body.category;
                        product.is_checked_after_last_update = false;
                        product.publisher = req.body.publisher._id == undefined ? req.body.publisher : req.body.publisher._id;
                        product.author = req.body.author;
                        product.translator = req.body.translator;
                        product.editor = req.body.editor,
                            product.authors_are = req.body.authors_are,
                            product.composer = req.body.composer,
                            product.is_bundle = req.body.is_bundle;
                        product.bundle_items = req.body.bundle_items;
                        product.is_translated = (req.body.translator && req.body.translator.length > 0) ? true : false;
                        product.free_delivery = req.body.free_delivery;
                        product.attributes = req.body.attributes;
                        product.meta_tag_title = req.body.meta_tag_title == undefined ? product.meta_tag_title : req.body.meta_tag_title;
                        product.meta_tag_description = req.body.meta_tag_description == undefined ? product.meta_tag_description : req.body.meta_tag_description;
                        product.meta_tag_keywords = req.body.meta_tag_keywords == undefined ? product.meta_tag_keywords : req.body.meta_tag_keywords;
                        product.lang = req.body.lang;
                        product.lang = req.body.lang;
                        product.updated_by = req.user._id;
                        product.updated_at = new Date();
                        product.discount_rate = product.previous_price == 0 ? 0 : ((product.previous_price - product.price) * 100) / product.previous_price;
                    } catch (error) {
                        //console.log(error);
                    }

                    product.save((err) => {
                        if (err) {
                            //console.log(err);
                            res.send(err);
                        } else {
                            createProductSearchText(product._id)
                                .then(searc_rslt => {
                                    if (searc_rslt && searc_rslt.error) {
                                        return res.send(product);
                                    }
                                    if (bundleObj.has_bundle_change) {
                                        updateProductsForBundleUpdate(bundleObj, product._id)
                                            .then(info => {
                                                res.json(product)
                                            })
                                            .catch(err => {
                                                res.json({
                                                    success: false,
                                                    error: err
                                                });
                                            })
                                    } else {
                                        return res.send(product);
                                    }
                                })
                                .catch(err => {
                                    res.json({
                                        success: false,
                                        error: err
                                    });
                                })
                        }
                    });
                })
                .catch(err => {
                    //console.log("Final error");
                    res.send(err)
                })
        })
        .delete((req, res) => {
            Product.remove({
                _id: req.params.id
            }, (err, restData) => {
                if (err)
                    res.send(err);
                else
                    res.send({
                        "message": "Data Deleted",
                        "status": 1
                    });
            });
        })


    router.route('/product/soundex-enabled-search/:term')
        .get((req, res) => {
            let params = {
                expression: req.params.term,
                reqLang: 'bn'
            };
            let projection = {
                price: "$price",
                name: { $arrayElemAt: ['$lang.content.name', 0] },
                engname: { $arrayElemAt: ['$lang.content.name', 0] },
                seo_url: "$seo_url",
                authorObj: {
                    name: {
                        $arrayElemAt: ["$accessories.authors_bn.name", 0]
                    },
                    _id: { $arrayElemAt: ['$author', 0] }
                },
                auths: "$author",
                publisherObj: {
                    name: "$accessories.publisher_bn.name",
                    _id: "$publisher"
                },
                purchase_history: "$purchase_history"
            }
            if (params.expression.charCodeAt(0) < 2000) {
                var regExpr = /[^a-zA-Z0-9-. ]/g;
                var searchString = params.expression.replace(regExpr, ""); //Removing Special Character
                let mainstring = new RegExp(searchString, "i");

                /* #region  For Splitted Words*/
                var escape = require("escape-regexp");
                let start = '^' + escape(params.expression);
                let splittedString = start.split(" ");
                var final = [];
                for (let i = 0; i < splittedString.length; i++) {
                    final[i] = new RegExp(splittedString[i], "i");
                }

                Product.aggregate([{
                            $match: {
                                is_enabled: {
                                    $eq: true
                                },
                                $or: [{
                                    name: mainstring,
                                }]
                            }
                        },
                        {
                            $project: projection
                        }
                    ])
                    .limit(12)
                    .exec()
                    .then(product => {
                        if (product.length < 1) {
                            let condition = {};
                            let lmt = 12 - product.length;
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
                            Product.aggregate([{
                                        $match: condition
                                    },
                                    {
                                        $project: projection
                                    },
                                    {
                                        $sort: {
                                            name: 1
                                        }
                                    }
                                ])
                                .limit(5000)
                                .exec()
                                .then(restProduct => {
                                    start = "^" + start;
                                    product = product.concat(restProduct);
                                    let myprod = [];
                                    product.forEach(element => {
                                        let p = levenshteinDistance(start, element.name);
                                        if (Math.abs(p) < 10) {
                                            myprod = myprod.concat(element);
                                        } else if (Math.abs(p) < 50) {
                                            myprod = myprod.concat(element);
                                        } else if (Math.abs(p) < 100) {
                                            myprod = myprod.concat(element);
                                        } else if (Math.abs(p) < 500) {
                                            myprod = myprod.concat(element);
                                        }
                                    });
                                    heapSort(myprod);
                                    myprod = myprod.slice(0, 12);
                                    if (myprod.length > 0) {
                                        res.json(myprod);
                                    } else {
                                        res.json(false);
                                    }
                                })
                                .catch(err => {
                                    let err_data = [];
                                    res.json(err_data);
                                });
                        } else {
                            res.json(product);
                        }
                    })
                    .catch(err => {
                        let err_data = [];
                        res.json(err_data);
                    });
            } else {

                var escape = require("escape-regexp");
                let start = '^' + escape(params.expression);
                let splittedString = start.split(" ");
                var final = [];
                for (let i = 0; i < splittedString.length; i++) {
                    final[i] = new RegExp(splittedString[i], "i");
                }
                Product.aggregate([{
                            $match: {
                                "lang.code": params.reqLang,
                                is_enabled: {
                                    $eq: true
                                },
                                $or: [{
                                    "lang.content.name": {
                                        $all: final
                                    }
                                }]
                            }
                        },
                        {
                            $project: projection
                        }
                    ])
                    .limit(500)
                    .exec()
                    .then(product => {
                        if (product.length < 1) {
                            let condition = {};
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
                                is_enabled: {
                                    $eq: true
                                },
                                "lang.code": 'bn',
                                $or: [{
                                        "lang.content.name": {
                                            $in: finalString
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
                            Product.aggregate([{
                                        $match: condition
                                    },
                                    {
                                        $project: projection
                                    }
                                ])
                                .limit(5000)
                                .exec()
                                .then(restProduct => {
                                    product = product.concat(restProduct);
                                    let myprod = [];
                                    product.forEach(element => {
                                        if (myprod.length < 24) {
                                            let p = levenshteinDistance(start, element.engname);
                                            if (Math.abs(p) < 10) {
                                                myprod = myprod.concat(element);
                                            } else if (Math.abs(p) < 50) {
                                                myprod = myprod.concat(element);
                                            } else if (Math.abs(p) < 100) {
                                                myprod = myprod.concat(element);
                                            } else if (Math.abs(p) < 10000) {
                                                myprod = myprod.concat(element);
                                            }
                                        } else {
                                            return;
                                        }
                                    });
                                    heapSort(myprod);
                                    if (params.pagenum > 1) {
                                        myprod = myprod.splice(12 * (params.pagenum - 1), 12);
                                    }
                                    myprod = myprod.slice(0, 12);
                                    if (myprod.length > 0) {
                                        res.json(myprod);
                                    } else {
                                        res.json(myprod);
                                    }
                                })
                                .catch(err => {
                                    let err_data = [];
                                    res.json(err_data);
                                });
                        } else {
                            let myprod = [];
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
                            heapSort(myprod);
                            if (params.pagenum > 1) {
                                myprod = myprod.splice(12 * (params.pagenum - 1), 12);
                            }
                            myprod = myprod.slice(0, 12);

                            if (myprod.length > 0) {
                                res.json(myprod);
                            } else {
                                res.json(myprod);
                            }
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        let err_data = [];
                        res.json(err_data);
                    });
            }
        })


    router.route('/product/search/v1')
        .get((req, res) => {
            var pageNum = 1,
                itemsPerPage = 50;
            var terms = req.query.search;
            var escape = require('escape-regexp');
            let start = escape(terms);

            if (req.query.page) {
                pageNum = req.query.page;
            }
            var expression = '^' + terms;
            let searchConditions = {
                $or: [{
                        "name": expression
                    },
                    {
                        "name": new RegExp(start, 'i')
                    },
                ]
            };

            Product.count(searchConditions, (err, count) => {
                return count
            }).then(count => {
                let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
                let imageSize = "$image." + size;
                Product.aggregate(
                        [{
                                $match: searchConditions
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "author",
                                    foreignField: "_id",
                                    as: "authorObjects"
                                }
                            },

                            {
                                $lookup: {
                                    from: "products",
                                    localField: "bundle_items",
                                    foreignField: "_id",
                                    as: "bundle_itemsObjects"
                                }
                            },

                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "translator",
                                    foreignField: "_id",
                                    as: "translatorObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "composer",
                                    foreignField: "_id",
                                    as: "composerObjects"
                                }
                            },
                            {
                                $lookup: {
                                    from: "authors",
                                    localField: "editor",
                                    foreignField: "_id",
                                    as: "editorObjects"
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
                                    from: "categories",
                                    localField: "category",
                                    foreignField: "_id",
                                    as: "categoryObject"
                                }
                            },
                            {
                                $unwind: "$publisher"
                            },
                            {
                                $project: {
                                    name: "$name",
                                    sngImage: imageSize,
                                    image: "$image",
                                    is_enabled: "$is_enabled",
                                    import_id: "$import_id",
                                    description: "$description",
                                    published_at: "$published_at",
                                    current_offer: "$current_offer",
                                    price: "$price",
                                    previous_price: "$previous_price",
                                    discounted_price: "$discounted_price",
                                    discount_rate: "$discount_rate",
                                    lang: "$lang",
                                    isbn: "$isbn",
                                    number_of_pages: "$number_of_pages",
                                    priority: "$priority",
                                    seo_url: "$seo_url",
                                    quantity: "$quantity",
                                    meta_tag_title: "$meta_tag_title",
                                    meta_tag_description: "$meta_tag_description",
                                    meta_tag_keywords: "$meta_tag_keywords",
                                    author: "$authorObjects",
                                    authors_are: '$authors_are',
                                    translator: "$translatorObjects",
                                    composer: "$composerObjects",
                                    editor: "$editorObjects",
                                    free_delivery: "$free_delivery",
                                    is_bundle: "$is_bundle",
                                    bundle_items: "$bundle_itemsObjects",
                                    preview_images: "$preview_images",
                                    back_cover_image: "$back_cover_image",
                                    attributes: "$attributes",
                                    publisher: {
                                        _id: "$publisher._id",
                                        name: "$publisher.name",
                                        description: "$publisher.description"
                                    },
                                    category: "$categoryObject"
                                }
                            },
                            {
                                $sort: {
                                    name: 1
                                }
                            }
                        ]
                    )
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, products) => {
                        if (err) {
                            res.send(err);
                        } else {
                            if (products.length < 1) {

                                let condition = {};
                                let lmt = 12 - products.length;
                                var soundex_all = soundexSen(start).split(" ").map(val => {
                                    return new RegExp(val)
                                })

                                //console.log(soundex_all)
                                // var soundex_al = [/S626/, /M235/];  // Sample for like-and
                                // let ids = soundex_al.map(prd => { return prd });

                                condition = {
                                    "soundex_code": {
                                        $all: soundex_all
                                    }
                                }

                                Product.aggregate([{
                                            $match: condition
                                        },
                                        {
                                            $lookup: {
                                                from: "authors",
                                                localField: "author",
                                                foreignField: "_id",
                                                as: "authorObjects"
                                            }
                                        },

                                        {
                                            $lookup: {
                                                from: "products",
                                                localField: "bundle_items",
                                                foreignField: "_id",
                                                as: "bundle_itemsObjects"
                                            }
                                        },

                                        {
                                            $lookup: {
                                                from: "authors",
                                                localField: "translator",
                                                foreignField: "_id",
                                                as: "translatorObjects"
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "authors",
                                                localField: "composer",
                                                foreignField: "_id",
                                                as: "composerObjects"
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "authors",
                                                localField: "editor",
                                                foreignField: "_id",
                                                as: "editorObjects"
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
                                                from: "categories",
                                                localField: "category",
                                                foreignField: "_id",
                                                as: "categoryObject"
                                            }
                                        },
                                        {
                                            $unwind: "$publisher"
                                        },
                                        {
                                            $project: {
                                                name: "$name",
                                                sngImage: imageSize,
                                                image: "$image",
                                                is_enabled: "$is_enabled",
                                                import_id: "$import_id",
                                                description: "$description",
                                                published_at: "$published_at",
                                                current_offer: "$current_offer",
                                                price: "$price",
                                                previous_price: "$previous_price",
                                                discounted_price: "$discounted_price",
                                                discount_rate: "$discount_rate",
                                                lang: "$lang",
                                                isbn: "$isbn",
                                                number_of_pages: "$number_of_pages",
                                                priority: "$priority",
                                                seo_url: "$seo_url",
                                                quantity: "$quantity",
                                                meta_tag_title: "$meta_tag_title",
                                                meta_tag_description: "$meta_tag_description",
                                                meta_tag_keywords: "$meta_tag_keywords",
                                                author: "$authorObjects",
                                                authors_are: '$authors_are',
                                                translator: "$translatorObjects",
                                                composer: "$composerObjects",
                                                editor: "$editorObjects",
                                                free_delivery: "$free_delivery",
                                                is_bundle: "$is_bundle",
                                                bundle_items: "$bundle_itemsObjects",
                                                preview_images: "$preview_images",
                                                back_cover_image: "$back_cover_image",
                                                attributes: "$attributes",
                                                publisher: {
                                                    _id: "$publisher._id",
                                                    name: "$publisher.name",
                                                    description: "$publisher.description"
                                                },
                                                category: "$categoryObject"
                                            }
                                        },
                                        // { $sort: { priority: 1, name: 1 } },
                                    ])
                                    .skip(itemsPerPage * (pageNum - 1))
                                    .limit(itemsPerPage)
                                    .exec()
                                    .then(restProduct => {
                                        start = '^' + start;
                                        let myprod = [];

                                        restProduct.forEach(element => {
                                            let p = levenshteinDistance(start, element.name);
                                            if (Math.abs(p) < 10) {
                                                myprod = myprod.concat(element)
                                            } else if (Math.abs(p) < 50) {
                                                myprod = myprod.concat(element)
                                            } else if (Math.abs(p) < 100) {
                                                myprod = myprod.concat(element)
                                            } else if (Math.abs(p) < 500) {
                                                myprod = myprod.concat(element)
                                            }
                                        });
                                        myprod = myprod.slice(0, 12);
                                        res.json({
                                            'items': myprod,
                                            'count': count
                                        });
                                    })
                                    .catch(err => {
                                        //console.log(err)
                                        let err_data = [];
                                        res.json(err_data)
                                    })
                            } else {
                                res.json({
                                    'items': products,
                                    'count': count
                                });
                            }
                        }
                    });
            }).catch(err => {
                res.send(err);
            });
        });


    router.route('/product/order-create/search-by-seo/:seo_url')
        .get((req, res) => {
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let imageSize = "$image." + size;

            let cond = {
                // "is_enabled": true,
                "seo_url": req.params.seo_url
            }

            Product.aggregate(
                    [{
                            $match: {
                                is_enabled: true,
                                seo_url: req.params.seo_url
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
                                name: { $arrayElemAt: ['$lang.content.name', 0] },
                                seo_url: "$seo_url",
                                authorObj: {
                                    name: {
                                        $arrayElemAt: ["$accessories.authors_bn.name", 0]
                                    },
                                    _id: { $arrayElemAt: ['$author._id', 0] }
                                },
                                auths: {
                                    $map: {
                                        input: "$author",
                                        as: "ath",
                                        in: "$$ath._id"
                                    }
                                },
                                publisherObj: {
                                    name: "$accessories.publisher_bn.name",
                                    _id: "$publisher._id"
                                },
                                publ: "$publisher._id",
                            }
                        }
                    ]
                )
                .exec((err, product) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({
                            'product': product
                        });
                })
        })

    router.route('/product/purchase/search/:terms')
        .get((req, res) => {
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let imageSize = "$image." + size;
            let cond = {
                "is_enabled": {
                    $eq: true
                },
                "seo_url": { $eq: req.params.terms }
            };
            Product.aggregate(
                    [{
                            $match: cond
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
                                },
                                auths: {
                                    $map: {
                                        input: "$author",
                                        as: "ath",
                                        in: "$$ath._id"
                                    }
                                },
                                publ: "$publisher._id",
                                publisherObj: {
                                    name: "$publisher.name"
                                },
                            }
                        }
                    ]
                )
                .limit(50)
                .exec()
                .then(product => {
                    console.log(product);
                    res.json({
                        'product': product
                    });
                })
                .catch(err => {
                    res.json({
                        'product': []
                    });
                })
        })



    router.route('/product/order-create/search/:terms')
        .get((req, res) => {
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let imageSize = "$image." + size;
            let expression = '.*' + req.params.terms + '.*';
            let cond = {
                "is_enabled": {
                    $eq: true
                },
                "$or": [{
                    "lang.content.name": {
                        $regex: expression,
                        $options: 'i'
                    }
                }, {
                    "name": {
                        $regex: expression,
                        $options: 'i'
                    }
                }]
            };
            if (req.query.author) {
                cond.author = mongoose.Types.ObjectId(req.query.author)
            };
            Product.aggregate(
                    [{
                            $match: cond
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
                                },
                                auths: {
                                    $map: {
                                        input: "$author",
                                        as: "ath",
                                        in: "$$ath._id"
                                    }
                                },
                                publ: "$publisher._id",
                                publisherObj: {
                                    name: "$publisher.name"
                                },
                            }
                        }
                    ]
                )
                .limit(50)
                .exec((err, product) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({
                            'product': product
                        });
                })
        })

    router.route('/product/category/:id')
        .get((req, res) => {
            Product.find()
                .where('category').equals(req.params.id)
                .exec((err, products) => {
                    if (err)
                        res.send(err);
                    else
                        res.json(products);
                })
        })


    router.route('/subscriber-review')
        .post((req, res) => {
            let result = new Object();
            let pageNum = parseInt(req.body.currentPage) || 1;
            var start_date = new Date(req.body.start_date);
            start_date.setHours(0, 0, 0, 0);

            var end_date = new Date(req.body.end_date);
            end_date.setHours(23, 59, 59, 999);
            let queryCirteria = {
                'reviews.approved': req.body.approved,
                'reviews.review_at': {
                    $lte: new Date(end_date),
                    $gte: new Date(start_date)
                }
            }
            Product.aggregate([{
                        $match: {
                            reviews: {
                                $gt: {
                                    $size: 0
                                }
                            }
                        }
                    },
                    {
                        $unwind: "$reviews"
                    },
                    {
                        $match: queryCirteria
                    }
                ])
                .exec()
                .then(count => {
                    result.count = count.length;
                    return Product.aggregate([{
                                $match: {
                                    reviews: {
                                        $gt: {
                                            $size: 0
                                        }
                                    }
                                }
                            },
                            {
                                $unwind: "$reviews"
                            },
                            {
                                $match: queryCirteria
                            },
                            {
                                $lookup: {
                                    from: "subscribers",
                                    localField: "reviews.user_id",
                                    foreignField: '_id',
                                    as: "reviews.user_id"
                                }
                            },
                            {
                                $unwind: "$reviews.user_id"
                            },
                            {
                                $project: {
                                    review_by: "$reviews.first_name",
                                    review_at: "$reviews.review_at",
                                    review_speech: "$reviews.review_speech",
                                    approved: "$reviews.approved",
                                    user_id: {
                                        _id: "$reviews.user_id._id"
                                    },
                                    review_by: "$reviews.first_name",
                                    book_name: "$name"
                                }
                            },
                            {
                                $sort: {
                                    'reviews.review_at': -1
                                }
                            }
                        ])
                        .skip(10 * (pageNum - 1))
                        .limit(10)
                })
                .then((reviews) => {
                    result.data = reviews;
                    res.json(result);
                })
                .catch(err => {
                    res.send(err)
                })
        })

    router.route('/subscriber-review/:id')
        .put((req, res) => {
            //console.log(req.body)
            let review_approved_counter = req.body.review_approved_counter;
            let user_id = req.body.user_id._id;
            // //console.log(review_approved_counter);
            if (review_approved_counter < 10) {
                Product.update({
                        _id: mongoose.Types.ObjectId(req.params.id),
                        "reviews.user_id": mongoose.Types.ObjectId(user_id)
                    }, {
                        $set: {
                            "reviews.$.approved": true,
                            "review_approved_counter": review_approved_counter + 1,
                        }
                    }, {
                        multi: false
                    })
                    .exec()
                    .then(result => {
                        if (result.nModified > 0) {
                            res.json({
                                success: true
                            });
                        } else {
                            res.json({
                                success: false
                            })
                        }
                    })
                    .catch(err => {
                        res.send(err);
                    })
            } else {
                res.json({
                    message: "Review Approval Exceeded"
                })
            }


        })
        .delete((req, res) => {
            let review_approved_counter = req.body.review_approved_counter;
            let user_id = req.headers['delete-data'];
            Product.update({
                        _id: mongoose.Types.ObjectId(req.params.id)
                    },

                    {
                        $pull: {
                            reviews: {
                                'user_id': mongoose.Types.ObjectId(user_id)
                            }
                        }
                    }, {
                        multi: false
                    }
                )
                .exec()
                .then(result => {
                    if (result.nModified > 0) {
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        })
                    }
                })
                .catch(err => {
                    res.send(err);
                })

        })


    // export function updateSubscriber(req) {

    // }

    // '

    router.route('/product/preview-page-state/:id')
        .put((req, res) => {
            Product.updateOne({
                    "_id": req.params.id,
                    "preview_images.page_num": req.body.page
                }, {
                    $set: {
                        "preview_images.$.disabled": req.body.state
                    }
                })
                .exec()
                .then(result => {
                    if (result.ok == 1) {
                        res.json({
                            success: true
                        })
                    } else {
                        res.json({
                            success: false
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        success: false
                    })
                })
        })

    router.route('/get-duplicate-seo')
        .get((req, res) => {
            Product.aggregate(
                    [{
                            $group: {
                                _id: "$seo_url",
                                count: {
                                    $sum: 1
                                },
                                itms: {
                                    $push: {
                                        id: "$_id",
                                        name: "$name",
                                        lang: "$lang"
                                    }
                                }
                            }
                        },
                        {
                            $match: {
                                count: {
                                    $gt: 1
                                }
                            }
                        }
                    ]
                )
                .exec()
                .then(items => {
                    return duplicateSeo(items)
                })
                .then(rslt => {
                    res.json({
                        status: true
                    });
                })
        })

    router.route('/product/approval/unchecked-product')
        .get((req, res) => {
            let result = new Object();
            let page_no = req.query.page_no ? parseInt(req.query.page_no) : 1;
            Product.count({
                    is_checked_after_last_update: false
                })
                .exec()
                .then(count => {
                    result.count = count;
                    return Product.find({
                            is_checked_after_last_update: false
                        })
                        .select({
                            name: 1,
                            updated_at: 1,
                            updated_by: 1,
                            seo_url: 1,
                            import_id: 1
                        })
                        .populate({
                            path: 'updated_by',
                            select: 'first_name last_name'
                        })
                        .skip((page_no - 1) * 10)
                        .limit(10)
                })
                .then(product => {
                    result.products = product;
                    res.json(result);
                })
                .catch(err => {
                    res.json({
                        count: 0
                    })
                })
        })

    router.route('/product/approval-change/:id')
        .get(auth, (req, res) => {
            let update_obj = {
                is_checked_after_last_update: true,
                is_enabled: req.query.action == 'accept',
                checked_by_after_last_update: req.user._id
            }
            Product.update({
                    _id: req.params.id
                }, {
                    $set: update_obj
                })
                .exec()
                .then(result => {
                    if (result.ok) {
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                })
                .catch(err => {
                    res.json({
                        success: true
                    });
                })
        })


    router.route('/product/approval-detail/:id')
        .get(auth, (req, res) => {
            //console.log(req.params.id);
            Product.aggregate(
                    [{
                            $match: {
                                _id: mongoose.Types.ObjectId(req.params.id)
                            }
                        },
                        {
                            $unwind: "$accessories"
                        },
                        {
                            $project: {
                                image: "$image",
                                preview_images: "$preview_images",
                                previous_price: "$previous_price",
                                back_cover_image: "$back_cover_image",
                                en_name: "$name",
                                bn_name: {
                                    $arrayElemAt: ["$lang.content.name", 0]
                                },
                                seo_url: "$seo_url",
                                previous_price: "$previous_price",
                                price: "$price",
                                discount_pc: "$discount_pc",

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
                                }
                            }
                        }
                    ])
                .exec()
                .then(product => {
                    if (product[0]._id)
                        res.json({
                            success: true,
                            data: product[0]
                        });
                    else
                        res.json({
                            success: false
                        });
                })
                .catch(err => {
                    res.json({
                        success: false,
                        err: err
                    });
                })
        })

    router.route('/seo-update/product/:id')
        .put(auth, (req, res) => {
            isSeoUnique(Product, req.body.seo_url, req.body.lang[0].content.seo_url, req.params.id)
                .then(output => {
                    if (output.duplicate) {
                        res.json(output)
                    } else {
                        Product.findOne({
                            '_id': req.params.id
                        }, (err, product) => {
                            if (err)
                                res.send(err);
                            if (product._id) {
                                product.meta_tag_title = req.body.meta_tag_title;
                                product.meta_tag_description = req.body.meta_tag_description;
                                product.meta_tag_keywords = req.body.meta_tag_keywords;
                                product.seo_url = req.body.seo_url;

                                product.lang = [{
                                    code: 'bn',
                                    content: {
                                        name: product.lang[0].content.name,
                                        description: product.lang[0].content.description,
                                        meta_tag_title: req.body.lang[0].content.meta_tag_title,
                                        meta_tag_description: req.body.lang[0].content.meta_tag_description,
                                        meta_tag_keywords: req.body.lang[0].content.meta_tag_keywords,
                                        seo_url: req.body.lang[0].content.seo_url
                                    }
                                }];
                                product.updated_by = req.user._id;
                                product.updated_at = new Date();
                            }
                            return product.save((err) => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    return res.send(product);
                                }
                            });
                        })
                    }
                })
        })

    router.route('/product/kib-report/:q_date')
        .get(auth, (req, res) => {
            let findQuery = new Object();
            findQuery.updated_by = {
                $ne: mongoose.Types.ObjectId('59f1af3add5caa7463e6442f')
            }
            if (req.params.q_date) {
                var lte_date = new Date(req.params.q_date);
                lte_date.setHours(0, 0, 0, 0);
                var gte_date = new Date(req.params.q_date);
                gte_date.setHours(23, 59, 59, 999);

                findQuery['updated_at'] = {
                    $lte: new Date(gte_date),
                    $gt: new Date(lte_date)
                }
            }

            Product.aggregate([{
                        $match: findQuery
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
                        $unwind: '$publisher'
                    },
                    {
                        $group: {
                            _id: '$updated_by',
                            products: {
                                $push: {
                                    name: '$name',
                                    import_id: '$import_id',
                                    url: {
                                        $concat: ['https://boibazar.com/book/', '$seo_url']
                                    },
                                    publisher: '$publisher.name',
                                    updated_at: '$updated_at'
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $project: {
                            uploader: {
                                $concat: ['$user.first_name', '$user.last_name']
                            },
                            products: "$products"
                        }
                    }
                ])
                .exec()
                .then(result => {
                    if (result && result.length > 0)
                        res.json({
                            success: true,
                            data: result
                        });
                    else
                        res.json({
                            success: false,
                            message: 'No Data found in this date'
                        });
                })
                .catch(err => {
                    res.json({
                        success: false,
                        message: 'Internal server error occured'
                    });
                })
        })


    // File Upload
    const path = require('path');
    const multer = require('multer');

    const upload = multer({
        storage: multer.diskStorage({
            destination: `uploads/product/`,
            filename: (req, file, cb) => {
                cb(null, `${req.params.dir}/${req.params.import_id}/image/${req.params.import_id}.${req.params.ext}`);
            }
        })
    });

    router.post('/product/original-fron-cover/:dir/:import_id/:ext', upload.any(), (req, res) => {
        res.json(req.files.map(file => {
            let ext = path.extname(file.originalname);
            return {
                originalName: file.originalname,
                filename: file.filename
            }
        }));
    });



    function duplicateSeo(items) {
        let updatedItems = items.map(item => {
            return new Promise((resolve, reject) => {
                updateDulicateSeo(item)
                    .then(updated => {
                        resolve(updated)
                    })
            })
        })
        return Promise.all(updatedItems)
    }

    function updateDulicateSeo(dup) {
        let seo = dup._id;
        let dupItems = dup.itms.map((itm, i) => {
            let bng_seo = itm.lang[0].content.seo_url;
            let postfix = i == 0 ? '' : "-00" + i;
            let newlang = [{
                "code": itm.lang[0].code,
                "_id": itm.lang[0]._id,
                "content": {
                    "seo_url": bng_seo + postfix,
                    "name": itm.lang[0].content.name,
                    "description": itm.lang[0].content.description,
                    "meta_tag_title": itm.lang[0].content.meta_tag_title,
                    "meta_tag_description": itm.lang[0].content.meta_tag_description,
                    "meta_tag_keywords": itm.lang[0].content.meta_tag_keywords
                }
            }]
            return new Promise((resolve, reject) => {
                Product.update({
                        _id: itm.id
                    }, {
                        $set: {
                            "seo_url": seo + postfix,
                            lang: newlang
                        }
                    })
                    .exec()
                    .then(up => {
                        resolve(up);
                    })
                    .catch(err => {
                        //console.log(err);
                        reject({
                            status: false
                        })
                    })
            })
        })
        return Promise.all(dupItems);
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


}