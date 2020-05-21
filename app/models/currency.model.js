import mongoose from 'mongoose';

let currencySchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    code: {
        type: String, required: true,
    },
    symbol_left: {
        type: String,
    },
    symbol_right: {
        type: String,
    },
    value: {
        type: Number,
    },
    decimal_place: {
        type: Number,
    },
    is_enabled: {
        type: Boolean, default: true
    },
    order: {
        type: Number, default: 1000
    }
});

export default mongoose.model('Currency', currencySchema)