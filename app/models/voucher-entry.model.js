import mongoose from 'mongoose';
let voucherEntrySchema = new mongoose.Schema({
    voucher_id: {
        type: mongoose.Schema.ObjectId, ref: 'Voucher',
    },
    account_id: {
        type: mongoose.Schema.ObjectId, ref: 'ChartOfAccount',
    },
    debit: {
        type: Number, default: 0.0
    },
    credit: {
        type: Number, default: 0.0
    },
    responsible_center: {
        type: mongoose.Schema.ObjectId, ref: 'CostCenter',
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

export default mongoose.model('VoucherEntry', voucherEntrySchema);