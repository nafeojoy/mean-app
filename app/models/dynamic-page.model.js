import mongoose from 'mongoose';
let dynamicPageSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"] },
    content_url: {
        type: String,
        required: [true, "Content is required"],
        unique: [true, "Content Url should be unique"]
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    image: String,
    meta_tag_title: { type: String },
    meta_tag_description: { type: String },
    meta_tag_keywords: { type: String },
    lang: [
        {
            code: { type: String },
            content: {
                title: { type: String, required: [true, "Name is required"] },
                content: { type: String, required: [true, "Content is required"] },
                meta_tag_title: { type: String },
                meta_tag_description: { type: String },
                meta_tag_keywords: { type: String },
            },
        }
    ],
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

export default mongoose.model('DynamicPage', dynamicPageSchema);