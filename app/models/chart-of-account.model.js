import mongoose from 'mongoose';
let chartOfAccountSchema = new mongoose.Schema({
    name: {
        type: String
    },
    account_code: {
        type: String,
        unique: true
    },
    voucher_type: {
        type: String
    },
    note: {
        type: String
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'ChartOfAccount',
    },
    is_leaf: {
        type: Boolean,
        default: true
    },
    is_enabled: {
        type: Boolean,
        default: true
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

export default mongoose.model('ChartOfAccount', chartOfAccountSchema);