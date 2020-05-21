import Order from "../../models/order.model";
import Wallet from "../../models/wallet.model";
import Subscriber from "../../models/subscriber.model";
import Paymentrequest from '../../models/payment-request.model';
import Paymentresponse from '../../models/payment-response.model';

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

import { freDeliveryOnlinePaymentActive, amountOverFreeDelivery } from "./_order.router";

export default (app, router, logger, auth) => {

    const ENV = process.env.NODE_ENV;
    let productionEnv;
    let reqUrl;

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

    router.post('/order-payment/send-to-ssl', (req, res) => {
        let transaction_id = req.body.order_id;
        let requestParams;

        if(freDeliveryOnlinePaymentActive){
            req.body.amount = req.body.amount - 40;
        }

        if (req.device.type == "desktop") {

            if (productionEnv) {
                var formData = "store_id=boibazarlive&store_passwd=boibazarlive53588&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=https://m.boibazar.com/api/customer-payment/ipn-listener&fail_url=https://m.boibazar.com/api/customer-payment/ipn-listener&cancel_url=https://m.boibazar.com/api/customer-payment/ipn-listener&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            } else {
                var formData = "store_id=boiba5a5daaf765f29&store_passwd=boiba5a5daaf765f29@ssl&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=http://localhost:3000/api/customer-payment/ipn-listener&fail_url=http://localhost:3000/api/customer-payment/ipn-listener&cancel_url=http://localhost:3000/api/customer-payment/ipn-listener&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            }
        } else {
            if (productionEnv) {
                var formData = "store_id=boibazarlive&store_passwd=boibazarlive53588&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=https://m.boibazar.com/api/customer-payment/ipn-listener&fail_url=https://m.boibazar.com/api/customer-payment/ipn-listener&cancel_url=https://m.boibazar.com/api/customer-payment/ipn-listener&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            } else {
                var formData = "store_id=boiba5a5daaf765f29&store_passwd=boiba5a5daaf765f29@ssl&total_amount=" + req.body.amount + "&currency=BDT&tran_id=" + transaction_id + "&success_url=http://localhost:3000/api/customer-payment/ipn-listener&fail_url=http://localhost:3000/api/customer-payment/ipn-listener&cancel_url=http://localhost:3000/api/customer-payment/ipn-listener&cus_name=" + req.body.name + "&cus_email=" + req.body.email + "&cus_add1=" + req.body.address + "&cus_add2=Dhaka&cus_city=" + req.body.district + "&cus_state=" + req.body.thana + "&cus_postcode=NA&cus_country=Bangladesh&cus_phone=" + req.body.phone_number + "&cus_fax=NA&ship_name=NA&ship_add1=Dhaka&ship_add2=Dhaka&ship_city=Dhaka&ship_state=Dhaka&ship_postcode=1000&ship_country=Bangladesh&value_a=ref001_A&value_b=ref002_B&value_c=ref003_C&value_d=ref004_D"
            }
        }

        var contentLength = formData.length;
        if (req.body.order_id) {
            requestParams = {
                order_id: req.body.order_id,
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
    })

    router.route('/customer-payment/ipn-listener')
        .post(logger('payment'), (req, res) => {
            let orderValres = req.body;
            let orderValidationParam;
            createPaymentResponseLog({
                order_no: orderValres.tran_id,
                response: orderValres
            })
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


            if (orderValres && orderValres.status == "VALID") {
                updateTransaction(req)
                    .then(trans => {
                        verifyHash(req.body);
                        return orderValidation(orderValidationParam)
                    })
                    .then(vald => {
                        ridirectTo(req, res);
                    })
            } else if (orderValres.status == "FAILED") {
                req.body.status = "INVALID_TRANSACTION";
                req.body.error = orderValres.error;
                updateTransaction(req)
                    .then(trans => {
                        ridirectTo(req, res);
                    })
            } else {
                req.body.status = "CANCELLED";
                req.body.error = orderValres.error;
                updateTransaction(req).then(trans => {
                    ridirectTo(req, res);
                })
            }
        })


    router.route('/order-payment/:order_no')
        .get((req, res) => {
            Order.findOne({
                order_no: req.params.order_no
            })
                .exec()
                .then(order => {
                    res.json(order);
                })
        })

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

    function updateTransaction(req) {
        return new Promise((resolve, reject) => {
            let totalPaid = parseInt(req.body.currency_amount);

            //console.log(req.body);
            Order.findOne({
                order_no: req.body.tran_id
            })
                .exec()
                .then(order => {
                    // console.log("Card Payment")
                    // console.log(order)
                    if (order.payable_amount != order.payment_collection.total_paid) {

                        if (order.payment_collection && order.payment_collection.total_paid > 0) {
                            totalPaid = totalPaid + parseInt(order.payment_collection.total_paid);
                        }
                        //CHange Here
                        order.is_paid = req.body.status == "VALID" ? true : false;
                        order.payment_information = {
                            tran_id: req.body.tran_id,
                            status: req.body.status,
                            message: req.body.status == "VALID" ? "Payment has been successful" : req.body.error,
                            val_id: req.body.val_id,
                            card_type: req.body.card_type,
                            store_amount: req.body.store_amount,
                            bank_tran_id: req.body.bank_tran_id,
                            tran_date: req.body.tran_date,
                            currency: req.body.currency,
                            card_issuer: req.body.card_issuer,
                            card_brand: req.body.card_brand,
                            card_issuer_country: req.body.card_issuer_country,
                            currency_amount: req.body.currency_amount
                        };
                        if (req.body.status == "VALID") {
                            let collectionInfo = order.payment_collection.collection_info;
                            let new_info = {
                                collected_amount: req.body.currency_amount,
                                transaction_cost: req.body.currency_amount - req.body.store_amount,
                                collected_at: new Date(),
                                gateway_ref: "5ae54e80d055af76056b5aa9"
                            };

                            collectionInfo.push(new_info);

                            order.payment_collection = {
                                is_full_collected: true,
                                total_paid: totalPaid,
                                transaction_cost: order.payment_collection.transaction_cost + (req.body.currency_amount - req.body.store_amount),
                                carrier_cost: 0,
                                due_amount: 0,
                                collection_info: collectionInfo
                            }

                            if (order.total_price >= amountOverFreeDelivery) {
                                order.delivery_charge = freDeliveryOnlinePaymentActive ? 0 : 40;
                                order.payable_amount =
                                    parseInt(order.total_price) +
                                    parseInt(order.delivery_charge) +
                                    parseInt(order.wrapping_charge) -
                                    parseInt(order.discount)
                            }

                        }
                        return order.save(err => {
                            if (order.is_paid) {
                                let text_message = "Dear ";
                                if (order.delivery_address.sender_name) {
                                    text_message = text_message.concat(order.delivery_address.sender_name, ". ");

                                } else {
                                    text_message = text_message.concat(order.delivery_address.contact_name, ". ");

                                }
                                text_message = text_message.concat("Your payment has been successful for order No. ", order.order_no, ". We received", " ");
                                text_message = text_message.concat(order.payment_information.currency_amount, " via ", order.payment_information.card_type, ". ");
                                text_message = text_message.concat("Thank you for being with us.");

                                if (order.delivery_address.sender_mobile) {
                                    sendMessage({
                                        phone_numbers: [order.delivery_address.sender_mobile],
                                        sms_for_payment: {
                                            order_id: order._id,
                                            payment_status: 'VALID'
                                        },
                                        text: text_message,
                                        sms_sent_for: "online_payment_success_confirmation"
                                    })
                                } else {
                                    sendMessage({
                                        phone_numbers: [order.delivery_address.phone_number],
                                        sms_for_payment: {
                                            order_id: order._id,
                                            payment_status: 'VALID'
                                        },
                                        text: text_message,
                                        sms_sent_for: "online_payment_success_confirmation"
                                    })
                                }

                            }
                            resolve(order);
                        })
                    } else {
                        resolve(order);
                    }

                })
        })
    }

    function ridirectTo(req, res) {
        if (req.device.type == "desktop") {
            if (productionEnv) {
                res.redirect('https://www.boibazar.com/info/pay-after?order_no=' + req.body.tran_id);
            } else {
                res.redirect('http://192.168.8.49/boibazar-public/info/pay-after?order_no=' + req.body.tran_id);
            }
            return false;
        } else {
            if (productionEnv) {
                res.redirect('https://www.boibazar.com/info/pay-after?order_no=' + req.body.tran_id);
            } else {
                res.redirect('http://192.168.8.49/boibazar-public/info/pay-after?order_no=' + req.body.tran_id);
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