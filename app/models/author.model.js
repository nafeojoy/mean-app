import mongoose from 'mongoose';
// import slug from './plugins/unique-slug-plugin';
// mongoose.plugin(slug);

let authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  description: {
    type: String
  },
  occupation: {
    type: String
  },
  birth_place: {
    type: String
  },
  nationality: {
    type: String
  },
  image: {
    type: Object
  },
  import_id: {
    type: Number
  },
  birth_at: {
    type: Date
  },
  died_at: {
    type: Date
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
  soundex_code: {
    type: String,
    default: ''
  },
  seo_url: {
    type: String
    // slug: 'name',
    // slug_padding_size: 3,
    // unique: true
  },
  lang: [{
    code: {
      type: String
    },
    content: {
      name: {
        type: String,
        required: [true, "Name is required"]
      },
      description: {
        type: String
      },
      birth_place: {
        type: String
      },
      occupation: {
        type: String
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
        // unique: true
      }
    },
  }],

  book_list: [{
    product_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'Author'
    }, // Id of This/Current Id of that book
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category'
    }, //  This/Current category Id
    publisher: {
      type: mongoose.Schema.ObjectId,
      ref: 'Publisher'
    }
  }],

  awards: [{
    title: String,
    reason: String,
    date: Date
  }],
  is_enabled: {
    type: Boolean,
    default: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_enabled: {type: Boolean, default: true},
  featured_order: {
    type: Number,
    default: 1000
  },
  soundex_code: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'You are not LoggedIn or Unauthorized']
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'You are not LoggedIn or Unauthorized']
  }
});
export default mongoose.model('Author', authorSchema);
