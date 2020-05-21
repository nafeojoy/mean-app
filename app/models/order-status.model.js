import mongoose from 'mongoose';

let orderStatusSchema = new mongoose.Schema({
    name: {
        type: String, required: [true, "Name is required"]
    },
    prinit_inprocess: {type: Boolean},
    send_message: {type: Boolean},
    message_text: {type: String},
    description: {
        type: String
    },
    lang: [{
        code: String,
        content: {
            name: String,
            description: String
        }
    }],
    is_enabled: {
        type: Boolean, default: true
    }
});

export default mongoose.model('OrderStatus', orderStatusSchema);