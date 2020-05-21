import OrderCarrier from '../../models/order-carrier.model';


export default (app, router, auth, logger) => {
    router.route('/order-carrier')
        .get((req, res) => {
            var pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
            let result = new Object();
            OrderCarrier.count()
                .exec()
                .then(count => {
                    result.count = count;
                    return OrderCarrier.find()
                        .sort({
                            order_no: -1
                        })
                        .skip((pageNum - 1) * 10)
                        .limit(10)
                })
                .then(order => {
                    result.data = order;
                    res.json(result)
                })
                .catch(err => {
                    //console.log(err);
                    res.json({
                        count: 0,
                        data: []
                    })
                })
        })

    .post(auth, (req, res) => {
        OrderCarrier.create({
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            is_enabled: req.body.is_enabled,
            created_by: req.user._id,
            updated_by: req.user._id
        }, (err, orderCarrier) => {
            if (err) {
                //console.log(err);
                res.json({
                    success: false
                });
            }
            res.json({
                success: true,
                data: orderCarrier
            });
        });
    });


    router.route('/order-carrier-list')
        .get((req, res) => {
            let result = new Object();

            OrderCarrier.find({ is_enabled: true })
                .sort({
                    order_no: -1
                })
                .then(order => {
                    result.data = order;
                    res.json(result)
                })
                .catch(err => {
                    //console.log(err);
                    res.json({
                        count: 0,
                        data: []
                    })
                })
        })

    router.route('/order-carrier/:id')
        .get((req, res) => {
            OrderCarrier.findOne({
                    "_id": req.params.id
                })
                .exec((err, orderCarrier) => {
                    if (err) res.json(err);
                    res.json(orderCarrier);
                    //console.log(err)

                })
        })

    .put(auth, (req, res) => {
        OrderCarrier.findOne({
                "_id": req.params.id
            })
            .exec((err, orderCarrier) => {
                if (err) {
                    //console.log(err)
                } else {
                    orderCarrier.name = req.body.name;
                    orderCarrier.address = req.body.address;
                    orderCarrier.phone = req.body.phone;
                    orderCarrier.email = req.body.email;
                    orderCarrier.is_enabled = req.body.is_enabled;
                    orderCarrier.updated_by = req.user._id;
                    return orderCarrier.save(err => {
                        if (err)
                            res.json({
                                success: false
                            });

                        return res.json({
                            success: true,
                            data: orderCarrier
                        });
                    })
                }

            })
    })


    router.route('/order-carrier/search/:terms')
        .get((req, res) => {
            let expression = '.*' + req.params.terms + '.*';
            OrderCarrier.aggregate(
                    [{
                            $match: {
                                "is_enabled": {
                                    $eq: true
                                },
                                $or: [{
                                        name: req.params.terms
                                    },
                                    {
                                        phone: req.params.terms
                                    },
                                    {
                                        orderCarrier_id: req.params.terms
                                    },
                                    {
                                        name: {
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
                                authorObj: {
                                    name: "$phone"
                                }
                            }
                        }
                    ]
                )
                .limit(50)
                .exec((err, orderCarrier) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({
                            'orderCarrier': orderCarrier
                        });
                })
        })

}