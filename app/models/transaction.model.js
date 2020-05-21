import mongoose from 'mongoose';

let transactionSchema = new mongoose.Schema({
    transaction_date: {
        type: Date
    },
    seq_no: {
        type: Number
    },
    string_date:{
        type: String
    },
    any_transaction_today: {
        type: Boolean
    },
    orders: [{type: mongoose.Schema.ObjectId, ref: 'Order'}],
    transaction_head: [{
        head_name: { type: String },
        head_id: { type: mongoose.Schema.ObjectId, ref: 'OrderCarrier' },
        order: [{
            order_no: { type: Number },
            order_value: { type: Number },
            order_date: {type: Date},
            carrier_charge: { type: Number },
            return_charge: { type: Number },
            transaction_charge: { type: Number },
            transact_by: { type: mongoose.Schema.ObjectId, ref: 'PaymentGateway' },
            transact_at: { type: Date }
        }],
        total_order_value: { type: Number },
        total_carrier_charge: { type: Number },
        total_return_charge: { type: Number },
        total_transaction_charge: { type: Number },
        opening: {
            receivable: { type: Number },
            received: { type: Number }
        },
        closing: {
            receivable: { type: Number },
            received: { type: Number }
        },
        updated_at: { type: Date }
    }]
})

export default mongoose.model('Transaction', transactionSchema);