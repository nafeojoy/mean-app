import mongoose from 'mongoose';
let bulkSmsLogSchema = new mongoose.Schema({
    message_text: {
        type: String,
        required: [true, 'Message Text is required']
    },
    generation_time: {
        type: Date,
        required: [true, 'Generation Time is required']
    },

    schedule_time: {
        type: Date
    },
    sent_time: {
        type: Date
    },
    sms_type: {
        type: String
    },
    ref_id: {
        type: String
    },
    is_success: { type: Boolean, default: false },
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

export default mongoose.model('GeneratedSMS', bulkSmsLogSchema);