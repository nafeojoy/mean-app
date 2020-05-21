import mongoose from 'mongoose';
let testimonialSchema = new mongoose.Schema({
    name: {
        type: String, required: [true, "Name is required"]
    },
    import_id:{type: Number},
    image: {
        type: Object
    },
    occupation: String,
    designation: String,
    email: String,
    speech: {
        type: String,
        required: [true, "Speach is required"]
    },
    speech_at: Date,
    is_enabled: { type: Boolean, default: true },
    order: Number,
    created_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    created_at: Date,
    updated_by: {
        type: mongoose.Schema.ObjectId, ref: 'User',
        required: [true, 'Please login first']
    },
    updated_at: Date
})

export default mongoose.model('Testimonial', testimonialSchema);