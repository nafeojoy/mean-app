import mongoose from 'mongoose';
let smsGenerationSchema = new mongoose.Schema({
    message_text: {
        type: String
    },
    phone_numbers: [{
        type: String,
        required: [true, 'Phone Number is required']        
    }],
    number_count:{
        type: Number, default: 0
    },
    generation_time: {
        type: Date,
        required: [true, 'Generation Time is required']
    },
    schedule_time: {
        type: Date,
        // required: [true, 'Schedule Time is required']
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
    is_cancelled: { type: Boolean, default: false },
    
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

export default mongoose.model('SmsGeneration', smsGenerationSchema);