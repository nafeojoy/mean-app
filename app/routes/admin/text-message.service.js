import SmsLog from '../../models/sms-log.model';
import Employee from '../../models/inventory-models/employee.model';

import config from '../../../config/config.json';
import querystring from 'querystring';
import request from 'request';
import log4js from 'log4js';
import xmlJs from 'xml-js';

import {
    Jsonp
} from '@angular/http';

export function sendMessage(data) {


    //Sample data formate to call sendMessage
    //data={
    //     phone_numbers: ["01824....477"], 
    //     text: "Sample text", 
    //     sms_sent_for:"create_customer_order", 
    //     generation_id: ObjectId("44e2sd2sdsudhushdh233")
    // }

    const ENV = process.env.NODE_ENV;

    if (data && data.phone_numbers && Array.isArray(data.phone_numbers) && data.phone_numbers.length > 0 && data.text && data.text.length > 0) {
        // if (data && data.phone_numbers && Array.isArray(data.phone_numbers) && data.phone_numbers.length > 0 && data.text && data.text.length > 0 && (ENV == 'production' || ENV == 'PRODUCTION' || ENV == 'Production')) {
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

            let smsResponse = xmlJs.xml2json(body, { compact: true, spaces: 4 });


            // console.log(JSON.parse(smsResponse).REPLY.SMSINFO.MSISDN); //Both
            // console.log(JSON.parse(smsResponse).REPLY.SMSINFO.MSISDNSTATUS); //Invalid
            // console.log(JSON.parse(smsResponse).REPLY.SMSINFO.REFERENCEID); //Success



            if (err && err != null) {
                log("SMS send Log", "sms-send-log", err)
            } else {
                if (JSON.parse(smsResponse).REPLY.SMSINFO) {
                    data.sms_info = JSON.parse(smsResponse).REPLY.SMSINFO;
                } else {
                    data.sms_info = undefined;
                }
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
        // sms_info: logData.sms_info,
        is_bulk: logData.phone_numbers.length > 1 ? true : false,
        generation_id: logData.generation_id
    }, (err, log) => {
        if (err) {
            log("Creating sms Log", "sms-create-log", err)
        }
    })
}



export function log(log_for, dir, error) {
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

export function sendSmsToEmployee(info) {
    Employee.findOne({
            designation: info.designation
        })
        .exec()
        .then(employee => {
            let sms_data = {
                phone_numbers: [employee.phone],
                text: info.text,
                sms_sent_for: info.reason,
            }
            sendMessage(sms_data);
        })
}