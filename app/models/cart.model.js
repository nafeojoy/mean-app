import mongoose from "mongoose";
let cartSchema = new mongoose.Schema({
    cart_id: {
        type: Number
    },
    status: {
        type: Boolean,
        default: true
    },
    quantity: Number,
    wrapping_charge: { type: Number, default: 0 },
    wallet_amount: { type: Number, default: 0 },
    wallet_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Wallet"
    },
    total: Number,
    products: [{
        product_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Product"
        },
        quantity: Number,
        free_delivery: Boolean,
        price: Number,
        previous_price: Number,
        seo_url: String,
        name: String,
        image: String,
        author: String,
        publisher: String
    }],
    discount: Number,
    promo_id: {
        type: mongoose.Schema.ObjectId,
        ref: "PromotionalCode"
    },

    referral_code: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: "Subscriber"
    }
});

export default mongoose.model("Cart", cartSchema);