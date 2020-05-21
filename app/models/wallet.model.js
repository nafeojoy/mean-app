import mongoose from 'mongoose';


let walletSchema = new mongoose.Schema({
    wallet_amount: {
        type: Number
    },
    cr_amount: {
        type: Number
    },
    dr_amount: {
        type: Number
    },
    collection_type: { //dr/cr
        type: String
    },
    payment_type: { //promo/wallet/refer/cashcard/purchasebook/bkash/ssl
        type: String
    },
    transaction_no: {
        //wa = wallet adjustment
        //bws = bKash Wallet
        type: String
    },
    payment_information: {
        tran_id: String,
        message: String,
        status: String,
        val_id: String,
        card_type: String,
        store_amount: Number,
        bank_tran_id: String,
        tran_date: Date,
        currency: String,
        card_issuer: String,
        card_brand: String,
        card_issuer_country: String,
        currency_amount: Number
    },
    card_no: {
        type: String
    }, //For payment_type == card
    order_no: {
        type: String
    }, //For Admin Wallet Credit
    created_at: {
        type: Date,
        default: Date.now
    },
    is_validated: {
        type: Boolean,
        default: false
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

export default mongoose.model('Wallet', walletSchema);