import Subscriber from "../../models/subscriber.model.js";
import config from "../../../config/config.json";
import {
    sendMessage
} from "./text-message.service";
var rp = require("request-promise");

var jwt = require("jsonwebtoken");
import mongoose from "mongoose";

export default (app, router, passport, auth) => {
    //********************* route for checking user loggedIn or not by token *********************

    router.get("/auth/loggedIn", (req, res) => {
        let token = req.cookies.token || req.headers["token"];
        ////console.log(token);
        jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: "Please login first"
                });
            } else {
                // let user = decoded.$__.scope;
                let user = decoded; //user;

                if (!user._id) {
                    user = decoded._doc;
                }
                res.json({
                    success: true,
                    username: user.username
                });
            }
        });
    });

    router.get("/auth/refresh-token/:token", (req, res) => {
        let token = req.params.token;
        var originalDecoded = jwt.decode(token, {
            complete: true
        });
        var new_token = jwt.sign(
            originalDecoded.payload._doc,
            config.SESSION_SECRET, {
                expiresIn: 60 * 60 * 720
            }
        );
        res.json({
            success: true,
            token: new_token
        });
    });

    //********************* route for login an user *******************************//

    // status codes

    // 418: No User
    // 419: Invalid Password
    // 4201: Email Not Varified
    // 4202: Phone Not Varified
    // 421: Account Closed



    router.post("/auth/login", (req, res, next) => {

        passport.authenticate("local-subscriber-login", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({
                    message: info.loginMessage,
                    status_code: info.status_code,
                    subscriber_first_name: info.subscriber_first_name,
                    subscriber_email: info.subscriber_email,
                    subscriber_id: info.subscriber_id,
                    subscriber_username: info.subscriber_username,
                    subscriber_phone_number: info.subscriber_phone_number
                });
            }
            req.login(user, err => {
                if (err) {
                    return next(err);
                }
                res.status(200);
                let super_secret = config.SESSION_SECRET;

                let user_data = {
                        _id: user._id,
                        image: user.image,
                        password: user.password,
                        provider: user.provider,
                        email: user.email,
                        username: user.username,
                        first_name: user.first_name,
                        referral_code: user.referral_code,
                        phone_number: user.phone_number,
                        address: user.address,
                        verification_code: user.verification_code
                    }
                    // console.log(user)
                var token = jwt.sign(user_data, super_secret, {
                    expiresIn: 60 * 60 * 720
                });

                res.json({
                    _id: user._id,
                    token: token,
                    username: user.username,
                    first_name: user.first_name
                });
            });
        })(req, res, next);
    });

    //********************* route for signup/register new user *********************//

    router.post("/auth/signup", (req, res, next) => {



        passport.authenticate("local-subscriber-signup", (err, user, info) => {
            if (err) return next(err);

            if (!user) {
                return res.json({
                    message: info.signupMessage
                });
            }
            if (user.created_by_admin || user.qrCode) {
                res.json({
                    _id: user._id,
                    user: user,
                    message: "Account created successfully"
                });
            } else {
                if (user.provider == "local_mail") {
                    mailTo(user)
                        .then(result => {
                            //console.log("Mail Sent");
                            res.json({
                                _id: user._id,
                                user: user,
                                message: "A Mail sent. Please confirm first"
                            });
                        })
                        .catch(err => {
                            //console.log(err);
                        });

                } else {
                    if (req.device.type == "desktop") {
                        let data = {
                            phone_numbers: [user.phone_number],
                            text: `Dear ${user.first_name} 
             Welcome to boibazar. Your signup verification code is  ${
                user.verification_code
                } 
              Thank You for being with us.`,
                            sms_sent_for: "create_for_subscriber_registration",
                            generation_id: user._id
                        };

                        // //console.log(data);
                        sendMessage(data);
                    }

                    let super_secret = config.SESSION_SECRET;

                    let user_data = {
                            _id: user._id,
                            image: user.image,
                            password: user.password,
                            provider: user.provider,
                            email: user.email,
                            username: user.username,
                            first_name: user.first_name,
                            referral_code: user.referral_code,
                            phone_number: user.phone_number,
                            address: user.address,
                            verification_code: user.verification_code
                        }
                        // console.log(user)
                    var token = jwt.sign(user_data, super_secret, {
                        expiresIn: 60 * 60 * 720
                    });

                    res.json({
                        _id: user._id,
                        token: token,
                        user: user,
                        message: "A Code has been sent to your Phone"
                    });
                }
            }
        })(req, res, next);
    });

    const secret = "6LfwcD0UAAAAADQbCXyyovSTDZ5gWUsEcaAxQYm8";

    router.get("/auth/signup/validate_captcha", (req, res) => {
        const options = {
            method: "POST",
            uri: "https://www.google.com/recaptcha/api/siteverify",
            qs: {
                secret,
                response: req.query.token
            },
            json: true
        };
        rp(options)
            .then(response => res.json(response))
            .catch(err => {
                res.json(err);
            });
    });

    router.post("/auth/signup/send-mail", (req, res) => {
        mailTo(req.body)
            .then(result => {
                //console.log("Mail Sent");
                res.json({
                    res: result
                });
            })
            .catch(err => {
                //console.log(err);
            });
        res.json({});
    });


    router.post("/auth/signup/send-verify-text", (req, res) => {
        var userId = req.body.user_id;


        Subscriber.findOne({
                _id: mongoose.Types.ObjectId(userId)
            })
            .exec()
            .then(user => {
                let data = {
                    phone_numbers: [user.phone_number],
                    text: `Dear ${user.first_name} 
         Welcome to boibazar. Your signup verification code is  ${
            user.verification_code
            } 
          Thank You for being with us.`,
                    sms_sent_for: "create_for_subscriber_registration",
                    generation_id: user._id
                };

                // //console.log(data);
                sendMessage(data);
                res.json({

                    message: "A Code has been sent to your Phone"
                });
            })


    })

    router.put("/auth/signup/new-password", (req, res) => {

        let newPass = req.body.new_pass;
        let userName = req.body.user.username;

        let subscriber = new Subscriber();
        if (userName && newPass) {
            Subscriber.update({
                    username: userName
                }, {
                    $set: {
                        password: subscriber.generateHash(newPass)
                    }
                })
                .exec()
                .then(result => {
                    if (result.nModified) {
                        res.json({
                            success: true,
                            message: "You new password has been set successfully!"
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "New password has not been changed!"
                        });
                    }
                })
        }

    });

    router.post("/auth/signup/verify-phone", (req, res) => {

        console.log(req.body)

        Subscriber.findOne({
                username: req.body.user.username
            })
            .exec()
            .then(result => {
                if (result && result._id) {
                    if (result.verification_code == req.body.user.verification_code) {
                        Subscriber.update({
                                _id: result._id
                            }, {
                                $set: {
                                    is_verified: true
                                }
                            })
                            .exec()
                            .then(verified => {
                                console.log(verified)
                                if (verified.ok > 0) {

                                    let user_data = {
                                        _id: result._id,
                                        image: result.image,
                                        password: result.password,
                                        provider: result.provider,
                                        email: result.email,
                                        username: result.username,
                                        first_name: result.first_name,
                                        referral_code: result.referral_code,
                                        phone_number: result.phone_number,
                                        address: result.address,
                                        verification_code: result.verification_code
                                    }

                                    let super_secret = config.SESSION_SECRET;

                                    var tokenV = jwt.sign(user_data, super_secret, {
                                        expiresIn: 60 * 60 * 720
                                    });


                                    console.log("--------------")
                                    console.log(result.username)
                                    console.log(result.first_name)
                                    console.log(tokenV)
                                    console.log("--------------")


                                    res.json({
                                        success: true,
                                        token: tokenV,
                                        _id: result._id,
                                        username: req.body.user.username,
                                        first_name: req.body.user.first_name,
                                        message: "Phone number has been verified successfully"
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Verification failed, Please try again later!!"
                                    });
                                }
                            })
                            .catch(err => {
                                //console.log(err);
                                res.json({
                                    success: false,
                                    message: "Verification failed, Please try again later!"
                                });
                            });
                    } else {
                        res.json({
                            success: false,
                            message: "Invalid verification code!"
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: "Phone number is not registered yet!"
                    });
                }
            });
    });

    router.get("/auth/signup/unverified-subscriber/:username", (req, res) => {
        Subscriber.findOne({
                username: req.params.username
            })
            .exec()
            .then(result => {
                if (result && result._id) {
                    res.json({
                        success: true,
                        user: result
                    });
                } else {
                    if (isNaN(req.params.username)) {
                        res.json({
                            success: false,
                            message: "Mail is not registered yet."
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "Phone number is not registered yet."
                        });
                    }
                }
            });
    });

    router.post("/auth/signup/verify-code", (req, res) => {
        Subscriber.findOne({
                $or: [{
                    _id: req.body.user._id
                }, {
                    username: req.body.user.username
                }]
            })
            .exec()
            .then(result => {
                if (result && result._id) {
                    if (result.verification_code == req.body.verification_code) {
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "Code is invalid"
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: "User not found"
                    });
                }
            })
            .catch(err => {
                res.json({
                    success: false,
                    message: "User not found"
                });
            });
    });

    // router.get('send-message', (req, res, next) => {
    //     res.json(sendMessage());
    // })

    // function sendMessage() {
    // let signup_info={
    //     user:{first_name:"Shamim", verification_code:4511, phone_number:"01824589241"}
    // }
    // let message_text = "Dear " + signup_info.user.first_name + " Welcome to boibazar. Your signup verification code is " + signup_info.user.verification_code + " Thank You for being with us.";
    // let data = "user=omicon2&pass=123456&sid=LECTURE_Omicon&sms[0][0]=88" + signup_info.user.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=1234567891"
    // request('http://www.google.com', function (err, res, body) {
    //         if (!error && response.statusCode == 200) {
    //             //console.log(res);
    //             return true;
    //         }
    //     })
    // }

    function mailTo(user) {

        return new Promise((resolve, reject) => {
            const nodemailer = require("nodemailer");
            var mail_user = user;
            let user_name = user.first_name;
            let super_secret = config.SESSION_SECRET;
            var token = jwt.sign({
                id: user._id,
                mail: user.email
            }, super_secret, {
                expiresIn: 60 * 60 * 720
            });
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: "boibazar.com@gmail.com",
                    pass: "rZxQnR8j4B0iBazar"
                }
            });

            let mailOptions = {
                from: '"Boibazar user varification" <boibazar.com@gmail.com>',
                to: user.email,
                subject: "User registration confirmation",
                text: "",
                html: '<div style="color: black; background: white;border-radius: 5px; margin-right: 25%; margin-left: 25%; border: 2px solid rgba(19, 97, 177, 0.95);"><div style="text-align: center; width: 96%;margin-bottom: 5%;background: rgb(19, 97, 177);padding: 2%;"><img src="https://www.boibazar.com/image/offer/84jqsgpnc412cugtlnmi.png" alt="BoiBazar"></div><div style="margin: 3%;"><h2 style="color:#262626">Dear ' +
                    user_name +
                    ',</h2><p style="font-size: 17px;">Thank you for registering with us at BoiBazar.com. To activate your user account, please click on this Confirmation link</p><br><a style="margin-left:38%; border: 1px solid rgb(19, 97, 177); color:white; padding: 6px;border-radius: 16px;background: rgb(19, 97, 177);text-decoration:none;"href="https://www.boibazar.com/info/subscriber-verify/' +
                    token +
                    '">Click to verify</a><p style="font-size: 17px;">Alternatively:</p><a href="https://www.boibazar.com/info/subscriber-verify/' +
                    token +
                    '">https://www.boibazar.com/info/subscriber-verify/' +
                    token +
                    '</a><p style="font-size: 17px;">If you do not verify your email within 3 days, it will expire.</p><h2 style="color:#262626">Why you received this email?</h2><p style="font-size: 17px;">BoiBazar.com requires verification whenever an email address is selected as a BoiBazar.com ID. Your BoiBazar.com ID cannot be used until you verify it.</p><br></div><div style="margin-left: 3%;"><p style="text-align:left;margin-bottom: -9px;">BoiBazar.com Team</p><p style="text-align:left;">Hot Line: 09611 262020</p></div><div style="text-align: center;width: 98%; background: rgb(19, 97, 177);padding: 1%; margin-top: 4%;"><a href="http://www.boibazar.com"><p style="color: #ffffff;">BoiBazar.com</p></a><p style="color: #ffffff;">Largest Book Store In Bangladesh</p></div></div>'
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        status: true,
                        message: "Mail sent, Please check your mail!"
                    });
                }
            });
        });
    }

    //*********** route for logOut **************//

    router.post("/auth/logout", (req, res) => {
        //  //console.log("I am logout");
        req.logOut();
        res.clearCookie("token");
        res.json({
            success: true
        });
    });

    //*********** route for facebook authentication and login using ng2**************//

    router.post("/auth/facebook-login", (req, res, next) => {
        Subscriber.findOne({
                $or: [{
                    facebookId: req.body.id
                }, {
                    email: req.body.email
                }]
            },
            (err, user) => {
                if (err) {
                    res.send(err);
                }

                if (user) {
                    let super_secret = config.SESSION_SECRET;
                    var token = jwt.sign(user, super_secret, {
                        expiresIn: 60 * 60 * 720
                    });
                    res.json({
                        _id: user._id,
                        token: token,
                        username: user.username
                    });
                } else {
                    Subscriber.create({
                            first_name: req.body.name ? req.body.name : req.body.email,
                            phone_number: "",
                            last_name: req.body.last_name,
                            username: req.body.id,
                            email: req.body.email,
                            is_verified: true,
                            provider: "Facebook",
                            facebookId: req.body.id,
                            referral_code: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
                            password: "$2a$08$R7ztYVRCk0kqXVUsDNj.Iu6Te2ghCJUMcpAC1XEskh8sSYW3vOBi."
                        },
                        (err, user) => {
                            if (err) {
                                //res.send(err);
                                res.json({
                                    message: err
                                });
                            } else {
                                let super_secret = config.SESSION_SECRET;
                                var token = jwt.sign(user, super_secret, {
                                    expiresIn: 60 * 60 * 720
                                });
                                res.json({
                                    _id: user._id,
                                    token: token,
                                    username: user.username
                                });
                            }
                        }
                    );
                }
            }
        );
    });

    //*************** route for google authentication and login using ng2*****************//

    router.post("/auth/google-login", (req, res, next) => {
        Subscriber.findOne({
                $or: [{
                    googleId: req.body.id
                }, {
                    email: req.body.email
                }]
            },
            (err, user) => {
                if (err) {
                    res.send(err);
                }

                if (user) {
                    let super_secret = config.SESSION_SECRET;
                    var token = jwt.sign(user, super_secret, {
                        expiresIn: 60 * 60 * 720
                    });
                    res.json({
                        token: token,
                        username: user.username
                    });
                } else {
                    Subscriber.create({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            username: req.body.name,
                            email: req.body.email,
                            is_verified: true,
                            provider: "Google",
                            googleId: req.body.id,
                            password: "$2a$08$R7ztYVRCk0kqXVUsDNj.Iu6Te2ghCJUMcpAC1XEskh8sSYW3vOBi."
                        },
                        (err, user) => {
                            if (err) {
                                // res.send(err);
                                res.json({
                                    message: err
                                });
                            } else {
                                let super_secret = config.SESSION_SECRET;
                                var token = jwt.sign(user, super_secret, {
                                    expiresIn: 60 * 60 * 720
                                });
                                res.json({
                                    token: token,
                                    username: user.username
                                });
                            }
                        }
                    );
                }
            }
        );
    });

    //*********************route for facebook authentication and login using passportJs*********************//

    router.get(
        "/auth/facebook",
        passport.authenticate("facebook", {
            scope: ["email", "public_profile", "user_friends"]
        })
    );

    router.get("/auth/facebook/callback", (req, res, next) => {
        passport.authenticate("facebook", (err, user) => {
            ////console.log("*********** facebook.router****************");
            ////console.log(user)
            let super_secret = config.SESSION_SECRET;
            var token = jwt.sign(user, supeusrr_secret, {
                expiresIn: 60 * 60 * 720
            });

            res.cookie("token", token);
            res.redirect("/#/home");
        })(req, res, next);
    });

    //*********** route for google authentication and login using passportJs************//

    router.get(
        "/auth/google",
        passport.authenticate("google", {
            scope: [
                "https://www.googleapis.com/auth/plus.login",
                "https://www.googleapis.com/auth/plus.profile.emails.read"
            ]
        })
    );

    router.get("/auth/google/callback", (req, res, next) => {
        passport.authenticate("google", (err, user) => {
            let super_secret = config.SESSION_SECRET;
            var token = jwt.sign(user, super_secret, {
                expiresIn: 60 * 60 * 720
            });

            res.cookie("token", token);
            res.redirect("/#/home");
        })(req, res, next);
    });

    router.get("/auth/check-dns/:dns_val", (req, res) => {
        var dns = require("dns");
        dns.lookup(req.params.dns_val, function onLookup(err, addresses, family) {
            if (addresses) {
                res.json({
                    valid: true
                });
            } else {
                res.json({
                    valid: false
                });
            }
        });
    });
};