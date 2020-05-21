import mongoose from 'mongoose';


let newsSchema = new mongoose.Schema({
    headline: { type: String, required: [true, "Headline is required"] },
    import_id:{type: Number},
    image: {
        type: Object
    },
    published_at: { type: Date },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    lang: [
        {
            code: { type: String },
            content: {
                headline: { type: String, required: [true, "Headline is required"] },
                content: { type: String, required: [true, "Content is required"] },
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

export default mongoose.model('News', newsSchema);