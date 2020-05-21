import mongoose from 'mongoose';

let weightClassSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    unit: {
        type: String,
    },
    value: {
        type: Number,
    },
    is_enabled: {
        type: Boolean, default: true
    }
});

export default mongoose.model('WeightClass', weightClassSchema);