import mongoose from 'mongoose';

let stockStatusSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    description: {
        type: String,
    },
    value: {
        type: Number,
    },
    is_enabled: {
        type: Boolean, default: true
    }
});

export default mongoose.model('StockStatus', stockStatusSchema)