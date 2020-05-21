import mongoose from 'mongoose';

let paymentGatewaySchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    is_enabled: {
        type: Boolean, default: true
    },
    created_at: {
        type: Date, default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    updated_at: {
        type: Date, default: Date.now
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
});

export default mongoose.model('PaymentGateway', paymentGatewaySchema)