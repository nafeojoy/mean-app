import PromotionalCode from '../../models/promotional-code.model';
import {
    getNextSequence,
    imageIndex
} from './sequence.service';

import cors from 'cors';
import multer from 'multer';

export default (app, router, auth) => {
    router.route('/promotional-code')
        .get((req, res, next) => {

            var pageNum = 1,
                itemsPerPage = 10,
                search = '';
            var paginationHeader = req.headers['bz-pagination'];

            //Date Search
            // if (req.body.from_date && req.body.to_date) {
            //     var lte_date = req.body.from_date ? new Date(req.body.from_date) : new Date();
            //     lte_date.setHours(0, 0, 0, 0);
            //     var gte_date = req.body.to_date ? new Date(req.body.to_date) : new Date();
            //     gte_date.setHours(23, 59, 59, 999);

            //     params = { $gte: new Date(lte_date), $lt: new Date(gte_date) }
            // }

            if (paginationHeader) {
                var params = paginationHeader.split(',');
                //console.log(params);
                pageNum = parseInt(params[0]);
                itemsPerPage = parseInt(params[1]);
                if (params[2] == 'undefined') {
                    search = '';
                } else {
                    search = params[2];
                }
            }
            PromotionalCode.count((err, count) => {
                    return count
                })
                .where('promo_code').equals(new RegExp(search, 'i'))
                .then(count => {
                    PromotionalCode.find()
                        .where('promo_code').equals(new RegExp(search, 'i'))
                        .skip(itemsPerPage * (pageNum - 1))
                        .limit(itemsPerPage)
                        .exec((err, promotionalCodes) => {
                            if (err)
                                res.send(err);
                            else
                                res.json({
                                    'items': promotionalCodes,
                                    'count': count
                                })
                        })
                })
                .catch(err => {
                    res.send(err);
                })


        })

    .post(auth, (req, res) => {

        PromotionalCode.findOne({
                promo_code: req.body.promo_code
            })
            .exec()
            .then(promo => {
                if (promo && promo._id) {
                    res.send({
                        success: false,
                        message: "Already Exists"
                    })
                } else {
                    PromotionalCode.create({
                        is_active: req.body.is_active,
                        promo_code: req.body.promo_code,
                        discount: req.body.discount,
                        target_no: req.body.target_no,
                        applied_no: req.body.applied_no,
                        user_applied_no: req.body.user_applied_no,
                        start_date: req.body.start_date,
                        end_date: req.body.end_date,
                        created_at: new Date(),
                        created_by: req.user._id,
                        updated_by: req.user._id,
                        updated_at: new Date()
                    }, (err, promotionalCode) => {
                        if (err) {
                            res.send(err);
                        }
                        res.json(promotionalCode);
                    });
                }
            })


    });


    router.route('/promotional-code/search/v1')
        .get((req, res) => {
            var pageNum = 1,
                itemsPerPage = 30;

            var terms = req.query.search;
            if (req.query.page) {
                pageNum = req.query.page;
            }

            var expression = '^' + terms;
            //console.log(expression);
            let searchConditions = {
                "promo_code": new RegExp(expression, 'i')
            };
            // //console.log(searchConditions);
            PromotionalCode.count(searchConditions, (err, count) => {
                return count
            }).then(count => {
                let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
                let imageSize = "$image." + size;
                PromotionalCode.aggregate(
                        [{
                                $match: searchConditions
                            },

                            {
                                $project: {
                                    promo_code: "$promo_code",
                                    discount: "$discount",
                                    serial: "$serial",
                                    target_no: "$target_no",
                                    applied_no: "$applied_no",
                                    user_applied_no: "$user_applied_no",
                                    code_name: "$code_name",
                                    start_date: "$start_date",
                                    end_date: "$end_date",
                                    created_at: "$created_at",
                                    created_by: "$created_by",
                                    updated_by: "$updated_by",
                                    updated_at: "$updated_at"
                                }
                            },
                            {
                                $sort: {
                                    created_at: 1
                                }
                            }
                        ]
                    )
                    .skip(itemsPerPage * (pageNum - 1))
                    .limit(itemsPerPage)
                    .exec((err, promotionalCodes) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json({
                                'items': promotionalCodes,
                                'count': count
                            });
                        }
                    });
            }).catch(err => {
                res.send(err);
            });
        });



    router.route('/promotional-code/search/:terms')

    .get((req, res) => {

        //console.log(req.params.terms)
        let expression = '.*' + req.params.terms + '.*';
        let date = new Date();
        date.setHours(0, 0, 0, 0);

        //console.log(date);

        //console.log(expression);
        PromotionalCode.aggregate([{
                    $match: {
                        'promo_code': {
                            $regex: expression,
                            $options: 'i'
                        }
                    }
                },
                {
                    $project: {
                        _id: "$_id",
                        promo_code: "$promo_code",
                        discount: "$discount",
                        end_date: "$end_date"
                    }
                }
            ])
            .limit(20)
            .exec()
            .then(promotionalcode => {
                res.json({
                    data: promotionalcode
                })
            })
    });

    router.route('/promotional-code/:id')

    .get((req, res) => {
        PromotionalCode.findOne({
                '_id': req.params.id
            })
            .exec((err, promotionalCode) => {
                if (err)
                    res.send(err);
                else
                    res.json(promotionalCode);
            })
    })

    .put(auth, (req, res) => {
        PromotionalCode.findOne({
            '_id': req.params.id
        }, (err, promotionalCode) => {
            //console.log(req.body);

            if (err)
                res.send(err);
            if (req.body._id) {
                promotionalCode.is_active = req.body.is_active;
                promotionalCode.discount = req.body.discount;
                promotionalCode.target_no = req.body.target_no;
                promotionalCode.end_date = req.body.end_date;
                // promotionalCode.updated_by = req.body.updated_by;
                promotionalCode.updated_at = new Date()
            }
            return promotionalCode.save((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        success: true,
                        message: "Promo Code Update Successful!",
                        data: promotionalCode
                    });
                }
            });
        })
    })



}