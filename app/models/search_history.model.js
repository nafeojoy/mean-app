import mongoose from 'mongoose';

let searchHistorySchema = new mongoose.Schema({
    search_string: {
        type: String
    },
    search_response: Object,
    string_count: {
        type: Number,
        default: 0
    }
})

export default mongoose.model('SearchHistory', searchHistorySchema);