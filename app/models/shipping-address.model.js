import mongoose from 'mongoose';
let shippingAddressSchema = new mongoose.Schema({
    is_primary: {
        type: Boolean,
        default: true
    },
    contact_name: {
        type: String,
        required: [true, "Contact name is required"],
    },
    district: {
        type: String,
    },
    thana: {
        type: String
    },
    area: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    phone_number: {
        type: String,
        required: [true, "Phone number is required"],
    },
    alter_phone: {
        type: String
    },

    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'Subscriber',
        required: [true, 'Please login first']
    },
    carrier: {
        type: mongoose.Schema.ObjectId,
        ref: "OrderCarrier"
    },

    //Only for Send As Gift ----
    sender_name: {
        type: String,
    },
    sender_mobile: {
        type: String
    }
    //-----------------------------
})

export default mongoose.model('ShippingAddress', shippingAddressSchema);