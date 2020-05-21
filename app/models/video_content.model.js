import mongoose from 'mongoose';
let videoContentSchema = new mongoose.Schema({
    is_enabled: {
        type: Boolean,
        default: true
    },
    title:{
        type: String
    },
    priority: {
        type: Number, default:100 
    },
    video_url: {
        type: String,
    },
    video_thumbnail_path: {
        type:String
    },
    expiry_date: {
        type: Date
    },
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

export default mongoose.model('VideoContent', videoContentSchema);