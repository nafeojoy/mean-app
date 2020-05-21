import Publisher from '../../models/publisher.model';
import Product from '../../models/product.model';

import {
    isSeoUnique
} from './admin-api.service';
import {
    soundexSen
} from './product.service';
import mongoose from 'mongoose';
import {
    getNextSequence
} from './sequence.service';

export default (app, router, auth, slug) => {

    router.route('/publisher')

    .post(auth, slug(Publisher), (req, res) => {
        let author_id;
        if (req.body.is_author) {
            author_id = req.body.author
        } else {
            author_id = undefined;
        }

        Publisher.create({
            name: req.body.name,
            description: req.body.description,
            import_id: req.body.image && req.body.image['120X175'] ? parseInt(req.body.image['120X175'].split('/')[4]) : undefined,
            is_featured: req.body.is_featured,
            featured_order: req.body.featured_order,
            phone: req.body.phone,
            email: req.body.email,
            is_author: req.body.is_author,
            author: author_id,
            address: req.body.address,
            is_enabled: req.body.is_enabled,
            page_url: req.body.page_url,
            website: req.body.website,
            order: req.body.order,
            logo: req.body.logo,
            meta_tag_title: req.body.meta_tag_title,
            meta_tag_description: req.body.meta_tag_description,
            meta_tag_keywords: req.body.meta_tag_keywords,
            seo_url: req.slug.seo_url,
            lang: req.body.lang,
            soundex_code: soundexSen(req.body.name),
            created_by: req.user._id,
            updated_by: req.user._id
        }, (err, publisher) => {
            if (err) {
                res.send(err);
            } else {
                if (!publisher.image) {
                    getNextSequence('publisher_import_id').then(seq => {
                        publisher.import_id = seq;
                        publisher.save(err => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json(publisher);
                            }
                        })
                    })
                } else {
                    res.json(publisher);
                }
            }
        });

    })

    .get((req, res, next) => {
        var pageNum = 1,
            itemsPerPage = 10;
        var paginationHeader = req.headers['bz-pagination'];

        if (paginationHeader) {
            var params = paginationHeader.split(',');
            pageNum = parseInt(params[0]);
            itemsPerPage = parseInt(params[1]);
        }

        var featurePaginationHeader = req.headers['bz-feature-pagination'];
        if (featurePaginationHeader) {
            pageNum = featurePaginationHeader == undefined ? 1 : parseInt(featurePaginationHeader);
        }

        Publisher.count((err, count) => {
            return count
        }).then(count => {
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let logoSize = "$logo." + size;
            Publisher.aggregate(
                    [{
                            $project: {
                                name: "$name",
                                import_id: "$import_id",
                                lang: "$lang",
                                is_featured: "$is_featured",
                                featured_order: "$featured_order",
                                page_url: "$page_url",
                                logo: logoSize,
                                description: "$description",
                                phone: "$phone",
                                email: "$email",
                                address: "$address",
                                is_enabled: "$is_enabled",
                                website: "$website",
                                book_list: "$book_list",
                                seo_url: "$seo_url",
                                meta_tag_title: "$meta_tag_title",
                                meta_tag_description: "$meta_tag_description",
                                meta_tag_keywords: "$meta_tag_keywords"
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
                .exec((err, publisher) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json({
                            'items': publisher,
                            'count': count
                        });
                    }
                });
        }).catch(err => {
            res.send(err);
        });
    });

    router.route('/publisher/check-page-url/:text')
        .get((req, res) => {
            let id = req.query.id;
            if (id) {
                Publisher.find()
                    .where('page_url').equals(req.params.text)
                    .where('_id').ne(id)
                    .exec((err, publisher) => {
                        if (err)
                            res.send(err);
                        else {
                            if (publisher && publisher.length > 0) {
                                res.json({
                                    exist: true
                                });
                            } else {
                                res.json({
                                    exist: false
                                });
                            }
                        }
                    })
            } else {
                Publisher.findOne({
                        'page_url': req.params.text
                    })
                    .exec((err, publisher) => {
                        if (err)
                            res.send(err);
                        else {
                            if (publisher) {
                                res.json({
                                    exist: true
                                });
                            } else {
                                res.json({
                                    exist: false
                                });
                            }
                        }

                    })
            }

        })



    router.route('/publisher/book-info/:id')
        .get((req, res) => {
            Product.aggregate([{
                        $match: {
                            publisher: mongoose.Types.ObjectId(req.params.id)
                        }
                    },
                    {
                        $lookup: {
                            from: "authors",
                            localField: 'author',
                            foreignField: "_id",
                            as: "authors"
                        }
                    },
                    {
                        $lookup: {
                            from: "publishers",
                            localField: 'publisher',
                            foreignField: "_id",
                            as: "publisher"
                        }
                    },
                    {
                        $unwind: "$publisher"
                    },
                    {
                        $project: {
                            _id: 0,
                            Import_id: "$import_id",
                            Name_En: "$name",
                            Name_Bn: {
                                $arrayElemAt: ["$lang.content.name", 0]
                            },
                            Author: {
                                $arrayElemAt: ["$authors.name", 0]
                            },
                            Publisher: "$publisher.name",
                            Publisher_id: "publisher.import_id",
                            Currnet_Price: "$price",
                            Discount: "$discount_pc",
                            Exist_Look_Inside: {
                                "$size": "$preview_images"
                            },
                            Book_Price: "$previous_price",
                            ISBN: "$isbn",
                            Last_update_at: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$updated_at"
                                }
                            },
                            Address: {
                                $concat: ['https://www.boibazar.com/book/', '$seo_url']
                            },
                            Out_Of_Stock: "$is_out_of_stock",
                            Out_Of_Print: "$is_out_of_print"
                        }
                    }
                ])
                .exec()
                .then(books => {
                    if (books && books.length > 0) {
                        res.json({
                            success: true,
                            count: books.length,
                            books: books
                        })
                    } else {
                        res.json({
                            success: false,
                            message: "No book found for this publisher."
                        });
                    }
                })
                .catch(err => {
                    res.json({
                        success: false,
                        message: "Error occured, try after sometime."
                    });
                })
        })

    router.route('/publisher/:id')
        .get((req, res) => {
            Publisher.findOne({
                    '_id': req.params.id
                })
                .exec((err, publisher) => {
                    if (err)
                        res.send(err);
                    else
                        res.json(publisher);
                })
        })

    .put(auth, (req, res) => {
            Publisher.findOne({
                '_id': req.params.id
            }, (err, publisher) => {
                if (err)
                    res.send(err);
                if (req.body._id) {
                    req.body.lang[0].content.seo_url = publisher.lang[0].content.seo_url;
                    publisher.name = req.body.name;
                    publisher.description = req.body.description;
                    publisher.is_featured = req.body.is_featured;
                    publisher.featured_order = req.body.featured_order;
                    publisher.phone = req.body.phone;
                    publisher.email = req.body.email;
                    publisher.address = req.body.address;
                    publisher.is_enabled = req.body.is_enabled;
                    publisher.page_url = req.body.page_url;
                    publisher.website = req.body.website;
                    publisher.is_author = req.body.is_author;
                    if (req.body.is_author) {
                        publisher.author = req.body.author;
                    }
                    publisher.order = req.body.order;
                    publisher.logo = req.body.logo;
                    publisher.meta_tag_title = req.body.meta_tag_title == undefined ? publisher.meta_tag_title : req.body.meta_tag_title;
                    publisher.meta_tag_description = req.body.meta_tag_description == undefined ? publisher.meta_tag_description : req.body.meta_tag_description;
                    publisher.meta_tag_keywords = req.body.meta_tag_keywords == undefined ? publisher.meta_tag_keywords : req.body.meta_tag_keywords;
                    publisher.lang = req.body.lang;
                    publisher.soundex_code = soundexSen(req.body.name),
                        publisher.updated_at = new Date();
                    publisher.updated_by = req.user._id;
                }

                publisher.save((err) => {
                    if (err)
                        res.send(err);
                    else
                        res.send(publisher);
                });
            })
        })
        .delete((req, res) => {
            Publisher.remove({
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
        });


    router.route('/seo-update/publisher/:id')
        .put(auth, (req, res) => {
            isSeoUnique(Publisher, req.body.seo_url, req.body.lang[0].content.seo_url, req.params.id)
                .then(output => {
                    if (output.duplicate) {
                        res.json(output)
                    } else {
                        Publisher.findOne({
                            '_id': req.params.id
                        }, (err, publisher) => {
                            if (err)
                                res.send(err);
                            if (publisher._id) {
                                publisher.meta_tag_title = req.body.meta_tag_title;
                                publisher.meta_tag_description = req.body.meta_tag_description;
                                publisher.meta_tag_keywords = req.body.meta_tag_keywords;
                                publisher.seo_url = req.body.seo_url;

                                publisher.lang = [{
                                    code: 'bn',
                                    content: {
                                        name: publisher.lang[0].content.name,
                                        description: publisher.lang[0].content.description,
                                        meta_tag_title: req.body.lang[0].content.meta_tag_title,
                                        meta_tag_description: req.body.lang[0].content.meta_tag_description,
                                        meta_tag_keywords: req.body.lang[0].content.meta_tag_keywords,
                                        seo_url: req.body.lang[0].content.seo_url
                                    }
                                }];
                                publisher.updated_by = req.user._id;
                                publisher.updated_at = new Date();
                            }
                            return publisher.save((err) => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    return res.send(publisher);
                                }
                            });
                        })
                    }
                })
        })

    router.route('/publisher/search-name/:terms')
        .get((req, res) => {
            var terms = req.params.terms;
            let expression = '.*' + terms + '.*';
            let searchConditions = {
                "name": {
                    $regex: expression,
                    $options: 'i'
                }
            };
            Publisher.find(searchConditions)
                .limit(50)
                .exec((err, publisher) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({
                            'product': publisher
                        });
                })
        })

    router.route('/publisher/order-create/publisher-search/:terms')
        .get((req, res) => {
            let expression = '.*' + req.params.terms + '.*';
            Publisher.aggregate(
                    [{
                            $match: {
                                $or: [{
                                        "lang.content.name": {
                                            $regex: expression,
                                            $options: 'i'
                                        }
                                    },
                                    {
                                        "name": {
                                            $regex: expression,
                                            $options: 'i'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                name: "$name",
                                seo_url: "$seo_url"
                            }
                        }
                    ]
                )
                .limit(50)
                .exec((err, publishers) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({
                            'publisher': publishers
                        });
                })
        })

    router.route('/publisher/search/v1')
        .get((req, res) => {
            var pageNum = 1,
                itemsPerPage = 50;

            var terms = req.query.search;
            if (req.query.page) {
                pageNum = req.query.page;
            }
            if (req.query.limit) {
                itemsPerPage = 50; //req.query.limit;
            }

            let expression = '.*' + terms + '.*';
            let searchConditions = {
                "name": {
                    $regex: expression,
                    $options: 'i'
                },
                "is_enabled": true
            };

            Publisher.find(searchConditions)
                .count((err, count) => {
                    return count
                })
                .then(count => {
                    Publisher.find(searchConditions)
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                        .exec((err, publishers) => {
                            if (err)
                                res.send(err);
                            else
                                res.json({
                                    'items': publishers,
                                    'count': count
                                });
                        })
                })
                .catch(err => {
                    res.send(err);
                })
        });

    router.route('/featured_publisher')
        .get((req, res) => {
            let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
            let logoSize = "$logo." + size;
            Publisher.aggregate(
                    [{
                            $match: {
                                'is_featured': true
                            }
                        },
                        {
                            $sort: {
                                featured_order: 1
                            }
                        },
                        {
                            $project: {
                                name: "$name",
                                logo: logoSize,
                                description: "$description"
                            }
                        }
                    ]
                )
                .exec((err, publishers) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json(publishers);
                    }
                });
        })

    .post(auth, (req, res) => {
        var featured_publishers = req.body;
        updatePublishers(featured_publishers).then(result => {
            res.json({
                success: true
            })
        }).catch(err => {
            res.json({
                message: err.message
            })
        })

    })

    router.route('/featured_publisher/:id')
        .put((req, res) => {
            Publisher.findOne({
                    "_id": req.params.id
                })
                .exec((err, publisher) => {
                    publisher.is_featured = false;
                    publisher.featured_order = 0;
                    return publisher.save((err) => {
                        if (err)
                            res.send(err)

                        res.json({
                            status: true
                        });
                    })
                })
        })

    function updatePublishers(publishers) {
        var publisherPromises = publishers.map((publisherObj, i) => {
            return new Promise((resolve, reject) => {
                Publisher.findOne({
                        '_id': publisherObj._id
                    })
                    .exec((err, publisher) => {
                        publisher.is_featured = true;
                        publisher.featured_order = (i + 1);
                        publisher.save((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(true);
                            }
                        })
                    })
            })
        })
        return Promise.all(publisherPromises);
    }

}