const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerAccount' },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 }
      }
    ],
    status: { type: String, default: 'pending' },
    total: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
