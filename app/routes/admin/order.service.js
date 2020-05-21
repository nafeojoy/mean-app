import Order from '../../models/order.model';
import Wallet from '../../models/wallet.model';
import Subscriber from '../../models/subscriber.model';
import OrderHistory from '../../models/order-history.model';
import {
    sendMessage
} from './text-message.service';
import request from 'request';


export function saveOrderLog(data, user, operation) {



    OrderHistory.create({
        order_id: data._id,
        order_no: data.order_no,
        order_string_date: data.order_string_date,
        operation: operation,
        products: data.products,
        payment_collection: data.payment_collection,
        delivered_at: data.delivered_at,
        is_paid: data.is_paid,
        paument_method: data.paument_method,
        payment_information: data.payment_information,
        bkash_invoice_no: data.bkash_invoice_no,
        bkash_payment_id: data.bkash_payment_id,
        total_price: data.total_price,
        discount: data.discount,
        delivery_charge: data.delivery_charge,
        wrapping_charge: data.wrapping_charge,
        wallet_amount: data.wallet_amount,
        wallet_id: data.wallet_id,
        payable_amount: data.payable_amount,
        has_returened: data.has_returened,
        carrier: data.carrier,
        parcel_wight: data.parcel_wight,
        total_book: data.total_book,
        is_guest_order: data.is_guest_order,
        delivery_address: data.delivery_address,
        payment_address: data.payment_address,
        is_sibling: data.is_sibling,
        parent_order: data.parent_order,
        parent_order_no: data.parent_order_no,
        is_partially_processed: data.is_partially_processed,
        is_partial_process_completd: data.is_partial_process_completd,
        partially_processed_siblings: data.partially_processed_siblings,
        order_shipping_wight: data.order_shipping_wight,
        is_partially_returned: data.is_partially_returned,
        returned_items: data.returned_items,
        returned_by: data.returned_by,
        returned_at: data.returned_at,
        return_amount_adjustment: data.return_amount_adjustment,
        returned_cost: data.returned_cost,
        view: data.view,
        customer_contact_info: data.customer_contact_info,
        current_order_status: data.current_order_status,
        performed_order_statuses: data.performed_order_statuses,
        promo_id: data.promo_id,
        referral_code: data.referral_code,
        order_at: data.order_at,
        created_by: user,
        created_from: data.created_from
    })
        .then(history => {
            console.log("OrderHistory Create success", history._id);
        })
        .catch(err => {
            console.log("OrderHistory Create Error", err);
        })
}

export function getOrderAgingInfo(status_name) {
    return new Promise((resolve, reject) => {
        if (status_name == 'Pending') {
            let curDate = new Date();
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': status_name
                }
            },
            {
                $project: {
                    consumed: {
                        $trunc: {
                            $divide: [{
                                $subtract: [curDate, "$order_at"]
                            },
                                3600000
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    age: {
                        $switch: {
                            branches: [{
                                case: { $lte: ["$consumed", 1] },
                                then: 1
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 2] },
                                        { $gt: ["$consumed", 1] }
                                    ]
                                },
                                then: 2
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 3] },
                                        { $gt: ["$consumed", 2] }
                                    ]
                                },
                                then: 3
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 4] },
                                        { $gt: ["$consumed", 3] }
                                    ]
                                },
                                then: 4
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 23] },
                                        { $gt: ["$consumed", 4] }
                                    ]
                                },
                                then: 5
                            }
                            ],
                            default: 24
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$age',
                    orders: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
            ])
                .exec()
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        } else if (status_name == 'pending_payment') {
            let curDate = new Date();
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': { $in: ['Pending', 'Confirmed', 'Dispatch', 'Inshipment', 'Delivered'] },
                    'payment_collection.is_full_collected': false
                }
            },
            {
                $project: {
                    consumed: {
                        $trunc: {
                            $divide: [{
                                $subtract: [curDate, "$order_at"]
                            },
                                86400000
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    age: {
                        $switch: {
                            branches: [{
                                case: { $lte: ["$consumed", 1] },
                                then: 1
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 2] },
                                        { $gt: ["$consumed", 1] }
                                    ]
                                },
                                then: 2
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 3] },
                                        { $gt: ["$consumed", 2] }
                                    ]
                                },
                                then: 3
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 4] },
                                        { $gt: ["$consumed", 3] }
                                    ]
                                },
                                then: 4
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 5] },
                                        { $gt: ["$consumed", 4] }
                                    ]
                                },
                                then: 5
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 6] },
                                        { $gt: ["$consumed", 5] }
                                    ]
                                },
                                then: 6
                            }
                            ],
                            default: 7
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$age',
                    orders: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
            ])
                .exec()
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        } else {
            let curDate = new Date();
            Order.aggregate([{
                $match: {
                    'current_order_status.status_name': status_name
                }
            },
            {
                $project: {
                    consumed: {
                        $trunc: {
                            $divide: [{
                                $subtract: [curDate, "$current_order_status.updated_at"]
                            },
                                86400000
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    age: {
                        $switch: {
                            branches: [{
                                case: { $lte: ["$consumed", 1] },
                                then: 1
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 2] },
                                        { $gt: ["$consumed", 1] }
                                    ]
                                },
                                then: 2
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 3] },
                                        { $gt: ["$consumed", 2] }
                                    ]
                                },
                                then: 3
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 4] },
                                        { $gt: ["$consumed", 3] }
                                    ]
                                },
                                then: 4
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 5] },
                                        { $gt: ["$consumed", 4] }
                                    ]
                                },
                                then: 5
                            },
                            {
                                case: {
                                    $and: [
                                        { $lte: ["$consumed", 6] },
                                        { $gt: ["$consumed", 5] }
                                    ]
                                },
                                then: 6
                            }
                            ],
                            default: 7
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$age',
                    orders: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
            ])
                .exec()
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        }
    })
}

export function sendSms(summary, result) {
    let current_date = new Date();
    let year = current_date.getFullYear().toString().substr(-2);
    let month = current_date.getMonth() + 1;
    let date = current_date.getDate();
    let curr_month = month < 10 ? ("0" + month) : month;
    let curr_date = date < 10 ? ("0" + date) : date;
    sendMessage({
        phone_numbers: ["01824589241", "01980001049", "01922101112"],
        text: `BB PENDING: ${year}${curr_month}${curr_date}
    Confirmed 5/24h Plus:${result.Pending["5"] ? result.Pending["5"] : 0}/${result.Pending["24"] ? result.Pending["24"] : 0}/${summary.Pending}
    Dispatch 2/7d Plus:${result.Confirmed["2"] ? result.Confirmed["2"] : 0}/${result.Confirmed["7"] ? result.Confirmed["7"] : 0}/${summary.Confirmed}
    Inshipment 2/7d Plus:${result.Dispatch["2"] ? result.Dispatch["2"] : 0}/${result.Dispatch["7"] ? result.Dispatch["7"] : 0}/${summary.Dispatch}
    COD Due 2/7d Plus:${result.pending_payment["2"] ? result.pending_payment["2"] : 0}/${result.pending_payment["7"] ? result.pending_payment["7"] : 0}/${summary.pending_payment}`,
        sms_sent_for: "sending_customer_order_aging_info"
    })
    // let text = `BB PENDING: ${year}${curr_month}${curr_date}
    // Confirmed 5/24h Plus:${result.Pending["5"] ? result.Pending["5"] : 0}/${result.Pending["24"] ? result.Pending["24"] : 0}/${summary.Pending}
    // Dispatch 2/7d Plus:${result.Confirmed["2"] ? result.Confirmed["2"] : 0}/${result.Confirmed["7"] ? result.Confirmed["7"] : 0}/${summary.Confirmed}
    // Inshipment 2/7d Plus:${result.Dispatch["2"] ? result.Dispatch["2"] : 0}/${result.Dispatch["7"] ? result.Dispatch["7"] : 0}/${summary.Dispatch}
    // COD Due 2/7d Plus:${result.pending_payment["2"] ? result.pending_payment["2"] : 0}/${result.pending_payment["7"] ? result.pending_payment["7"] : 0}/${summary.pending_payment}`
    // console.log(text);
}

export function sendEmail(result) {
    const nodemailer = require("nodemailer");
    let current_date = new Date();
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
        from: '"Boibazar update 👻" <boibazar.com@gmail.com>',
        to: "shamim@belivit.com, rezaul.karim@omicon.com, shahidul@omicon.com",
        subject: "Daily aging update of customer orders.",
        text: "",
        html: `<h2>Aging status of customer orders: ${current_date.getDate()}/${current_date.getMonth() + 1}/${current_date.getFullYear()},
    ${current_date.getHours()}:${current_date.getMinutes()}AM</h2>
    <table width="100%">
        <tr>
            <td>
                <h3>Pending Confirm:</h3>
                <table width="50%">
                    <thead>
                        <tr>
                            <th style="border-bottom: 1px dotted;text-align: center;">Age</th>
                            <th style="border-bottom: 1px dotted;text-align: center;">Order Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">1 Hour</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Pending["1"] ? result.Pending["1"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">2 Hours</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Pending["2"] ? result.Pending["2"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">3 Hours</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Pending["3"] ? result.Pending["3"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">4 Hours</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Pending["4"] ? result.Pending["4"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">5 Hours+</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Pending["5"] ? result.Pending["5"] : 0}</td>
                        </tr>
                    </tbody>
                </table>
            </td>
            <td>
                <h3>Pending Dispatch:</h3>
                <table width="50%">
                    <thead>
                        <tr>
                            <th style="border-bottom: 1px dotted;text-align: center;">Age</th>
                            <th style="border-bottom: 1px dotted;text-align: center;">Order Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">1 Day</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["1"] ? result.Confirmed["1"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">2 Days</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["2"] ? result.Confirmed["2"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">3 Days</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["3"] ? result.Confirmed["3"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">4 Days</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["4"] ? result.Confirmed["4"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">5 Days</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["5"] ? result.Confirmed["5"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">6 Days</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["6"] ? result.Confirmed["6"] : 0}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px dotted;text-align: center;">7 Days+</td>
                            <td style="border-bottom: 1px dotted;text-align: center;">${result.Confirmed["7"] ? result.Confirmed["7"] : 0}</td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>
    <hr>
    <table width="100%">
            <tr>
                <td>
                    <h3>Pending Inshipment:</h3>
                    <table width="50%">
                        <thead>
                            <tr>
                                <th style="border-bottom: 1px dotted;text-align: center;">Age</th>
                                <th style="border-bottom: 1px dotted;text-align: center;">Order Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">1 Day</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["1"] ? result.Dispatch["1"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">2 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["2"] ? result.Dispatch["2"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">3 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["3"] ? result.Dispatch["3"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">4 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["4"] ? result.Dispatch["4"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">5 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["5"] ? result.Dispatch["5"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">6 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["6"] ? result.Dispatch["6"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">7 Days+</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.Dispatch["7"] ? result.Dispatch["7"] : 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td>
                    <h3>Pending Payment:</h3>
                    <table width="50%">
                        <thead>
                            <tr>
                                <th style="border-bottom: 1px dotted;text-align: center;">Age</th>
                                <th style="border-bottom: 1px dotted;text-align: center;">Order Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">1 Day</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["1"] ? result.pending_payment["1"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">2 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["2"] ? result.pending_payment["2"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">3 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["3"] ? result.pending_payment["3"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">4 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["4"] ? result.pending_payment["4"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">5 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["5"] ? result.pending_payment["5"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">6 Days</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["6"] ? result.pending_payment["6"] : 0}</td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px dotted;text-align: center;">7 Days+</td>
                                <td style="border-bottom: 1px dotted;text-align: center;">${result.pending_payment["7"] ? result.pending_payment["7"] : 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error in mail sent", error);
        } else {
            console.log("Aging mail sent successfully");
        }
    });
}

export function updateOrderBookAvailibilityStatus() {
    getAvailibilityInfo()
        .then(rslt => {
            return updateAvailability(rslt)
        })
        .then(updt => {
            console.log("Updated order availibility");
        })
        .catch(err => {
            console.log("Updated order availibility", err);
        })
}

export function updateEcourier(ecourierFormData) {
    let ecourierReqUrl = 'https://ecourier.com.bd/apiv2/';
    let YOUR_SECRET = 'nrO5R';
    let YOUR_KEY = 'eeB2';
    let USER_ID = 'B6510';

    request({
        headers: {
            'API_SECRET': YOUR_SECRET,
            'API_KEY': YOUR_KEY,
            'USER_ID': USER_ID,
            'Content-Type': 'application/json'
        },
        uri: ecourierReqUrl,
        body: JSON.stringify(ecourierFormData),
        method: 'POST'
    }, function (err, rest, body) {
        console.log(err)
        console.log(rest)
        console.log(body)

        if (!err && body.response_code == 200) {
            console.log(body)
        } else {
            Order.update({
                order_no: parseInt(ecourierFormData.product_id)
            }, {
                '$set': {
                    'ecourier_failed': true
                }
            }).exec()
            console.log(err)
        }
    });
}

export function updateSalamiWallet(sub_id, walletAmount) {
    return new Promise((resolve, reject) => {
        Subscriber.findOne({
            _id: sub_id
        })
            .exec()
            .then(subUp => {
                if (subUp) {
                    let cos = {
                        wallet_amount: Math.round(walletAmount),
                        cr_amount: Math.round(walletAmount),
                        is_available: true,
                        is_used: false
                    };
                    subUp.cr_balance_status.push(cos);
                    subUp.save()
                        .then(result => {
                            if (result) {
                                Wallet.create({
                                    transaction_no: 'bbsalami' + new Date().getTime(),
                                    created_at: new Date(),
                                    wallet_amount: Math.round(walletAmount),
                                    cr_amount: Math.round(walletAmount),
                                    collection_type: "cr",
                                    payment_type: "salami",
                                    created_by: result._id,
                                    is_validated: true
                                })
                                    .then(wallet => {
                                        resolve(wallet);
                                    })
                            } else {
                                resolve(result);
                            }
                        })
                        .catch(err => {
                            reject(err);
                        })
                } else {
                    resolve(subUp);
                }
            })
            .catch(err => {
                return err;
            })

    })


}

export function updateReferralWallet(referral_code, walletAmount) {

    return new Promise((resolve, reject) => {
        Subscriber.findOne({
            referral_code: referral_code
        })
            .exec()
            .then(subUp => {
                if (subUp) {
                    let cos = {
                        wallet_amount: Math.round(walletAmount),
                        cr_amount: Math.round(walletAmount),
                        is_available: true,
                        is_used: false
                    };
                    subUp.cr_balance_status.push(cos);
                    subUp.save()
                        .then(result => {
                            if (result) {
                                Wallet.create({
                                    transaction_no: 'bbr' + new Date().getTime(),
                                    created_at: new Date(),
                                    wallet_amount: Math.round(walletAmount),
                                    cr_amount: Math.round(walletAmount),
                                    collection_type: "cr",
                                    payment_type: "referral",
                                    created_by: result._id,
                                    is_validated: true
                                })
                                    .then(wallet => {
                                        resolve(wallet);
                                    })
                            } else {
                                resolve(result);
                            }
                        })
                        .catch(err => {
                            reject(err);
                        })
                } else {
                    resolve(subUp);
                }
            })
            .catch(err => {
                return err;
            })

    })

}

export function updateOrderBookAvailibilityStatusSync() {
    return new Promise((resolve, reject) => {
        getAvailibilityInfo()
            .then(rslt => {
                return updateAvailability(rslt)
            })
            .then(updt => {
                console.log("Updated order availibility");
                resolve(updt);
            })
            .catch(err => {
                console.log("Updated order availibility", err);
                resolve(err);
            })
    })
}


function updateAvailability(products) {
    let updates = products.map(product => {
        return new Promise((resolve, reject) => {
            if (product.stock_qty == 0) {
                updateEmptyStock(product.order, product.product_id)
                    .then(ords => {
                        resolve(ords);
                    })
            } else if (product.stock_qty >= product.required_qty) {
                updateAvailableStock(product.order, product.product_id, product.stock_qty)
                    .then(ords => {
                        resolve(ords);
                    })
            } else {
                updateInsufficientStock(product.order, product.product_id, product.stock_qty)
                    .then(ords => {
                        resolve(ords);
                    })
            }
        })
    })
    return Promise.all(updates);
}

function updateEmptyStock(orders, product_id) {
    let updates = orders.map(order => {
        return new Promise((resolve, reject) => {
            Order.update({
                _id: order._id,
                'products.product_id': product_id
            }, {
                $set: {
                    'products.$.stock_qty': 0,
                    'products.$.allocated_qty': 0
                }
            })
                .exec()
                .then(updt => {
                    resolve(updt);
                })
        })
    })
    return Promise.all(updates);
}

function updateAvailableStock(orders, product_id, stock_qty) {
    let updates = orders.map(order => {
        return new Promise((resolve, reject) => {
            Order.update({
                _id: order._id,
                'products.product_id': product_id
            }, {
                $set: {
                    'products.$.stock_qty': stock_qty,
                    'products.$.allocated_qty': order.quantity
                }
            })
                .exec()
                .then(updt => {
                    resolve(updt);
                })
        })
    })
    return Promise.all(updates);
}

function updateInsufficientStock(orders, product_id, stock_qty) {
    let curr_stock = stock_qty;
    let updates = orders.map(order => {
        curr_stock = curr_stock - order.quantity;
        return new Promise((resolve, reject) => {
            Order.update({
                _id: order._id,
                'products.product_id': product_id
            }, {
                $set: {
                    'products.$.stock_qty': stock_qty,
                    'products.$.allocated_qty': curr_stock >= 0 ? order.quantity : 0
                }
            })
                .exec()
                .then(updt => {
                    resolve(updt);
                })
        })
    })
    return Promise.all(updates);
}

function getAvailibilityInfo() {
    return new Promise((resolve, reject) => {
        Order.aggregate([{
            $match: {
                'current_order_status.status_name': 'Confirmed'
            }
        },
        {
            $unwind: "$products"
        },
        {
            $group: {
                _id: "$products.product_id",
                required_qty: { $sum: "$products.quantity" },
                order: {
                    $push: {
                        _id: "$_id",
                        quantity: "$products.quantity"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "stocksummaries",
                localField: '_id',
                foreignField: 'product_id',
                as: 'stock'
            }
        }
        ])
            .exec()
            .then(products => {
                let results = products.map(product => {
                    let itm = {
                        product_id: product._id,
                        order: product.order,
                        required_qty: product.required_qty
                    }
                    if (product.stock.length == 0) {
                        itm.stock_qty = 0
                    } else {
                        let opening_stock = product.stock[0].opening_stock ? product.stock[0].opening_stock : 0;
                        let total_purchase = product.stock[0].total_purchase ? product.stock[0].total_purchase : 0;
                        let total_sales = product.stock[0].total_sales ? product.stock[0].total_sales : 0;
                        let total_return = product.stock[0].total_return ? product.stock[0].total_return : 0;
                        itm.stock_qty = opening_stock + total_purchase + total_return - total_sales;
                    }
                    return itm;
                })
                resolve(results);
            })
            .catch(err => {
                reject(err)
            })
    })
}