
import mongoose from 'mongoose';

let stockSummarySchema = new mongoose.Schema({
	product_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Product'
	},
	comments:[{
		text: {type: String},
		commented_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		commented_at: {type: Date, default: Date.now}
	}],
	opening_stock: {
		type: Number, default: 0
	},
	total_purchase: {
		type: Number, default: 0
	},
	purchase_rate: {
		type: Number, default: 0
	},
	supplier:{
		type: mongoose.Schema.Types.ObjectId, ref: 'Supplier'
	},
	total_sales: {
		type: Number, default: 0
	},
	total_cancel:{
		type: Number, default: 0
	},
	total_return:{
		type: Number, default: 0
	},
	updated_at: {
		type: Date, default: Date.now
	},
	updated_by: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	}
});

export default mongoose.model('StockSummary', stockSummarySchema);
