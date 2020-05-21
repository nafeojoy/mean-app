import SmsLog from '../../models/sms-log.model';
import config from '../../../config/config.json';
import querystring from 'querystring';
import request from 'request';
import log4js from 'log4js';

export function sendMessage(data) {
    //Sample data formate to call sendMessage
    //data={
    //     phone_numbers: ["01824....477"], 
    //     text: "Sample text", 
    //     sms_sent_for:"create_customer_order", 
    //     generation_id: ObjectId("44e2sd2sdsudhushdh233")
    // }

    ////console.log("SEND MSG")
    ////console.log(data)

    //const ENV = process.env.NODE_ENV;
    const ENV = config.ENV;

  
    // && (ENV == 'production' || ENV == 'PRODUCTION' || ENV == 'Production')

    if (data && data.phone_numbers && Array.isArray(data.phone_numbers) && data.phone_numbers.length > 0 && data.text && data.text.length > 0 && (ENV == 'production' || ENV == 'PRODUCTION' || ENV == 'Production')) {


        let formData = "";
        formData = formData.concat("user=", config.TEXT_SMS_USER);
        formData = formData.concat("&pass=", config.TEXT_SMS_PASSWORD);
        formData = formData.concat("&sid=", config.TEXT_SMS_SID);

        data.phone_numbers.map((phone_number, i) => {
            formData = formData.concat("&sms[", i, "][", 0, "]=88", phone_number);
            formData = formData.concat("&sms[", i, "][", 1, "]=", data.text);
            formData = formData.concat("&sms[", i, "][", 2, "]=1234567891");
        })

        request({
            headers: {
                'Content-Length': formData.length,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'https://sms.sslwireless.com/pushapi/dynamic/server.php',
            body: formData,
            method: 'POST'
        }, function(err, rest, body) {
            if (err && err != null) {


                localLog("SMS send Log", "sms-send-log", err)
            } else {

                createLog(data)
            }
        });
    }
}

function createLog(logData) {
    SmsLog.create({
        message_text: logData.text,
        phone_numbers: logData.phone_numbers,
        sms_sent_at: new Date(),
        sms_sent_for: logData.sms_sent_for,
        sms_for_order: logData.sms_for_order,
        sms_for_registration: logData.sms_for_registration,
        sms_for_payment: logData.sms_for_payment,
        sms_for_password_change: logData.sms_for_password_change,
        is_bulk: logData.phone_numbers.length > 1 ? true : false,
        generation_id: logData.generation_id
    }, (err, log) => {
        if (err) {
            localLog("Creating sms Log", "sms-create-lof", err)
        }
    })
}

function localLog(log_for, dir, error) {
    let file_name = 'logs/' + dir + '.log';
    log4js.configure({
        appenders: {
            everything: {
                type: 'dateFile',
                filename: file_name,
                pattern: '.yyyy-MM-dd-hh',
                compress: false
            }
        },
        categories: {
            default: {
                appenders: ['everything'],
                level: 'debug'
            }
        }
    });
    let logger = log4js.getLogger(log_for);
    logger.error(error);
}