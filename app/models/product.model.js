import mongoose from 'mongoose';
import slug from './plugins/unique-slug-plugin';
mongoose.plugin(slug);

let productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    description: {
        type: String
    },
    hit_count: {
        type: Number
    },
    search_text: {
        type: String
    },
    soundex_code: { //for search
        type: String,
        default: ''
    },
    soundex_code_extra: {
        type: String,
        default: ''
    },
    published_at: {
        type: Date,
        default: Date.now
    },
    is_out_of_stock: {
        type: Boolean,
        default: false
    },
    is_out_of_print: {
        type: Boolean,
        default: false
    },
    is_checked_after_last_update: { type: Boolean, default: false },
    checked_by_after_last_update: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: {
        "42X60": { type: String },
        "120X175": { type: String },
        "150X150": { type: String },
        "250X360": { type: String },
        "300X300": { type: String },
        "uploaded_by": { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        "uploaded_at": { type: Date, default: Date.now }
    },
    back_cover_image: {
        "250X360": { type: String },
        "120X175": { type: String },
        "uploaded_by": { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        "uploaded_at": { type: Date, default: Date.now }
    },
    preview_images: [{
        image: Object,
        page_num: Number,
        disabled: { type: Boolean, default: false },
        uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploaded_at: { type: Date, default: Date.now },
        disabled: { type: Boolean, default: false }
    }],
    published_year: {
        type: String
    },

    import_id: { //should be unique
        type: Number
    },
    review_counter: {
        type: Number
    },
    review_approved_counter: {
        type: Number,
        default: 0
    },

    //     Priority Instruction
    // All = 25000
    // All Without Images = 22000
    // All With no Previews but Images = 21000
    // All With Previews  = 20000
    priority: {
        type: Number,
        default: 25000
    },

    is_bundle: { 
        type: Boolean,
        default: false
    },

    bundle_items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    is_in_bundle: { type: Boolean, default: false },

    list_of_bundle: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    current_offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
    },
    free_delivery: { type: Boolean },
    related: [{
        _id: String,
        name: String,
        description: String,
        price: Number,
        logo: String,
    }],
    downloads: { type: Number },
    available_in: [{ //Instead of stores field
        _id: String,
        name: String,
        location: String,
        phone: String,
        email: String
    }],
    quantity: { type: Number },
    min_quantity: { type: Number },

    isbn: { type: String },
    edition: { type: String },
    number_of_pages: { type: Number, default: 0 },
    published_from: { type: String },
    book_language: { type: String },

    price: { type: Number, default: 0 },  // Selling Price
    discount_rate: { type: Number, default: 0 },
    previous_price: { type: Number, default: 0 }, // Book Price
    price_updated_at: { type: Date },
    is_enabled: { type: Boolean },
    discounts: [{
        amount: Number,
        discounted_at: Date
    }],

    purchase_history: {
        price: { type: Number },
        weight: { type: Number }
    },
    rates: [{
        rate: { type: Number },
        users: [{}]
    }],
    rating_avg: { type: Number },
    rating_count: { type: Number },
    reviews: [{
        first_name: { type: String },
        last_name: { type: String },
        review_at: { type: Date },
        review_speech: { type: String },
        rate: { type: Number },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" },
        username: { type: String },
        approved: { type: Boolean, default: false }
    }],
    tax_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxClass',
    },
    length_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LengthClass',
    },
    weight_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WeightClass',
    },
    stock_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock'
    },
    attributes: [],
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publisher',
        required: [true, "Publisher must be defined"]
    },
    author: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    }],
    editor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    }],
    composer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    }],
    translator: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    }],
    authors_are: {
        type: String
    },
    accessories: {
        categories_en: [{
            name: String,
            seo_url: String,
            is_primary: Boolean,
            import_id: Number
        }],
        categories_bn: [{
            name: String,
            seo_url: String,
            is_primary: Boolean,
            import_id: Number
        }],
        authors_en: [{
            name: String,
            seo_url: String,
            is_primary: Boolean,
            import_id: Number
        }],
        authors_bn: [{
            name: String,
            seo_url: String,
            is_primary: Boolean,
            import_id: Number
        }],
        publisher_en: {
            name: String,
            seo_url: String,
            import_id: Number
        },
        publisher_bn: {
            name: String,
            seo_url: String,
            import_id: Number
        }
    },
    is_translated: { type: Boolean, default: false },
    meta_tag_title: {
        type: String
    },
    meta_tag_description: {
        type: String
    },
    meta_tag_keywords: {
        type: String
    },
    seo_url: { //should be unique
        type: String
            // slug: 'name',
            // slug_padding_size: 3,
            // unique: true
    },
    lang: [{
        code: { type: String },
        content: {
            name: { type: String, required: [true, "Name is required"] },
            description: { type: String },
            meta_tag_title: { type: String },
            meta_tag_description: { type: String },
            meta_tag_keywords: { type: String },
            seo_url: {
                type: String
            }
        },
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'You are not LoggedIn']
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { collation: { locale: 'en_US', strength: 2 } });
export default mongoose.model('Product', productSchema);