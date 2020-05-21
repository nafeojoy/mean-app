import mongoose from 'mongoose';

let giftSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    description: {
        type: String,
    },
    gift_cost: {
        type: Number, default: 0
    },
    estimated_qty: {
        type: Number, default: 0
    },
    allocated_qty: {
        type: Number, default: 0
    },
    is_enabled: {
        type: Boolean, default: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    created_at: {
        type: Date, default: Date.now
    },
    updated_at: {
        type: Date, default: Date.now
    }
});

export default mongoose.model('Gift', giftSchema)