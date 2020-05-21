import ShippingAddress from '../../models/shipping-address.model';
import config from '../../../config/config.json';

export default (app, router, jwt) => {
    router.route('/shipping')
        .get((req, res) => {
            let token = req.cookies.token || req.headers['token'];

            // //console.log(req.headers['token']);
            jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Please login first'
                    });
                } else {
                    let user = decoded; //user;

                    if (!user._id) {
                        user = decoded._doc;
                    }
                    ShippingAddress.find()
                        .select()
                        .where('created_by').equals(user._id)
                        .exec((err, shipping) => {
                            if (err)
                                res.send(err);
                            else
                                res.json({
                                    success: true,
                                    address: shipping
                                })
                        })
                }
            });
        })

    .post((req, res) => {
        let token = req.cookies.token || req.headers['token'];
        jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Please login first'
                });
            } else {
                let user = decoded; //user;
                if (!user._id) {
                    user = decoded._doc;
                }
                if (req.body.is_primary) {
                    ShippingAddress.findOne()
                        .where('created_by').equals(user._id)
                        .where('is_primary').equals(true)
                        .exec((err, currentAddress) => {
                            if (currentAddress != null) {
                                currentAddress.is_primary = false;
                                return currentAddress.save((err) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        saveAddress(req, user)
                                            .then((err, shipping) => {
                                                if (err)
                                                    res.send(err);
                                                else
                                                    res.json(shipping);
                                            })
                                    }
                                });
                            } else {
                                saveAddress(req, user)
                                    .then((err, shipping) => {
                                        if (err)
                                            res.send(err);
                                        else
                                            res.json(shipping);
                                    })
                            }

                        })
                } else {
                    saveAddress(req, user)
                        .then((err, shipping) => {
                            if (err)
                                res.send(err);
                            else
                                res.json(shipping);
                        })
                }
            }
        })
    })

    .put((req, res) => {
        let token = req.cookies.token || req.headers['token'];
        jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Please login first'
                });
            } else {
                let user = decoded; //user;
                if (!user._id) {
                    user = decoded._doc;
                }
                if (req.body.is_primary) {
                    ShippingAddress.findOne()
                        .where('created_by').equals(user._id)
                        .where('is_primary').equals(true)
                        .exec((err, currentPrimaryAddress) => {
                            currentPrimaryAddress.is_primary = false;
                            return currentPrimaryAddress.save((err) => {
                                if (err) {
                                    res.send(err)
                                } else {
                                    ShippingAddress.findOne()
                                        .where('_id').equals(req.body._id)
                                        .exec((err, address) => {
                                            address.is_primary = req.body.is_primary;
                                            return address.save(err => {
                                                if (err)
                                                    res.send(err);

                                                res.json(address);
                                            })
                                        })
                                }
                            })
                        })
                }
            }
        })
    })

    router.route('/shipping/:id')
        .put((req, res) => {
            ShippingAddress.findOne({
                    _id: req.params.id
                })
                .exec()
                .then(address => {
                    if (address._id) {
                        address.contact_name = req.body.contact_name;
                        address.country = req.body.country;
                        address.district = req.body.district;
                        address.thana = req.body.thana;
                        address.area = req.body.area;
                        address.address = req.body.address;
                        address.phone_number = req.body.phone_number;
                        address.alter_phone = req.body.alter_phone;
                        address.save(err => {
                            if (!err) {
                                res.json({
                                    success: true,
                                    msg: "Address updated successfully",
                                    data: address
                                })
                            } else {
                                res.json({
                                    success: false,
                                    msg: "Address update failed"
                                })
                            }
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        success: false,
                        msg: "Address update failed"
                    })
                })
        })

    function saveAddress(req, user) {
        return ShippingAddress.create({
            is_primary: req.body.is_primary,
            contact_name: req.body.contact_name,
            district: req.body.district,
            thana: req.body.thana,
            area: req.body.area,
            address: req.body.address,
            phone_number: req.body.phone_number,
            alter_phone: req.body.alter_phone,
            created_by: user._id,
            carrier: req.body.carrier_id,
            sender_name: req.body.sender_name,
            sender_mobile: req.body.sender_mobile

        })
    }


    router.route('/create-shipping-address')
        .post((req, res) => {
            let token = req.cookies.token || req.headers['token'];
            jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Please login first'
                    });
                } else {
                    let user = decoded; //user;
                    if (!user._id) {
                        user = decoded._doc;
                    }
                    saveAddress(req, user)
                        .then(address => {
                            res.json({
                                success: true,
                                msg: "Saved Success",
                                data: address
                            })
                        })
                        .catch(err => {
                            res.json({
                                success: false,
                                msg: err
                            })
                        })
                }
            })
        })
}