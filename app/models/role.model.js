import mongoose from 'mongoose';

let roleSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    is_enabled: {
        type: Boolean
    },
    menu: [{
        _id: {
            type: mongoose.Schema.ObjectId, ref: 'Menu'
        },
        /*name: {
            type: String
        },
        path: {
            type: String
        },*/
        permissions: [{
            name: String,
            value: String,
            status: Boolean
        }]

    }],
    full_generation: [
        { type: mongoose.Schema.ObjectId, ref: 'Menu' }
    ],
    created_at: { type: Date, default: Date.now },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        //required: [true, 'Please login first']
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        //required: [fal, 'Please login first']
    },
    updated_at: { type: Date, default: Date.now }
})

export default mongoose.model('Role', roleSchema);