import mongoose from 'mongoose';

let thanaSchema = new mongoose.Schema({
    THANA_NO: { type: Number },
    THANA_NAME: { type: String },
    THANA_NAME_B: { type: String },
    AREA_NAMES:[{
        type: String
    }],
    POST_CODES:[{
        type: Number
    }],
    CARRIER:{
        type: mongoose.Schema.Types.ObjectId, ref: 'OrderCarrier'
    },
    F_DISTRICT_NO: { type: Number }
});

export default mongoose.model('Thana', thanaSchema)