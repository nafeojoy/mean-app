import mongoose from 'mongoose';
let costCenterSchema = new mongoose.Schema({
    name: {
        type: String
    },
    is_enabled:{
        type:Boolean,
        default: true
    },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    updated_at: {
        type: Date, default: Date.Now        
    },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    created_at: {
        type: Date, default: Date.Now
    }
})

export default mongoose.model('CostCenter', costCenterSchema);