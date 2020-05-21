import mongoose from 'mongoose';

let returnorderSchema = new mongoose.Schema({
    return_at: { type: Date },
    return_reason:{type: String},
    order_id: { type: mongoose.Schema.ObjectId, ref: 'Order' },
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
        quantity: Number,
        price: Number,
        name: String,
        image: String,
        author: String,
        publisher: String
    }],
    total_product_price: { type: Number, default: 0 },
    delivery_charge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    wrapping_charge: { type: Number, default: 0 },
    order_price: { type: Number, default: 0 },
    return_cost: {type: Number, default: 0}
})

export default mongoose.model('ReturnOrder', returnorderSchema);