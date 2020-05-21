import mongoose from 'mongoose';
let paymentrequestSchema = new mongoose.Schema({
    order_no:{
        type:Number
    },
    transaction_no:{
        type:String
    },
    payable_amount:{
        type: Number
    },
    req_url: {
        type: String        
    },
    req_payload:{
        type: String
    },
    request_at: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Paymentrequest', paymentrequestSchema);