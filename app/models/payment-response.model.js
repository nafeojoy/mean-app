import mongoose from 'mongoose';
let paymentResponseSchema = new mongoose.Schema({
    order_no:{
        type:Number
    },
    transaction_no:{
        type:String
    },
    response:{
        type:Object
    },
    response_at: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Paymentresponse', paymentResponseSchema);