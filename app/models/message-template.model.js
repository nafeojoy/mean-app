import mongoose from 'mongoose';
let messageTemplateSchema = new mongoose.Schema({
    template_name: {
        type: String,
        required: [true, 'Template Name is required']
    },
    message_text: {
        type: String,
        required: [true, 'Message Text is required']
    },
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

export default mongoose.model('MessageTemplate', messageTemplateSchema);