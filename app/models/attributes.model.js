import mongoose from 'mongoose';
import slug from './plugins/unique-slug-plugin';
mongoose.plugin(slug);

let attributesSchema = new mongoose.Schema({
    name: {
        type: String
    },
    lang: [
        {
            code: { type: String },
            content: {
                name: { type: String, required: [true, "Name is required"] },
            },
        }
    ],
    is_featured: { type: Boolean, default: false },
    featured_order: { type: Number, default: 1000 },
    is_enabled: {
        type: Boolean
    },
    updated_at: {
        type: Date, default: Date.now
    },
    created_at: {
        type: Date, default: Date.now
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    }
})

export default mongoose.model('Attributes', attributesSchema);