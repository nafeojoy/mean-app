import mongoose from 'mongoose';

let permissionSchema = new mongoose.Schema({
    resource_name: {
        type: String
    },
    resource_url: String
})

export default mongoose.model('Permission', permissionSchema);