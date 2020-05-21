import mongoose from 'mongoose';

let languageSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    code: {
        type: String,
    },
    locale: {
        type: String,
    },
    is_enabled: {
        type: Boolean, default: true
    },
    order: {
        type: Number, default: 1000
    }
});

export default mongoose.model('Language', languageSchema)