import Subscriber from '../../models/subscriber.model';
import ShippingAddress from '../../models/shipping-address.model';
import config from '../../../config/config.json';
import {
    uploader
} from '../admin/upload.service';
import bcrypt from 'bcrypt-nodejs';

import {
    sendMessage
} from "./text-message.service";

export default (app, router, jwt) => {
    router.route('/subscriber')
        .get((req, res) => {
            let token = req.cookies.token || req.headers['token'];
            jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Please login first'
                    });
                } else {
                    let subscriber = decoded; //user;

                    if (!subscriber._id) {
                        subscriber = decoded._doc;
                    }

                    Subscriber.findOne()
                        .where('_id').equals(subscriber._id)
                        .exec()
                        .then(subs => {
                            subscriber = subs;
                            return ShippingAddress.find()
                                .where('created_by').equals(subscriber._id)
                                .exec()
                        }).then(address => {
                            let resData = {
                                addresses: address,
                                image: subscriber.image.path,
                                email: subscriber.email,
                                provider: subscriber.provider,
                                first_name: subscriber.first_name,
                                phone_number: subscriber.phone_number,
                                referral_code: subscriber.referral_code,
                                facebookId: subscriber.facebookId,
                                username: subscriber.username,
                                _id: subscriber._id
                            }
                            res.json(resData);
                        })
                        .catch(err => {
                            res.json({})
                        })
                }
            });
        })

    .put((req, res) => {

        //console.log(req.body)
        Subscriber.findOne()
            .where('_id').equals(req.body._id)
            .exec()
            .then(subscriber => {
                //console.log(subscriber)
                if (subscriber) {
                    subscriber.first_name = req.body.first_name;
                    var errorCode = [];


                    email()
                        .then(phone)
                        .then(save);

                    function email() {
                        return new Promise((resolve, reject) => {
                            if (req.body.email) {
                                Subscriber.findOne({
                                        email: req.body.email
                                    }).exec()
                                    .then(subemail => {
                                        console.log(subemail)
                                        if (!subemail) {
                                            subscriber.email = req.body.email;
                                        } else if (subemail._id != req.body._id) {
                                            errorCode.push(441);
                                        }
                                        const error = false;

                                        if (!error) {
                                            resolve()
                                        } else {
                                            reject('Error: Something Went Wrong')
                                        }
                                    })
                                    .catch(err => {
                                        reject('Error: Something Went Wrong')
                                    })
                            } else {
                                resolve();
                            }
                        });
                    }


                    function phone() {

                        return new Promise((resolve, reject) => {
                            if (req.body.phone_number) {
                                Subscriber.findOne({
                                        phone_number: req.body.phone_number
                                    }).exec()
                                    .then(subs => {
                                        if (!subs) {
                                            subscriber.phone_number = req.body.phone_number;
                                        } else if (subs._id != req.body._id) {
                                            errorCode.push(442);
                                        }
                                        const error = false;

                                        if (!error) {
                                            resolve()
                                        } else {
                                            reject('Error: Something Went Wrong')
                                        }
                                    })
                                    .catch(err => {
                                        reject('Error: Something Went Wrong')
                                    })
                            } else {
                                resolve();
                            }
                        })
                    }

                    function save() {
                        if (req.body.new_password) {
                            let valid = bcrypt.compareSync(req.body.old_password, subscriber.password);
                            if (valid) {
                                subscriber.password = bcrypt.hashSync(req.body.new_password);
                                return subscriber.save((err) => {
                                    //console.log("Final Save")
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        let super_secret = config.SESSION_SECRET;
                                        var token = jwt.sign(subscriber, super_secret, {
                                            expiresIn: 60 * 60 * 720
                                        });
                                        return res.json({
                                            'token': token,
                                            'subscriber': subscriber
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    'status': 420,
                                    'message': "Your old password is incorrect",
                                    'errorCodes': errorCode
                                })
                            }
                        } else {
                            return subscriber.save((err) => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    //console.log("SAVE")
                                    let super_secret = config.SESSION_SECRET;
                                    var token = jwt.sign(subscriber, super_secret, {
                                        expiresIn: 60 * 60 * 720
                                    });
                                    return res.json({
                                        'token': token,
                                        'subscriber': subscriber,
                                        'errorCodes': errorCode
                                    });
                                }
                            });

                        }
                    }


                }
            })
    })

    router.route('/subscriber/profile-picture')
        .put((req, res) => {

            //console.log("YESYS")
            let token = req.body.token;

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
                    Subscriber.findOne()
                        .where('_id').equals(user._id)
                        .exec()
                        .then(subscriber => {
                            if (subscriber) {
                                subscriber.image.path = req.body.image;
                                return subscriber.save((err) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        return res.json({
                                            'status': 200,
                                            'message': "Your Profile Picture isw successfully uploaded"
                                        })
                                    }
                                })
                            }
                        })
                }
            });
        });


    router.route('/subscriber/close-account')
        .put((req, res) => {
            Subscriber.findOne()
                .where('_id').equals(req.body._id)
                .exec()
                .then(subscriber => {
                    if (subscriber) {
                        if (req.body.password) {
                            let valid = bcrypt.compareSync(req.body.password, subscriber.password);
                            if (valid) {
                                subscriber.is_close = true;
                                return subscriber.save((err) => {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        return res.json({
                                            'status': 200,
                                            'message': "Your Account has been closed"
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    'status': 420,
                                    'message': "Your password is incorrect"
                                })
                            }
                        } else {
                            res.json({
                                'status': 420,
                                'message': "Your password is incorrect"
                            });

                        }
                    }
                })

        })

    router.route('/subscriber/update-verification-code/:id')
        .get((req, res) => {
            let vCode = Math.floor(Math.random() * 89999 + 100000)
            Subscriber.findByIdAndUpdate({
                    _id: req.params.id
                }, {
                    $set: {
                        verification_code: vCode
                    }
                })
                .exec()
                .then(subscriber => {
                    subscriber.verification_code = vCode;
                    res.json(subscriber)
                })
        })

    router.route('/subscriber/verify/:token')
        .get((req, res) => {
            let token = req.params.token || req.headers['token'];
            jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
                if (err) {
                    ////console.log(err);
                    res.json({
                        success: false,
                        message: "Invalid Token"
                    });
                } else {
                    let subscriber = decoded;

                    // console.log('subscriber verify');
                    // console.log(subscriber);

                    if (!subscriber.id) {
                        subscriber = decoded._doc;
                    }
                    Subscriber.findOne()
                        .where('_id').equals(subscriber.id)
                        .where('email').equals(subscriber.mail)
                        .exec()
                        .then(subscriber => {
                            subscriber.is_verified = true;
                            subscriber.save(err => {
                                if (!err) {
                                    res.json(subscriber);
                                    // res.redirect('https://www.boibazar.com');
                                } else {
                                    res.json(err);
                                }
                            })
                        })

                }
            });
        })

    router.route('/subscriber/password-forget-reset')
        .put((req, res) => {
            let token = req.body.token || req.headers['token'];
            if (token) {
                jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
                    if (err) {
                        //console.log(err);
                        res.json({
                            success: false,
                            message: "Invalid Token"
                        });
                    } else {
                        let subscriber = decoded;
                        if (!subscriber.id) {
                            subscriber = decoded._doc;
                        }
                        Subscriber.findOne()
                            .where('_id').equals(subscriber.id)
                            .where('email').equals(subscriber.mail)
                            .exec()
                            .then(subscriber => {
                                subscriber.is_verified = true;
                                subscriber.password = subscriber.generateHash(req.body.password)
                                subscriber.save(err => {
                                    if (!err) {
                                        res.json({
                                            success: true
                                        });
                                    } else {
                                        res.json({
                                            success: false
                                        })
                                    }
                                })
                            })
                    }
                });
            } else {
                let subscriber = req.body.signup_info.user;
                Subscriber.findOne()
                    .where('_id').equals(subscriber._id)
                    .where('username').equals(subscriber.phone_number)
                    .exec()
                    .then(subscriber => {
                        subscriber.is_verified = true;
                        subscriber.password = subscriber.generateHash(req.body.password)
                        subscriber.save(err => {
                            if (!err) {
                                res.json({
                                    success: true
                                });
                            } else {
                                res.json({
                                    success: false
                                })
                            }
                        })
                    })
            }
        })




    router.route('/subscriber/password-forget/:val')
        .get((req, res) => {
            Subscriber.findOne({
                    email: req.params.val
                })
                .exec()
                .then(user => {
                    if (user && user._id) {

                        mailTo(user)
                            .then(maild => {
                                res.json({
                                    success: true,
                                    type: 'email',
                                    message: "Email Sent"
                                })

                            })
                            .catch(err => {
                                res.json({
                                    success: false,
                                    type: 'email',
                                    message: "Failed"
                                })
                            })
                    } else {
                        Subscriber.findOne({
                                username: req.params.val
                            })
                            .exec()
                            .then(user => {

                                if (user && user._id && user.verification_code) {
                                    let data = {
                                        phone_numbers: [user.phone_number],
                                        text: `Dear ${user.first_name} 
                 Welcome to boibazar. Your verification code for forgotten password is  ${
                      user.verification_code
                      } 
                  Thank You for being with us.`,
                                        sms_sent_for: "forgotten_password",
                                        generation_id: user._id
                                    };

                                    sendMessage(data);
                                    res.json({
                                        success: true,
                                        type: 'phone',
                                        message: "SMS Sent"
                                    })
                                } else {
                                    res.json({
                                        success: false,
                                        message: "This user was created by your email. Please give your corresponding email for varification"
                                    })
                                }
                            })


                    }
                })
                .catch(err => {
                    res.json({
                        success: false,
                        message: "Something went wrong. Try again latter!"
                    })
                })
        })

    .put((req, res) => {
        let token = req.body.token || req.headers['token'];
        if (token) {
            jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
                if (err) {
                    //console.log(err);
                    res.json({
                        success: false,
                        message: "Invalid Token"
                    });
                } else {
                    let subscriber = decoded; //user;

                    if (!subscriber._id) {
                        subscriber = decoded._doc;
                    }
                    // //console.log("Ami decoded");
                    // //console.log(subscriber);

                    Subscriber.findOne()
                        .where('_id').equals(subscriber._id)
                        .where('email').equals(subscriber.email)
                        .exec()
                        .then(subscriber => {
                            subscriber.is_verified = true;
                            subscriber.password = subscriber.generateHash(req.body.password)
                            subscriber.save(err => {
                                if (!err) {
                                    res.json({
                                        success: true
                                    });
                                } else {
                                    res.json({
                                        success: false
                                    })
                                }
                            })
                        })
                }
            });
        } else {
            let subscriber = req.body.signup_info.user;
            Subscriber.findOne()
                .where('_id').equals(subscriber._id)
                .where('username').equals(subscriber.phone_number)
                .exec()
                .then(subscriber => {
                    subscriber.is_verified = true;
                    subscriber.password = subscriber.generateHash(req.body.password)
                    subscriber.save(err => {
                        if (!err) {
                            res.json({
                                success: true
                            });
                        } else {
                            res.json({
                                success: false
                            })
                        }
                    })
                })
        }
    })

    function mailTo(user) {
        return new Promise((resolve, reject) => {
            const nodemailer = require('nodemailer');
            var mail_user = user;

            let super_secret = config.SESSION_SECRET;
            var token = jwt.sign({
                id: user._id,
                mail: user.email
            }, super_secret, {
                expiresIn: 60 * 60 * 720
            });
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'boibazar.com@gmail.com',
                    pass: 'rZxQnR8j4B0iBazar'
                }
            });

            let mailOptions = {
                from: '"Boibazar Notification" <boibazar.com@gmail.com>',
                to: user.email,
                subject: 'Password Reset',
                text: '',
                html: '<div style="color: black; background: white;border-radius: 5px; margin-right: 25%; margin-left: 25%; border: 2px solid rgba(19, 97, 177, 0.95);"><div style="text-align: center; width: 96%;margin-bottom: 5%;background: rgba(255, 255, 255);padding: 2%;"><img src="https://www.boibazar.com/asset/images/logo_bn.png" alt="BoiBazar"></div><div style="margin: 3%;"><h2 style="color:#262626">Forgot your password?</h2><p style="font-size: 17px;">Click the button within the next hour to set a new password for your BoiBazar.com Account.</p><br><a style="margin-left:38%; border: 1px solid rgb(19, 97, 177); color:white; padding: 6px;border-radius: 16px;background: rgb(19, 97, 177);text-decoration:none;"href="https://www.boibazar.com/subscriber/password-reset/' + token + '">Reset Password</a><p style="font-size: 17px;">Alternatively:</p><a href="https://www.boibazar.com/subscriber/password-reset/' + token + '">https://www.boibazar.com/subscriber/password-reset/' + token + '</a><br><p style="font-size: 17px;">THIS IS AN AUTOMATED EMAIL; IF YOU RECEIVED ANY ERROR, NO ACTION IS REQUIRED. PLEASE DO NOT REPLY TO THIS MAIL.</p></div><div style="margin-left: 3%;"><p style="text-align:left; margin-bottom: -9px;">Regards,</p><p style="text-align:left;margin-bottom: -9px;">BoiBazar.com Team</p><p style="text-align:left;">Cell: 09611 262020</p></div><div style="text-align: center;width: 98%; background: rgb(19, 97, 177);padding: 1%; margin-top: 4%;"><p style="color: #ffffff;">Boibazar largest book store in Bangladesh</p></div></div>'
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error)
                } else {
                    resolve({
                        status: true,
                        message: "Mail sent, Please check your mail!"
                    })
                }

            });
        })
    }


    router.route('/subscriber-upload')
        .post((req, res) => {
            uploader(req, 'subscriber', imageSizes()).then(result => {
                res.json(result);
            })
        })

    function imageSizes() {
        return {
            '42': {
                width: '42',
                height: '60',
                quality: 80,
                directory: '42X60'
            },
            '120': {
                width: '120',
                height: '175',
                quality: 80,
                directory: '250X360'
            },
            '150': {
                width: '150',
                height: '150',
                quality: 80,
                directory: '150X150'
            },
            '250': {
                width: '250',
                height: '360',
                type: false,
                quality: 80,
                directory: '250X360'
            },
            '300': {
                width: '300',
                height: '300',
                quality: 80,
                directory: '300X300'
            },
        }
    }
}