import mongoose from 'mongoose';

let dictrictSchema = new mongoose.Schema({
    DISTRICT_NO: { type: Number },
    DISTRICTT_NAME: { type: String },
    DISTRICT_NAME_B: { type: String }
});

export default mongoose.model('District', dictrictSchema)