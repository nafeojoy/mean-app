import mongoose from 'mongoose';

let supplierAreaSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    area_detail: {
        type: String
    },
    created_at:{
        type:Date, default:Date.now
    },
    created_by:{
        type: mongoose.Schema.ObjectId, ref: 'User'
    }
});

export default mongoose.model('SupplierArea', supplierAreaSchema)