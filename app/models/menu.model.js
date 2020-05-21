import mongoose from 'mongoose';
let menuSchema = new mongoose.Schema({
    path: {
        type: String
    },
    name: {
        type: String
    },
    parent: {
        type: mongoose.Schema.ObjectId, ref: 'Menu',
    },
    position: { type: Number },
    is_enabled: {
        type: Boolean
    },
    permissions: [],
    data: {
        menu: {
            title: String,
            icon: String,
            selected: Boolean,
            expanded: Boolean
        }
    },
    created_at: { type: Date, default: Date.now },
    // created_by: {
    //     type: mongoose.Schema.ObjectId, ref: 'User',
    //     required: [false, 'Please login first']
    // },
    // updated_by: {
    //     type: mongoose.Schema.ObjectId, ref: 'User',
    //     required: [false, 'Please login first']
    // },
    updated_at: { type: Date, default: Date.now }
})

export default mongoose.model('Menu', menuSchema);