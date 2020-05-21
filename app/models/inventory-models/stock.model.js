
import mongoose from 'mongoose';

let stockSchema = new mongoose.Schema({
	product_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Product'
	},
	product_name: {
		type: String
	},
	purchase_id:{
		type: mongoose.Schema.Types.ObjectId, ref: 'Purchase'
	},
	purchase_qty: {
		type: Number, default: 0
	},
	purchase_rate: {
		type: Number, default: 0
	},
	purchase_cost: {
		type: Number, default: 0
	},
	sales_order_id:{
		type: mongoose.Schema.Types.ObjectId, ref: 'Order'
	},
	sales_qty: {
		type: Number, default: 0
	},
	sales_rate: {
		type: Number, default: 0
	},
	sales_price: {
		type: Number, default: 0
	},
	cancel_order_id:{
		type: mongoose.Schema.Types.ObjectId, ref: 'Order'
	},
	cancel_qty: {
		type: Number, default: 0
	},
	return_order_id:{
		type: mongoose.Schema.Types.ObjectId, ref: 'Order'
	},
	return_qty: {
		type: Number, default: 0
	},
	created_at: {
		type: Date, default: Date.now
	},
	created_by: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	}
});

export default mongoose.model('Stock', stockSchema);
