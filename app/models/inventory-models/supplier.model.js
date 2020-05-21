
import mongoose from 'mongoose';

let SupplierSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Name is required']
  },

  address: {
    type: String,
    required: [true, 'Address is required']
  },

  area: {
    type: mongoose.Schema.Types.ObjectId, ref: 'SupplierArea',
    required: [true, 'Address is required']
  },

  cell: String,

  fax: String,

  email: String,

  website: String,

  contact_persion: String,

  account_code: String,

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

export default mongoose.model('Supplier', SupplierSchema);
