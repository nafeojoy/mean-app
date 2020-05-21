import mongoose from 'mongoose';
let customerQuerySchema = new mongoose.Schema({
    name: { type: String },
    query_no: {type: Number},
    phone_number: { type: String },
    query: {
        book_name: { type: String },
        author: { type: String }
    },
    message: {
        type: String
    },
    assigned_to: {
        type: mongoose.Schema.ObjectId, ref: 'User'
    },
    comment: [{
        name: { type: String },
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        comment_at: { type: Date },
        speech: { type: String }
    }],
    answered:{
        type:Boolean,default:false
    },
    created_from: {
        type: String //Site or Admin panel
    },
    query_at: { type: Date, default: Date.now },
    mark_as_done_by:{
        type: mongoose.Schema.ObjectId, ref: 'User'
    },
    mark_as_done_at: { type: Date }
    
})

export default mongoose.model('Customerquery', customerQuerySchema);