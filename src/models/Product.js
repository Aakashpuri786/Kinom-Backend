const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerAccount', required: true },
    imageUrl: { type: String, default: '' },
    moneyValue: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, default: '' },
    symbol: { type: String, default: '' },
    dob: { type: String, default: '' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['available', 'processing', 'sold', 'removed', 'active', 'inactive'],
      default: 'available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
