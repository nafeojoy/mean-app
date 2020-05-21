import mongoose from 'mongoose';
let dashboardSchema = new mongoose.Schema({
    update_sq: {
        type: Number
    },
    updated_at: {
        type: Date, default: Date.now
    },
    order_summary: {
        total_order: { type: Number },
        Pending: { type: Number },
        Confirmed: { type: Number },
        Inshipment: { type: Number },
        ReturnRequest: { type: Number },
        OrderClosed: { type: Number },
        Delivered: { type: Number },
        Cancelled: { type: Number }
    },
    sales_summary: {
        order: { type: Number },
        price: { type: Number },
        book: { type: Number },
        delivery: { type: Number },
        discount: { type: Number },
        wrapping: { type: Number },
        carrier: { type: Number },
        net: { type: Number }
    },
    inventory_summary: {
        c_order: { type: Number },
        c_order_book: { type: Number },
        c_order_price: { type: Number },
        p_order: { type: Number },
        p_order_book: { type: Number },
        purchase: { type: Number },
        purchase_book: { type: Number },
        purchase_price: { type: Number }
    }
})

export default mongoose.model('Dashboard', dashboardSchema);
