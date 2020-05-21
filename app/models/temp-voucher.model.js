import mongoose from 'mongoose';


let tempWalletVoucherSchema = new mongoose.Schema({
    wallet_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Wallet'
    },
    wallet_amount: {
        type: Number
    },
    voucher_amount: {
        type: Number
    },
    last_voucher_amount: {
        type: Number
    },
    transaction_no: {
        type: String
    },
    transaction_lock: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'Subscriber'
    },
    created_by_admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    order_no: {
        type: Number, default: 0
    },
    cart_id: {
        type: Number, default: 0
    },
    is_active: {
        type: Boolean, default: true
    },
})

export default mongoose.model('TempWalletVoucher', tempWalletVoucherSchema);
