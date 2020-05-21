import mongoose from 'mongoose';
import slug from './plugins/unique-slug-plugin';
mongoose.plugin(slug);

let publisherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    import_id:{
        type: Number
    },
    description: {
        type: String
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    is_enabled: {
        type: Boolean
    },
    is_featured: { type: Boolean, default: false },
    featured_order: { type: Number, default: 1000 },
    page_url: {
        type: String,
        required: [true, "Page Url is required"]
    },
    is_author: {
        type: Boolean
    },
    author: {
        type: mongoose.Schema.ObjectId, ref: 'Author'
    },
    website: {
        type: String
    },
    order: {
        type: Number
    },
    reviews: [{}],
    logo: {
        type: Object
    },
    meta_tag_title: {
        type: String
    },
    meta_tag_description: {
        type: String
    },
    meta_tag_keywords: {
        type: String
    },
    seo_url: {
        type: String
        // slug: 'name',
        // slug_padding_size: 3,
        // unique: true
    },
    lang: [
        {
            code: { type: String },
            content: {
                name: { type: String, required: [true, "Name is required"] },
                description: { type: String },
                meta_tag_title: { type: String },
                meta_tag_description: { type: String },
                meta_tag_keywords: { type: String },
                seo_url: {
                    type: String
                    // unique: true
                }
            },
        }
    ],
    book_list: [{
        product_id: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        author: { type: mongoose.Schema.ObjectId, ref: 'Author' }, // Id of First author of that book
        category: { type: mongoose.Schema.ObjectId, ref: 'Category' }, // Id of First Category of that book
        publisher: { type: mongoose.Schema.ObjectId, ref: 'Publisher' }
    }],
    soundex_code: {
        type: String, default: ''
    },
    created_at: {
        type: Date, default: Date.now
    },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'You are not LoggedIn or Unauthorized']
    },
    updated_at: {
        type: Date, default: Date.now
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'You are not LoggedIn or Unauthorized']
    }
});
export default mongoose.model('Publisher', publisherSchema);