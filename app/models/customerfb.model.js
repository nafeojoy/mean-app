import mongoose from 'mongoose';
let customerFbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
    },
    subject: {
        type: String
    },
    message: {
        type: String,
        required: [true, "Message is required"],
    },
    
    created_at: {
        type: Date, default: Date.now
    }
})

export default mongoose.model('CustomerFB', customerFbSchema);