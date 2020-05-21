import mongoose from 'mongoose';
let promotionalCodeSchema = new mongoose.Schema({
    serial: { type: Number },
    is_active: {
        type: Boolean,
        default: true
    },
    promo_code: {
        type: String,
        required: [true, 'Code is required']
    },
    discount: { type: Number },
    target_no: { type: Number },
    applied_no: { type: Number, default: 0 },
    user_applied_no: { type: Number, default: 0 },
    code_name: { type: String },
    promo_type: { type: String },
    amount: { type: Number }, //For 'promo_type'=='wallet' only 
    start_date: {
        type: Date, default: Date.now
    },
    end_date: {
        type: Date, required: [true, 'End Date is required']
    },
    created_at: { type: Date, default: Date.now },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        // required: [true, 'Please login first']
    },
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        // required: [true, 'Please login first']
    },
    updated_at: { type: Date, default: Date.now },
    is_generic:{ type: Boolean, default: true}
})

export default mongoose.model('PromotionalCode', promotionalCodeSchema);