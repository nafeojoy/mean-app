import mongoose from 'mongoose';
let voucherSchema = new mongoose.Schema({
    voucher_type: {
        type: String
    },
    baf_no: {
        type: String
    },
    voucher_date: {
        type: Date, default: Date.now
    },
    fiscal_year: {
        type: String
    },
    total_debit: {
        type: Number, default: 0.0
    },
    total_credit: {
        type: Number, default: 0.0
    },
    sum_of_debit_after_update: {
        type: Number, default: 0.0
    },
    sum_of_credit_after_update: {
        type: Number, default: 0.0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [false, 'Please login first']
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [false, 'Please login first']
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Voucher', voucherSchema);