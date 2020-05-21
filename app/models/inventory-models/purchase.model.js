
import mongoose from 'mongoose';

let PurchaseSchema = new mongoose.Schema({
    purchase_no: {
        type: Number,
        required: [true, 'Purchase no is required']
    },
 
    purchase_order: {
        type: mongoose.Schema.ObjectId, ref: 'PurchaseOrder'
    },

    order_no: {
        type: Number
    },

    customer_orders: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Orders' }
    ],

    general_purchase: {
        type: Boolean
    },

    purchase_date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required']
    },

    remark: { type: String },

    received_by: { type: String },

    courier_charge: {
        type: Number, default: 0
    },

    convenience: {
        type: Number, default: 0
    },

    net_amount: {
        type: Number, default: 0
    },

    purchase_cost: {
        type: Number, default: 0
    },

    total_book: {
        type: Number, default: 1
    },

    purchase_mode: { // Cash or Credit
        type: String,
        required: [true, 'Purchase mode is required']
    },

    products: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Product'
        },
        product_name: {
            type: String
        },
        authors_id: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Author'
        }],
        publisher_id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Publisher'
        },
        rate: {
            type: Number, default: 0
        },

        quantity: {
            type: Number, default: 0
        },

        price: { // item_rate * item_qty 
            type: Number, default: 0
        },

        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },

        uom: { type: String }
    }],

    created_at: {
        type: Date, default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: [false, 'You are not LoggedIn']
    },
    updated_at: {
        type: Date //, default: Date.now
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
});

export default mongoose.model('Purchase', PurchaseSchema);
