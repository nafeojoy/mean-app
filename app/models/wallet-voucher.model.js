import mongoose from 'mongoose';


let walletVoucherSchema = new mongoose.Schema({
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
    }
})

export default mongoose.model('WalletVoucher', walletVoucherSchema);