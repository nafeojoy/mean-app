import mongoose from 'mongoose';

let lengthClassSchema = new mongoose.Schema({
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

export default mongoose.model('LengthClass', lengthClassSchema)