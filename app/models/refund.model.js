import mongoose from 'mongoose';

let refundSchema = new mongoose.Schema({
    order_no: {
        type: String
    },
    refund_reason: {
        type: String
    },
    refund_comment: {
        type: String
    },
    refund_amount: { type: Number, default: 0 },
    preferred_method: {
        //Walllet or Adjustment with other Order
        type: String
    },
    customer_mobile: {
        type: String
    },
    payment_type: { //wallet/bkash/ssl
        type: String
    },
    is_executed: {
        type: Boolean,
        default: false
    },

    // SSL refund reference ID as 'ssl_ref_id'
    // bKash transaction ID as 'bkash_tran_id'
    // mobile number from (CC) as 'bkash_from_no'
    // mobile number to (Customer) as 'bkash_to_no'
    payment_info: Object,
    requested_at: {
        type: Date,
        default: Date.now
    },
    executed_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
    admin_name: {
        type: String
    },

    // Customer Care payer name as 'ssl_payer_name'
    payer_name: {
        type: String
    },

    created_by_admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    executed_by_admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

export default mongoose.model('Refund', refundSchema);