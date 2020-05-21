import mongoose from 'mongoose';
let blogContentSchema = new mongoose.Schema({
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
    blog_text:{
        type: String
    },
    blog_url: {
        type: String,
    },
    blog_thumbnail_path: {
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

export default mongoose.model('BlogContent', blogContentSchema);