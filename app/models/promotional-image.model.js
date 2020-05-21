import mongoose from 'mongoose';
let promotionalImageSchema = new mongoose.Schema({
    is_enabled: {
        type: Boolean,
        default: true
    },
    image: String,
    created_at: {type: Date, default: Date.now},
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    updated_at: {type: Date, default: Date.now}
})

export default mongoose.model('PromotionalImage', promotionalImageSchema);