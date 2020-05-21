import mongoose from 'mongoose';
let bannerSchema = new mongoose.Schema({
    is_enabled: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number, default:100 
    },
    click_url: {
        type: String,
    },
    image: String,
    created_at: { type: Date, default: Date.now },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    updated_at: { type: Date, default: Date.now }
})

export default mongoose.model('Banner', bannerSchema);