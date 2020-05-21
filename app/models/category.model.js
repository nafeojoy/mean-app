import mongoose from 'mongoose';

let categorySchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    description: {
        type: String,
    },
    hierarchy_path: {
        type: String,
    },
    image: {
        type: Object
    },
    banner: {
        type: String
    },
    import_id: { type: Number },
    book_count:{ type: Number},
    hide_on_public: {
        type: Boolean, default: false
    },
    parents: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Category'
        }
    ],
    children: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Category'
        }
    ],
    meta_tag_title: {
        type: String,
    },

    meta_tag_description: {
        type: String,
    },
    meta_tag_keywords: {
        type: String,
    },
    seo_url: {
        type: String
    },
    //     Priority Instruction
    //      All = 500

    priority: {
        type: Number, default: 500
    },
    featured: {
        status: {
            type: Boolean, default: false
        },
        tab_priority: { type: Number }
    },
    is_enabled: {
        type: Boolean, default: true
    },
    is_featured: { type: Boolean, default: false },
    featured_order: { type: Number, default: 1000 },
    order: {
        type: Number, default: 1000
    },
    featured_item: { type: Object },
    book_list: [{
        product_id: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        author: { type: mongoose.Schema.ObjectId, ref: 'Author' }, // Id of First author of that book
        category: { type: mongoose.Schema.ObjectId, ref: 'Category' }, //  This/Current category Id
        publisher: { type: mongoose.Schema.ObjectId, ref: 'Publisher' }
    }],
    soundex_code: {
        type: String, default: ''
    },
    lang: [
        {
            code: { type: String },
            content: {
                name: { type: String, required: [true, "Name is required"] },
                meta_tag_title: { type: String },
                meta_tag_description: { type: String },
                meta_tag_keywords: { type: String },
                seo_url: {
                    type: String
                }
            },
        }
    ]
});

export default mongoose.model('Category', categorySchema)