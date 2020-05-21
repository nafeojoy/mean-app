import mongoose from 'mongoose';
let visitorBrowserCounterSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    counting_since:{
        type: Date
    },
    total_visit: {
        type: Number
    },
    chrome_mobile: {
        type: Number
    },
    mobile_safari: {
        type: Number
    },
    mobile: {
        type: Number
    },
    desktop: {
        type: Number
    },
    tablet: {
        type: Number
    },
    chrome: {
        type: Number
    },
    opera: {
        type: Number
    },
    firefox: {
        type: Number
    },
    safari: {
        type: Number
    }
});

export default mongoose.model('VisitorBrowserCounter', visitorBrowserCounterSchema);
