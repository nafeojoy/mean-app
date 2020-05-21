import Wallet from "../../models/wallet.model";
import WalletVoucher from "../../models/wallet-voucher.model";
import PromotionalCode from "../../models/promotional-code.model";
import Subscriber from "../../models/subscriber.model";
import Paymentrequest from '../../models/payment-request.model';
import Paymentresponse from '../../models/payment-response.model';
import Cart from "../../models/cart.model";

import TempVoucher from '../../models/temp-voucher.model';

import {
    sendMessage
} from './text-message.service';

import {
    getDateString
} from './api.service'


import md5 from 'md5';
import querystring from 'querystring';
import request from 'request';
import {
    config
} from "shelljs";
import mongoose from "mongoose";
import cartModel from "../../models/cart.model";

export default (app, router, logger, auth) => {

    var production = true;


    const ENV = process.env.NODE_ENV;
    let productionEnv;
    let reqUrl;
    let voucherType = false;

    if (ENV == 'production' || ENV == 'PRODUCTION' || ENV == 'Production') {
        productionEnv = true;
    } else {
        productionEnv = false;
    }

    if (productionEnv) {
        reqUrl = 'https://securepay.sslcommerz.com/gwprocess/v3/api.php';
    } else {
        reqUrl = 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php';
    }

    router.route("/reset-voucher/:sub_id")
        .get((req, res) => {
            if (req.params.sub_id) {
                var subId = req.params.sub_id;
                var subTotal = parseInt(req.headers["sub_total"])
                
                WalletVoucher.findOne({
                    created_by: mongoose.Types.ObjectId(subId)
                })
                .exec()
                .then(wallet_info => {

                    if(wallet_info != null){
                        
                        TempVoucher.findOne({  
                            created_by : mongoose.Types.ObjectId(subId)   
                        }).then(is_present => {

                            if(is_present == null){
                                TempVoucher.create({
                                    wallet_id : wallet_info.wallet_id,
                                    wallet_amount : wallet_info.wallet_amount,
                                    voucher_amount : wallet_info.voucher_amount,
                                    last_voucher_amount : wallet_info.voucher_amount,
                                    transaction_no : wallet_info.transaction_no,
                                    transaction_lock : wallet_info.transaction_lock,
                                    created_at : wallet_info.created_at,
                                    comment : wallet_info.comment,
                                    created_by : wallet_info.created_by,
                                    created_by_admin : wallet_info.created_by_admin,
            
                                }).then(tempvoucher => {})
                                .error(err =>{ res.send(err) })
                            }

                            TempVoucher.findOne({
                                created_by : mongoose.Types.ObjectId(subId)
                            }).then(temp_voucher_info =>{
                                temp_voucher_info.voucher_amount = temp_voucher_info.last_voucher_amount;
                                var discount_amount = Math.min(temp_voucher_info.voucher_amount , Math.round(subTotal * 0.2));
                                var after_discount_amount = temp_voucher_info.voucher_amount - discount_amount;

                                setTimeout(() => {
                                    TempVoucher.update({
                                        _id : mongoose.Types.ObjectId(temp_voucher_info._id),
                                    }, {
                                        $set: {
                                            last_voucher_amount : temp_voucher_info.voucher_amount,
                                            voucher_amount: after_discount_amount,
                                        }
                                    }).exec()
                                }, 500)
                                
                                /*console.log("Total Taka " + subTotal);
                                console.log("discount TAKA " + discount_amount);
                                console.log("now in My vouture "  + temp_voucher_info.voucher_amount);                            
                                console.log("What will be my new amount " + after_discount_amount);
                                console.log(temp_voucher_info);
                                */
                            })
                            
                            res.json({
                                success : true
                            })
                            /*TempVoucher.findOne({
                                created_by : mongoose.Types.ObjectId(subId)
                            }).then(temp_voucher_info =>{
                                temp_voucher_info.voucher_amount = temp_voucher_info.last_voucher_amount;
                                var discount_amount = Math.min(temp_voucher_info.voucher_amount , Math.round(subTotal * 0.2));
                                var after_discount_amount = temp_voucher_info.voucher_amount - discount_amount;

                                setTimeout(() => {
                                    TempVoucher.update({
                                        _id : mongoose.Types.ObjectId(temp_voucher_info._id),
                                    }, {
                                        $set: {
                                            last_voucher_amount : temp_voucher_info.voucher_amount,
                                            voucher_amount: after_discount_amount,
                                        }
                                    }).exec()
                                }, 0)
                                
                            // console.log("Total Taka " + subTotal);
                                //console.log("discount TAKA " + discount_amount);
                                //console.log("now in My vouture "  + temp_voucher_info.voucher_amount);                            
                                //console.log("What will be my new amount " + after_discount_amount);
                                //console.log(temp_voucher_info);
                                
                            })*/
                        });
                    }
                })
               /* WalletVoucher.findOne({
                    created_by: mongoose.Types.ObjectId(subId)
                })
                    .exec()
                    .then(wal => {
                        var resetAmount = wal.voucher_amount + Math.round(subTotal * .2);

            
                        WalletVoucher.update({
                            created_by: mongoose.Types.ObjectId(subId),
                        }, {
                            $set: {
                                voucher_amount: resetAmount,
                                last_voucher_amount: resetAmount
                            }
                        })
                            .exec()
                            .then(res => {
                                res.json({
                                    success: true
                                });
                            })
                            .catch(err => {
                                res.json({
                                    success: false
                                })
                            })
                    })
                    .catch(err => {
                        res.json({
                            success: false
                        })
                    })
                */

            }
        })

    router.route("/my-current-voucher/:sub_id")
        .get((req, res) => {
            if (req.params.sub_id) {
                var subId = req.params.sub_id;

                WalletVoucher.findOne({
                    created_by: mongoose.Types.ObjectId(subId)
                })
                .exec()
                .then(voucher => {
                    res.json(voucher);
                })
                .catch(err => {
                    res.send(err)
                })
            }
        })

    router.route("/my-voucher/:sub_id")
        .get((req, res) => {
            var subTotal = parseInt(req.headers["sub_total"])
            if (req.params.sub_id) {
                var subId = req.params.sub_id;

                WalletVoucher.findOne({
                    created_by: mongoose.Types.ObjectId(subId)
                })
                .exec()
                .then(wallet_info => {

                    if(wallet_info != null){

                        TempVoucher.findOne({  
                            created_by : mongoose.Types.ObjectId(subId)   
                        }).then(is_present => {

                            if(is_present == null){
                                TempVoucher.create({
                                    wallet_id : wallet_info.wallet_id,
                                    wallet_amount : wallet_info.wallet_amount,
                                    voucher_amount : wallet_info.voucher_amount,
                                    last_voucher_amount : wallet_info.voucher_amount,
                                    transaction_no : wallet_info.transaction_no,
                                    transaction_lock : wallet_info.transaction_lock,
                                    created_at : wallet_info.created_at,
                                    comment : wallet_info.comment,
                                    created_by : wallet_info.created_by,
                                    created_by_admin : wallet_info.created_by_admin,
            
                                }).then(tempvoucher => {})
                                .error(err =>{ res.send(err) })
                            }
                            TempVoucher.findOne({
                                created_by : mongoose.Types.ObjectId(subId)
                            }).then(temp_voucher_info =>{
                                temp_voucher_info.voucher_amount = temp_voucher_info.last_voucher_amount;
                                var discount_amount = Math.min(temp_voucher_info.voucher_amount , Math.round(subTotal * 0.2));
                                var after_discount_amount = temp_voucher_info.voucher_amount - discount_amount;

                                setTimeout(() => {
                                    TempVoucher.update({
                                        _id : mongoose.Types.ObjectId(temp_voucher_info._id),
                                    }, {
                                        $set: {
                                            last_voucher_amount : temp_voucher_info.voucher_amount,
                                            voucher_amount: after_discount_amount,
                                        }
                                    }).exec()
                                }, 500)
                                
                                /*console.log("Total Taka " + subTotal);
                                console.log("discount TAKA " + discount_amount);
                                console.log("now in My vouture "  + temp_voucher_info.voucher_amount);                            
                                console.log("What will be my new amount " + after_discount_amount);
                                console.log(temp_voucher_info);
                                */
                                res.json({
                                    data : temp_voucher_info,
                                    total_voucher_amount: temp_voucher_info.voucher_amount
                                })
                            })
                        });
                    }
                    
                })
                
                



                /*WalletVoucher.findOne({
                    created_by: mongoose.Types.ObjectId(subId),
                    // transaction_lock: false
                })
                    .exec()
                    .then(voucher => {
                        if (voucher && voucher.voucher_amount > 0) {
                            let voucherAmount = voucher.voucher_amount; //before update
                            let currentVoucherAmt = voucher.last_voucher_amount || voucher.wallet_amount;

                            if (parseInt(req.headers["change_book_check"]) != 0) {
                                let oldSubTotal = parseInt(req.headers["old_sub_total"]);
                                var increasedSubTotal = Math.round(oldSubTotal * .20);
                            } else {
                                var increasedSubTotal = 0;
                            }


                            currentVoucherAmt = voucherAmount + increasedSubTotal;

                            var subTotal = parseInt(req.headers["sub_total"]) || 0;
                            let voucherAmtToApply = Math.round(subTotal * .20);


                            if (currentVoucherAmt >= voucherAmtToApply) {
                                var voucherDeduct = voucherAmtToApply;
                                var newVoucherAmount = currentVoucherAmt - voucherDeduct;

                            } else {
                                var voucherDeduct = voucherAmount;
                                var newVoucherAmount = 0;
                            }

                            setTimeout(() => {
                                WalletVoucher.update({
                                    created_by: mongoose.Types.ObjectId(subId),
                                    //  transaction_lock: false
                                }, {
                                    $set: {
                                        //   transaction_lock: true,
                                        voucher_amount: newVoucherAmount,
                                        last_voucher_amount: currentVoucherAmt
                                    }
                                })
                                    .exec()
                            }, 500);

                            res.json({
                                data: voucher,
                                total_voucher_amount: currentVoucherAmt
                            });
                        } else {
                            res.json(false)
                        }
                    })*/
                    
                

            }
        })

    router.route('/my-wallet/:sub_id')
        .get((req, res) => {
            var totalAmount = 0;

            if (req.params.sub_id) {
                var subId = req.params.sub_id;

                Wallet.find({
                    created_by: mongoose.Types.ObjectId(subId)
                })
                    .exec()
                    .then(wallet => {
                        //  console.log(wallet)
                        if (wallet) {
                            wallet.forEach(element => {
                                totalAmount += element.wallet_amount;
                            });
                            res.json({
                                data: wallet,
                                total: totalAmount
                            });
                        } else {
                            res.json("Failed")
                        }
                    })
                
                    /// For Solve the voucher discount start 

                    WalletVoucher.findOne({
                        created_by: mongoose.Types.ObjectId(subId)
                    })
                    .exec()
                    .then(wallet_info => {
    
                        if(wallet_info != null){
    
                            TempVoucher.findOne({  
                                created_by : mongoose.Types.ObjectId(subId)   
                            }).then(is_present => {
    
                                if(is_present == null){
                                    TempVoucher.create({
                                        wallet_id : wallet_info.wallet_id,
                                        wallet_amount : wallet_info.wallet_amount,
                                        voucher_amount : wallet_info.voucher_amount,
                                        last_voucher_amount : wallet_info.voucher_amount,
                                        transaction_no : wallet_info.transaction_no,
                                        transaction_lock : wallet_info.transaction_lock,
                                        created_at : wallet_info.created_at,
                                        comment : wallet_info.comment,
                                        created_by : wallet_info.created_by,
                                        created_by_admin : wallet_info.created_by_admin,
                
                                    }).then(tempvoucher => {})
                                    .error(err =>{ res.send(err) })
                                }
                                TempVoucher.findOne({
                                    created_by : mongoose.Types.ObjectId(subId)
                                }).then(temp_voucher_info =>{
                                    temp_voucher_info.voucher_amount = temp_voucher_info.last_voucher_amount;
                                    var discount_amount = Math.min(temp_voucher_info.voucher_amount , Math.round(subTotal * 0.2));
                                    var after_discount_amount = temp_voucher_info.voucher_amount - discount_amount;
    
                                    setTimeout(() => {
                                        TempVoucher.update({
                                            _id : mongoose.Types.ObjectId(temp_voucher_info._id),
                                        }, {
                                            $set: {
                                                last_voucher_amount : temp_voucher_info.voucher_amount,
                                                voucher_amount: after_discount_amount,
                                            }
                                        }).exec()
                                    }, 500)
                                    
                                    /*console.log("Total Taka " + subTotal);
                                    console.log("discount TAKA " + discount_amount);
                                    console.log("now in My vouture "  + temp_voucher_info.voucher_amount);                            
                                    console.log("What will be my new amount " + after_discount_amount);
                                    console.log(temp_voucher_info);
                                    */
                                   /* res.json({
                                        data : temp_voucher_info,
                                        total_voucher_amount: temp_voucher_info.voucher_amount
                                    })*/
                                })
                            });
                        }
                        
                    })

                    /// For Solve the voucher discount end
                    
                /* #region  Subscriber for wallet(not needed) */
                // Subscriber.findOne({
                //   _id: mongoose.Types.ObjectId(subId)
                // })
                //   .select({
                //     cr_balance_status: 1
                //   })
                //   .exec()
                //   .then(subInfo => {
                //       console.log(subInfo)
                //     if (subInfo && subInfo.cr_balance_status) {
                //       subInfo.cr_balance_status.forEach(element => {
                //         totalAmount += element.wallet_amount;
                //       });
                //       res.json({
                //         data: subInfo,
                //         total: totalAmount});
                //     } else {
                //       res.json("Failed")
                //     }
                //   });
                /* #endregion */
            }

        })

    router.post('/wallet-payment/bkash', (req, res) => {
        let requestParams;
        if (req.body.payment_info.tran_id) {
            requestParams = {
                transaction_no: req.body.payment_info.tran_id,
                payable_amount: req.body.amount,
                req_url: 'bKash-wallet',
                req_payload: 'bKash-wallet'
            }
        }
        createPaymentrequestLog(requestParams)

        if (req.body.transaction_status == 'VALID') {

            // console.log(req.body)

            /* #region  Wallet Amount greater than 500 */
            // if (req.body.amount >= 500) {
            // if (false) {
            //     Wallet.create({
            //             transaction_no: req.body.payment_info.tran_id,
            //             created_at: getDateString(new Date()),
            //             wallet_amount: req.body.amount,
            //             cr_amount: req.body.amount,
            //             collection_type: "cr",
            //             payment_type: "bkash",
            //             created_by: req.body.sub_id,
            //             is_validated: true
            //         })
            //         .then(wallet => {
            //             Subscriber.findOne({
            //                     _id: req.body.sub_id
            //                 })
            //                 .exec()
            //                 .then(subUp => {
            //                     if (subUp) {
            //                         let cos = {
            //                             wallet_trans_id: wallet._id,
            //                             wallet_amount: req.body.amount,
            //                             cr_amount: req.body.amount,
            //                             is_available: true,
            //                             is_used: false
            //                         };
            //                         subUp.cr_balance_status.push(cos);
            //                         subUp.save()
            //                             .then(forReSave => {
            //                                 let discountedValue = 0;

            //                                 if (req.body.amount < 1000) {
            //                                     discountedValue = parseInt((req.body.amount * 5) / 100) + 1;
            //                                 } else {
            //                                     discountedValue = parseInt((req.body.amount * 10) / 100) + 1;
            //                                 }

            //                                 Wallet.create({
            //                                         transaction_no: req.body.payment_info.tran_id,
            //                                         created_at: getDateString(new Date()),
            //                                         wallet_amount: discountedValue,
            //                                         cr_amount: discountedValue,
            //                                         collection_type: "cr",
            //                                         payment_type: "Bonus",
            //                                         created_by: req.body.sub_id,
            //                                         is_validated: true
            //                                     })
            //                                     .then(wallet2 => {
            //                                         Subscriber.findOne({
            //                                                 _id: req.body.sub_id
            //                                             })
            //                                             .exec()
            //                                             .then(subUp2 => {
            //                                                 if (subUp2) {
            //                                                     let cos = {
            //                                                         wallet_trans_id: wallet2._id,
            //                                                         wallet_amount: discountedValue,
            //                                                         cr_amount: discountedValue,
            //                                                         is_available: true,
            //                                                         is_used: false
            //                                                     };
            //                                                     subUp2.cr_balance_status.push(cos);
            //                                                     subUp2.save();
            //                                                 }
            //                                                 res.json({
            //                                                     success: true,
            //                                                     data: subUp2
            //                                                 })
            //                                             });
            //                                     })
            //                                     .catch(err => {
            //                                         res.json({
            //                                             success: false,
            //                                             data: 'Catch'
            //                                         })
            //                                     })
            //                             })
            //                     }
            //                     res.json({
            //                         success: true,
            //                         data: subUp
            //                     })
            //                 });
            //         })
            //         .catch(err => {
            //             res.json({
            //                 success: false,
            //                 data: 'Catch'
            //             })
            //         })
            // } else {
            /* #endregion */

            Wallet.create({
                transaction_no: req.body.payment_info.tran_id,
                created_at: getDateString(new Date()),
                wallet_amount: req.body.amount,
                cr_amount: req.body.amount,
                collection_type: "cr",
                payment_type: "bkash",
                payment_information: req.body.payment_info,
                created_by: req.body.sub_id,
                is_validated: true
            })
                .then(wallet => {
                    Subscriber.findOne({
                        _id: req.body.sub_id
                    })
                        .exec()
                        .then(subUp => {
                            if (subUp) {
                                let cos = {
                                    wallet_trans_id: wallet._id,
                                    wallet_amount: req.body.amount,
                                    cr_amount: req.body.amount,
                                    is_available: true,
                                    is_used: false
                                };
                                subUp.cr_balance_status.push(cos);
                                subUp.save().then(subUpSave => {
                                    let voucherTransNo = 'bvs-' + (new Date().getTime());

                                    if (req.body.voucher_type) {
                                        WalletVoucher.findOne({
                                            created_by: req.body.sub_id
                                        })
                                            .exec()
                                            .then(walletVoucherCheck => {
                                                if (walletVoucherCheck) {
                                                    let newVoucherAmount = walletVoucherCheck.voucher_amount + (req.body.amount * 1)
                                                    WalletVoucher.update({
                                                        created_by: req.body.sub_id
                                                    }, {
                                                        $set: {
                                                            voucher_amount: newVoucherAmount,
                                                            wallet_amount: newVoucherAmount
                                                        }
                                                    })
                                                        .exec()
                                                        .then(walletVoucherUpdate => {
                                                            res.json({
                                                                success: true,
                                                                data: subUp
                                                            })
                                                        })
                                                        .catch(err => {
                                                            res.json({
                                                                success: false,
                                                                data: subUp
                                                            })
                                                        })

                                                } else {
                                                    WalletVoucher.create({
                                                        wallet_id: wallet._id,
                                                        transaction_no: voucherTransNo,
                                                        wallet_amount: req.body.amount,
                                                        voucher_amount: req.body.amount * 1,
                                                        created_by: req.body.sub_id,
                                                        created_at: getDateString(new Date())
                                                    })


                                                        .exec()
                                                        .then(walletVoucher => {
                                                            res.json({
                                                                success: true,
                                                                data: subUp
                                                            })
                                                        })
                                                        .catch(err => {
                                                            res.json({
                                                                success: false,
                                                                data: subUp
                                                            })
                                                        })
                                                }
                                            })
                                    } else {
                                        res.json({
                                            success: true,
                                            data: subUp
                                        })
                                    }

                                })
                                    .catch(err => {
                                        res.json({
                                            success: false,
                                            data: subUp
                                        })
                                    })
                            } else {
                                res.json({
                                    success: false,
                                    data: subUp
                                })
                            }

                        })
                        .catch(err => {
                            res.json({
                                success: false,
                                err: err
                            })
                        })
                })
                .catch(err => {
                    res.json({
                        success: false,
                        data: 'Catch'
                    })
                })
            // }
        } else {
            res.json({
                success: false,
                data: req.body
            })
        }
    });


    router.post('/wallet-payment/send-to-ssl', (req, res) => {
        let transaction_id = req.body.transaction_no;
        let requestParams;

        if (req.body.voucher_type) voucherType = true;
        else voucherType = false;

        if (req.device.type == "desktop") {
            if (productionEnv) {
                //********** Live data ****************
                var formData = "store_id=boibazarlive&store_passwd=boibazarlive53588&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=https://m.boibazar.com/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&fail_url=https://m.boibazar.com/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cancel_url=https://m.boibazar.com/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            } else {
                //********** SandBox data ****************
                var formData = "store_id=boiba5a5daaf765f29&store_passwd=boiba5a5daaf765f29@ssl&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=http://192.168.8.49:3000/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&fail_url=http://192.168.8.49:3000/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cancel_url=http://192.168.8.49:3000/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            }



        } else {

            if (productionEnv) {
                //********** Live data ****************
                var formData = "store_id=boibazarlive&store_passwd=boibazarlive53588&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=https://m.boibazar.com/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&fail_url=https://m.boibazar.com/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cancel_url=https://m.boibazar.com/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            } else {
                //********** SandBox data ****************
                var formData = "store_id=boiba5a5daaf765f29&store_passwd=boiba5a5daaf765f29@ssl&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=http://192.168.8.49:3000/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&fail_url=http://192.168.8.49:3000/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cancel_url=http://192.168.8.49:3000/api/wallet-payment/ipn-listener?sub_id=" + req.body.sub_id + "&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            }
        }
        var contentLength = formData.length;

        if (req.body.transaction_no) {
            requestParams = {
                transaction_no: req.body.transaction_no,
                payable_amount: req.body.amount,
                req_url: reqUrl,
                req_payload: formData
            }
        }

        createPaymentrequestLog(requestParams)
        request({
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: reqUrl,
            body: formData,
            method: 'POST'
        }, function (err, rest, body) {
            if (!err)
                res.json(JSON.parse(rest.body));
            else
                res.json({
                    status: "FAILED",
                    info: err
                })
        });
    });


    router.route('/wallet-payment/ipn-listener')
        .post(logger('walletpayment'), (req, res) => {
            let subId = req.query.sub_id;
            let walletValues = req.body;
            let responseParams;
            let orderValidationParam;

            responseParams = {
                transaction_no: walletValues.tran_id,
                response: walletValues
            }

            createPaymentResponseLog(responseParams)
            req.log.info(req.body);

            if (productionEnv) {
                orderValidationParam = {
                    val_id: req.body.val_id,
                    store_id: 'boibazarlive',
                    store_passwd: 'boibazarlive53588'
                };
            } else {
                orderValidationParam = {
                    val_id: req.body.val_id,
                    store_id: 'boiba5a5daaf765f29',
                    store_passwd: 'boiba5a5daaf765f29@ssl'
                }; //SandBox
            }

            if (walletValues && walletValues.status == "VALID") {
                verifyHash(req.body);
                orderValidation(orderValidationParam)
                    .then(vald => {
                        let is_valid = false;
                        if (vald.status == 'VALID') {


                            is_valid = true;
                            /* #region  Wallet Value is greater than 500 */
                            // if (walletValues.amount >= 500) {
                            // if (false) {
                            //     Wallet.create({
                            //             transaction_no: walletValues.tran_id,
                            //             created_at: getDateString(new Date()),
                            //             wallet_amount: walletValues.amount,
                            //             collection_type: "cr", //'cr'
                            //             cr_amount: walletValues.amount,
                            //             created_by: subId,
                            //             payment_type: "ssl",
                            //             is_validated: is_valid
                            //         })
                            //         .then(wallet => {
                            //             Subscriber.findOne({
                            //                     _id: subId
                            //                 })
                            //                 .exec()
                            //                 .then(subUp => {
                            //                     if (subUp) {
                            //                         let cos = {
                            //                             wallet_trans_id: wallet._id,
                            //                             wallet_amount: walletValues.amount,
                            //                             cr_amount: walletValues.amount,
                            //                             is_available: true,
                            //                             is_used: false
                            //                         };
                            //                         subUp.cr_balance_status.push(cos);
                            //                         subUp.save()
                            //                             .then(forResave => {
                            //                                 let discountedValue = 0;
                            //                                 if (walletValues.amount < 1000) {
                            //                                     discountedValue = parseInt((walletValues.amount * 5) / 100) + 1;
                            //                                 } else {
                            //                                     discountedValue = parseInt((walletValues.amount * 10) / 100) + 1;
                            //                                 }

                            //                                 Wallet.create({
                            //                                         transaction_no: walletValues.tran_id,
                            //                                         created_at: getDateString(new Date()),
                            //                                         wallet_amount: discountedValue,
                            //                                         collection_type: "cr", //'cr'
                            //                                         cr_amount: discountedValue,
                            //                                         created_by: subId,
                            //                                         payment_type: "Bonus",
                            //                                         is_validated: is_valid
                            //                                     })
                            //                                     .then(wallet2 => {
                            //                                         Subscriber.findOne({
                            //                                                 _id: subId
                            //                                             })
                            //                                             .exec()
                            //                                             .then(subUp2 => {
                            //                                                 if (subUp2) {
                            //                                                     let cos = {
                            //                                                         wallet_trans_id: wallet2._id,
                            //                                                         wallet_amount: discountedValue,
                            //                                                         cr_amount: discountedValue,
                            //                                                         is_available: true,
                            //                                                         is_used: false
                            //                                                     };
                            //                                                     subUp2.cr_balance_status.push(cos);
                            //                                                     subUp2.save();
                            //                                                 }
                            //                                             });
                            //                                         ////console.log(order)
                            //                                         ridirectTo(req, res);
                            //                                     })
                            //                                     .catch(err => {
                            //                                         ridirectTo(req, res);
                            //                                     })
                            //                             })
                            //                     }
                            //                 });
                            //             ////console.log(order)
                            //             ridirectTo(req, res);
                            //         })
                            //         .catch(err => {
                            //             ridirectTo(req, res);
                            //         })

                            // } else {
                            /* #endregion */

                            Wallet.create({
                                transaction_no: walletValues.tran_id,
                                created_at: getDateString(new Date()),
                                wallet_amount: walletValues.amount,
                                collection_type: "cr", //'cr'
                                cr_amount: walletValues.amount,
                                created_by: subId,
                                payment_type: "ssl",
                                payment_information: req.body,
                                is_validated: is_valid
                            })
                                .then(wallet => {
                                    Subscriber.findOne({
                                        _id: subId
                                    })
                                        .exec()
                                        .then(subUp => {
                                            if (subUp) {
                                                let cos = {
                                                    wallet_trans_id: wallet._id,
                                                    wallet_amount: walletValues.amount,
                                                    cr_amount: walletValues.amount,
                                                    is_available: true,
                                                    is_used: false
                                                };
                                                subUp.cr_balance_status.push(cos);
                                                subUp.save()
                                                    .then(subUpSave => {
                                                        let vaoucherTransNo = 'bvs-' + (new Date().getTime());
                                                        let voucherAmount = walletValues.amount * 1;

                                                        if (voucherType && (walletValues.amount == 500 || walletValues.amount == 1000 || walletValues.amount == 2000 || walletValues.amount == 3000)) {

                                                            WalletVoucher.findOne({
                                                                created_by: subId
                                                            })
                                                                .exec()
                                                                .then(walletVoucherCheck => {
                                                                    if (walletVoucherCheck) {
                                                                        let newVoucherAmount = walletVoucherCheck.voucher_amount + voucherAmount;
                                                                        let newWalletAmount = parseInt(walletVoucherCheck.wallet_amount) + parseInt(walletValues.amount);
                                                                        WalletVoucher.update({
                                                                            created_by: subId
                                                                        }, {
                                                                            $set: {
                                                                                voucher_amount: newVoucherAmount,
                                                                                wallet_amount: newWalletAmount
                                                                            }
                                                                        })
                                                                            .exec()
                                                                            .then(walletVoucherUpdate => {
                                                                                ridirectToVoucher(req, res);

                                                                            })
                                                                            .catch(err => {
                                                                                ridirectToVoucher(req, res);

                                                                            })

                                                                    } else {
                                                                        WalletVoucher.create({
                                                                            wallet_id: wallet._id,
                                                                            transaction_no: vaoucherTransNo,
                                                                            wallet_amount: walletValues.amount,
                                                                            voucher_amount: voucherAmount,
                                                                            created_by: subId,
                                                                            created_at: getDateString(new Date())
                                                                        })
                                                                            .exec()
                                                                            .then(walletVoucher => {
                                                                                ridirectToVoucher(req, res);

                                                                            })
                                                                            .catch(err => {
                                                                                ridirectToVoucher(req, res);

                                                                            })
                                                                    }
                                                                })
                                                                .catch(err => {
                                                                    ridirectToVoucher(req, res);

                                                                })
                                                        } else {
                                                            ridirectTo(req, res);
                                                        }
                                                    })
                                                    .catch(err => {
                                                        ridirectTo(req, res);
                                                    })
                                            }
                                        });
                                    ////console.log(order)
                                    //ridirectTo(req, res);
                                })
                                .catch(err => {
                                    ridirectTo(req, res);
                                })
                            // }

                        } else {
                            ridirectTo(req, res);

                        }
                    })
                    .catch(err => {
                        ridirectTo(req, res);
                    })
            } else if (walletValues.status == "FAILED") {
                req.body.status = "INVALID_TRANSACTION";
                req.body.error = walletValues.error;
                ridirectTo(req, res);
            } else {
                req.body.status = "CANCELLED";
                req.body.error = walletValues.error;
                ridirectTo(req, res);
            }
        });


    router.route('/wallet-cart')
        .put((req, res) => {

            let walletValues = req.body;
            let subId = req.body.sub_id;
            var totalAmount = 0;

            Subscriber.findOne({
                _id: subId
            })
                .select({
                    cr_balance_status: 1
                })
                .exec()
                .then(subInfo => {
                    if (req.body.collection_type == 'dr') {
                        if (subInfo && subInfo.cr_balance_status) {
                            subInfo.cr_balance_status.forEach(element => {
                                totalAmount += element.wallet_amount;
                            });

                            if (walletValues.amount <= totalAmount) {
                                Wallet.create({
                                    transaction_no: walletValues.transaction_no,
                                    created_at: getDateString(new Date()),
                                    wallet_amount: (-1) * (walletValues.amount),
                                    collection_type: walletValues.collection_type,
                                    payment_type: "purchasebook",
                                    dr_amount: walletValues.amount,
                                    created_by: subId
                                })
                                    .then(wallet => {
                                        Subscriber.findOne({
                                            _id: subId
                                        })
                                            .exec()
                                            .then(subUp => {
                                                if (subUp) {
                                                    let cos = {
                                                        wallet_trans_id: wallet._id,
                                                        wallet_amount: (-1) * walletValues.amount,
                                                        dr_amount: walletValues.amount,
                                                        is_available: true,
                                                        is_used: false
                                                    };
                                                    subUp.wallet_transaction_lock = true;
                                                    subUp.cr_balance_status.push(cos);
                                                    subUp.save()
                                                        .then(subSave => {
                                                            Cart.findOne({
                                                                cart_id: req.body.cart_id
                                                            })
                                                                .exec()
                                                                .then(cart => {
                                                                    cart.wallet_amount = walletValues.amount; //From http request
                                                                    cart.wallet_id = wallet._id; //From New Wallet Created
                                                                    cart.save()
                                                                        .then(cartRes => {
                                                                            res.json({
                                                                                success: true,
                                                                                message: "Wallet Debited successfully",
                                                                            })
                                                                        })
                                                                })
                                                        })
                                                }

                                            });
                                    })
                                    .catch(err => {
                                        res.json({
                                            success: false,
                                            message: "Wallet Debit failed"
                                        })

                                    })
                            } else {
                                res.json({
                                    success: false,
                                    message: 'Wallet Amount Exceeded'
                                });
                            }
                        } else {
                            res.json("Wallet Debit Failed")
                        }

                    } else if (req.body.collection_type == 'cr') {
                        Subscriber.findOne({
                            _id: subId
                        })
                            .exec()
                            .then(sub => {
                                if (sub.wallet_transaction_lock &&
                                    sub.cr_balance_status[sub.cr_balance_status.length - 1].dr_amount == parseInt(req.body.amount)) {
                                    let walletId = sub.cr_balance_status.pop().wallet_trans_id; //Pop also done

                                    Wallet.findOne({
                                        _id: walletId
                                    })
                                        .remove()
                                        .exec()
                                        .then(del => {
                                            sub.cr_balance_status;
                                            sub.wallet_transaction_lock = false;
                                            sub.save()
                                                .then(updt => {
                                                    res.json({
                                                        success: true,
                                                        data: sub,
                                                        message: "Wallet Removed"
                                                    })
                                                })


                                        })
                                } else {
                                    res.json({
                                        success: true,
                                        data: sub,
                                        message: "Can not remove"
                                    })
                                }
                            })
                    }
                });
        });



    //Unused API
    router.route('/wallet-credit')
        .put((req, res) => {

            let walletValues = req.body;
            let subId = req.body.sub_id;

            //console.log(walletValues)


            //if(current wallet balance)

            Wallet.create({
                transaction_no: walletValues.transaction_no,
                created_at: getDateString(new Date()),
                wallet_amount: walletValues.amount,
                collection_type: "cr",
                cr_amount: walletValues.amount,
                created_by: subId
            })
                .then(wallet => {
                    Subscriber.findOne({
                        _id: subId
                    })
                        .exec()
                        .then(subUp => {
                            if (subUp) {
                                let cos = {
                                    wallet_trans_id: wallet._id,
                                    wallet_amount: walletValues.amount,
                                    cr_amount: walletValues.amount,
                                    is_available: true,
                                    is_used: false
                                };
                                subUp.cr_balance_status.push(cos);
                                subUp.save();
                            }
                            res.json({
                                success: true,
                                message: "Wallet Credited successfully"
                            })
                        });
                })
                .catch(err => {
                    res.json({
                        success: false,
                        message: "Wallet Credit failed"
                    })

                })

        });


    //BoiBazar Card
    router.route('/wallet-payment/card-payment')
        .post((req, res) => {
            PromotionalCode.findOne({
                promo_code: req.body.wallet_code,
                promo_type: 'wallet',
                end_date: {
                    $gte: new Date()
                },
                is_active: {
                    $ne: false
                },
            })
                .exec()
                .then(promo => {
                    if (promo) {
                        Wallet.findOne({
                            card_no: promo.promo_code,
                            created_by: req.headers['sub_id']
                        })
                            .exec()
                            .then(wallet => {
                                if (wallet) {
                                    res.json({
                                        success: false,
                                        message: "Card Code is already used by the user"
                                    });
                                } else {
                                    let is_valid = true;

                                    Wallet.create({
                                        transaction_no: req.body.transaction_no,
                                        created_at: getDateString(new Date()),
                                        wallet_amount: 20,
                                        cr_amount: 20,
                                        collection_type: "cr",
                                        payment_type: "cashcard",
                                        created_by: req.headers['sub_id'],
                                        card_no: promo.promo_code,
                                        is_validated: is_valid
                                    })
                                        .then(walletCreate => {
                                            Subscriber.findOne({
                                                _id: req.headers['sub_id']
                                            })
                                                .exec()
                                                .then(subUp => {
                                                    if (subUp) {
                                                        let cos = {
                                                            wallet_trans_id: walletCreate._id,
                                                            cr_amount: 20,
                                                            is_available: false,
                                                            is_used: false
                                                        };
                                                        subUp.cr_balance_status.push(cos);
                                                        subUp.save();
                                                    }
                                                });

                                            res.json({
                                                success: true,
                                                message: "Recharge Successful"
                                            });
                                        })
                                        .catch(err => {
                                            res.json({
                                                status: 404,
                                                message: "Internal error, Please try after sometime"
                                            });
                                        })

                                }
                            })
                    } else {
                        res.json({
                            success: false,
                            message: "Card Code is Invalid"
                        });
                    }
                });


        });



    function verifyHash(ipn_response) {
        let keyarray = ipn_response.verify_key.split(',');
        let keyValueString = "";
        keyarray.forEach(key => {
            keyValueString = keyValueString + (key + "=" + ipn_response[key] + "&");
        })


        if (productionEnv) {
            keyValueString = keyValueString + "store_passwd=boibazarlive53588";
        } else {
            keyValueString = keyValueString + "store_passwd=boiba5a5daaf765f29@ssl";
        }

        let isVarifiedHash = ipn_response.verify_sign == md5(keyValueString);
        return isVarifiedHash;
    }

    function orderValidation(data) {
        return new Promise((resolve, reject) => {
            let param = "?val_id=" + data.val_id + "&store_id=" + data.store_id + "&store_passwd=" + data.store_passwd + "&v=1&format=json";

            let url;
            if (productionEnv) {
                url = "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php" + param;
            } else {
                url = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php" + param;
            }
            request(url, function (error, response, body) {
                resolve(JSON.parse(body));
            });
        })
    }

    function ridirectTo(req, res) {
        if (req.device.type == "desktop") {
            if (productionEnv) {
                res.redirect('https://www.boibazar.com/info/pay-after?transaction_no=' + req.body.tran_id + ',-' + req.body.status);
            } else {
                res.redirect('http://192.168.8.224/boibazar-public/info/pay-after?transaction_no=' + req.body.tran_id + ',-' + req.body.status);
            }
            return false;
        } else {
            if (productionEnv) {
                res.redirect('https://www.boibazar.com/info/pay-after?transaction_no=' + req.body.tran_id + ',-' + req.body.status);
            } else {
                res.redirect('http://192.168.8.224/boibazar-public/info/pay-after?transaction_no=' + req.body.tran_id + ',-' + req.body.status);
            }
            return false;
        }
    }

    function ridirectToVoucher(req, res) {
        if (req.device.type == "desktop") {
            if (productionEnv) {
                res.redirect('https://www.boibazar.com/info/pay-after?voucher_no=' + req.body.tran_id + ',-' + req.body.status);
            } else {
                res.redirect('http://192.168.8.224/boibazar-public/info/pay-after?voucher_no=' + req.body.tran_id + ',-' + req.body.status);
            }
            return false;
        } else {
            if (productionEnv) {
                res.redirect('https://www.boibazar.com/info/pay-after?voucher_no=' + req.body.tran_id + ',-' + req.body.status);
            } else {
                res.redirect('http://192.168.8.224/boibazar-public/info/pay-after?voucher_no=' + req.body.tran_id + ',-' + req.body.status);
            }
            return false;
        }
    }

}

export function createPaymentrequestLog(data) {
    let requestData;

    if (data.order_id) {
        requestData = {
            order_no: data.order_id,
            req_url: data.req_url,
            req_payload: data.req_payload,
            payable_amount: data.payable_amount,
            request_at: new Date()
        }
    } else {
        requestData = {
            transaction_no: data.transaction_no,
            req_url: data.req_url,
            req_payload: data.req_payload,
            payable_amount: data.payable_amount,
            request_at: new Date()
        }
    }



    Paymentrequest.create(
        requestData, (err, prData) => {
            if (err)
                console.log(err);
        })
}

export function createPaymentResponseLog(data) {
    let responseData;

    if (data.order_no) {
        responseData = {
            order_no: data.order_no,
            response: data.response,
            response_at: new Date()
        }
    } else {
        responseData = {
            transaction_no: data.transaction_no,
            response: data.response,
            response_at: new Date()
        }
    }

    Paymentresponse.create(
        responseData, (err, prData) => {
            if (err)
                console.log(err);
        })
}