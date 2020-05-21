import mongoose from 'mongoose';

let orderHistorySchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.ObjectId, ref: 'Order',
    },
    order_no: Number,
    order_string_date: String,
    operation: { type: String },
    products: [{
        product_id: {
            type: mongoose.Schema.ObjectId, ref: 'Product',
        },
        processed: {
            type: Number, default: 0
        },
        quantity: {
            type: Number, default: 1
        },
        stock_qty: {
            type: Number, default: 0
        },
        allocated_qty: {
            type: Number, default: 0
        },
        price: Number,
        name: String,
        image: String,
        send: { type: Boolean, default: false },
        author: String,
        publisher: String,
        purchase_order_created: {
            type: Boolean, default: false
        },
        is_out_of_stock: { type: Boolean, default: false },
        arrives_in_stock: { type: Number, default: 0 },
        is_out_of_print: { type: Boolean, default: false },
        is_info_delay: { type: Boolean, default: false },
        info_delayed: { type: Number, default: 0 }
    }],
    payment_collection: {
        is_full_collected: {
            type: Boolean,
            default: false
        },
        total_paid: {
            type: Number,
            default: 0
        },
        carrier_cost: {
            type: Number,
            default: 0
        },
        transaction_cost: {
            type: Number,
            default: 0
        },
        due_amount: {
            type: Number
        },
        tax_amount: {
            type: Number, default: 0
        },
        collection_info: [{
            collected_amount: {
                type: Number
            },
            collected_at: {
                type: Date,
                default: Date.now
            },
            gateway_ref: {
                type: mongoose.Schema.ObjectId,
                ref: "PaymentGateway"
            },
            collected_by: {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            }
        }]
    },

    delivered_at: {
        type: Date
    },
    is_paid: {
        type: Boolean,
        default: false
    },
    paument_method: {
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
    bkash_invoice_no: {
        type: String
    },
    bkash_payment_id: {
        type: String
    },
    total_price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    delivery_charge: { type: Number, default: 40 },
    wrapping_charge: { type: Number, default: 0 },
    wallet_amount: { type: Number, default: 0 },
    wallet_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Wallet"
    },
    payable_amount: { type: Number, default: 0 },
    has_returened: { type: Boolean, default: false },
    carrier: {
        type: mongoose.Schema.ObjectId,
        ref: "OrderCarrier"
    },
    parcel_wight: {
        type: Number,
        default: 0
    },
    total_book: {
        type: Number,
        default: 0
    },
    is_guest_order: {
        type: Boolean,
        default: false
    },
    delivery_address: Object,
    payment_address: Object,
    is_sibling: { type: Boolean, default: false },
    parent_order: { type: mongoose.Schema.ObjectId, ref: "Order" },
    parent_order_no: { type: Number },
    is_partially_processed: { type: Boolean, default: false },
    is_partial_process_completd: { type: Boolean, default: false },
    partially_processed_siblings: [
        { type: mongoose.Schema.ObjectId, ref: "Order" }
    ],
    order_shipping_wight: { type: Number },
    is_partially_returned: {
        type: Boolean, default: false
    },
    returned_items: [{
        product_id: {
            type: mongoose.Schema.ObjectId, ref: 'Product',
        },
        quantity: Number,
        price: Number,
        name: String
    }],
    returned_by: {
        type: mongoose.Schema.ObjectId, ref: 'User'
    },
    returned_at: {
        type: Date
    },
    return_amount_adjustment: {
        is_adjust: {
            type: Boolean
        },
        adjust_method: {
            type: String
        },
        adjust_by: {
            type: mongoose.Schema.ObjectId, ref: 'User'
        }
    },
    returned_cost: { type: Number },
    view: {
        is_unread: {
            type: Boolean,
            default: true
        },
        read_at: {
            type: Date
        },
        view_by: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    },
    customer_contact_info: {
        is_received_order: {
            type: Boolean
        },
        other_contact_history: [{
            contact_at: {
                type: Date
            },
            contact_by: {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            },
            contact_note: {
                type: String
            }
        }]
    },
    current_order_status: {
        status_id: {
            type: mongoose.Schema.ObjectId,
            ref: "OrderStatus"
        },
        status_name: String,
        updated_at: {
            type: Date,
            default: Date.now
        },
        updated_by: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    },
    performed_order_statuses: [{
        status_id: {
            type: mongoose.Schema.ObjectId,
            ref: "OrderStatus"
        },
        status_name: String,
        updated_at: {
            type: Date,
            default: Date.now
        },
        updated_by: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    }],
    promo_id: {
        type: mongoose.Schema.ObjectId,
        ref: "PromotionalCode"
    },
    referral_code: {
        type: String
    },
    order_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    created_from: {
        type: String,
    }
})

export default mongoose.model('OrderHistory', orderHistorySchema);