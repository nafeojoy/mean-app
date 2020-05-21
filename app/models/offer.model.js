import mongoose from 'mongoose';
let offerSchema = new mongoose.Schema({
    name: {
        type: String
    },
    image:{
        type:String
    },
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    }
})

export default mongoose.model('Offer', offerSchema);