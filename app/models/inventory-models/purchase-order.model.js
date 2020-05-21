import mongoose from 'mongoose';
let purchaseOrder = new mongoose.Schema({
    order_no: {
        type: Number,
    },
    collected_at: { type: Date },
    order_assign_to: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Employee'
    },
    status: {
        is_in_process: { type: Boolean, default: true },
        is_completed: { type: Boolean, default: false },
        is_partialy_processed: { type: Boolean, default: false },
        is_cancelled: { type: Boolean },
    },
    customer_orders: [{
        type: mongoose.Schema.ObjectId, ref: 'Order'
    }],
    orderd_products: [{
        product_id: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        product_name: { type: String },
        authors_id: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Author'
        }],
        publisher_id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Publisher'
        },
        price: { type: Number }, //Boibazar sell price
        purchase_price: { type: Number }, //Last/Avg purchase Price
        quantity: { type: Number }, //Order(Required) Quantity
        pur_quantity: { type: Number, default: 0 }, //Purchased Quantity
        stock_quantity: { type: Number },
        supplier: { type: mongoose.Schema.ObjectId, ref: 'Supplier' }
    }],
    total_sell_price: { type: Number }, //sum of qty*price (boibazar sell price)
    total_book: {
        type: Number, default: 1
    },
    created_by: { type: mongoose.Schema.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('PurchaseOrder', purchaseOrder);
