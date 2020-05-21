
import mongoose from 'mongoose';

let EmployeeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Name is required']
  },

  employee_id: {
    type: String

  },

  department: {
    name: String,
    id: Number
  },

  designation: {
    type: String
  },

  phone: String,

  email: String,

  is_enabled: {
    type: Boolean, default: 1
  },
  created_at: {
    type: Date, default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
  updated_at: {
    type: Date //, default: Date.now
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
});

export default mongoose.model('Employee', EmployeeSchema);
