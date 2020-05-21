import mongoose from 'mongoose';
let smsLogSchema = new mongoose.Schema({

    message_text: {
        type: String
    },

    phone_numbers: [{
        type: String
    }],

    sms_sent_at: {
        type: Date
    },

    sms_sent_for: {
        type: String
    },

    sms_info: {
        type: Object
    },

    sms_for_order: {
        order_id: { type: mongoose.Schema.ObjectId, ref: 'Order' },
        order_status: String
    },

    sms_for_registration: {
        subscriber_id: { type: mongoose.Schema.ObjectId, ref: 'Subscriber' }
    },

    sms_for_payment: {
        order_id: { type: mongoose.Schema.ObjectId, ref: 'Order' },
        payment_status: Boolean
    },

    sms_for_password_change: {
        subscriber_id: { type: mongoose.Schema.ObjectId, ref: 'Subscriber' }
    },

    is_bulk: {
        type: Boolean
    },

    generation_id: {
        type: mongoose.Schema.ObjectId,
        ref: "GeneratedSMS"
    }

})

export default mongoose.model('SmsLog', smsLogSchema);