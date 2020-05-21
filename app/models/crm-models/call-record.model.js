import mongoose from 'mongoose';
let callRecordSchema = new mongoose.Schema({
    phone_number: { type: String },
    called_at: { type: Date, default: Date.now },
    call_duration: { type: Number },
    comment: { type: String },
    customer_info: {
        name: { type: String },
        email: { type: String },
        district: { type: String },
        thana: { type: String },
        address: { type: String }
    },
    query_info: {
        query_type: { type: String },
        is_order_related: { type: Boolean },
        order: { type: mongoose.Schema.ObjectId, ref: 'Order' }
    },
    is_subscriber: { type: Boolean },
    subscriber: { type: mongoose.Schema.ObjectId, ref: 'Subscriber' },
    customer_executive: {
        type: mongoose.Schema.ObjectId, ref: 'User'
    }
})

export default mongoose.model('Callrecord', callRecordSchema);