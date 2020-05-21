import mongoose from 'mongoose';
let publicVisitSchema = new mongoose.Schema({
    fingerprint: {
        type: String
    },
    visited_at: {
        type: Date
    },
    visiting_ip: {
        type: String
    },
    user_agent: {
        type: Object
    },
    referrer_site: {
        type: Object
    }
})

export default mongoose.model('PublicVisit', publicVisitSchema);