const mongoose = require('mongoose');

const sellerAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    profileImage: { type: String, default: '' },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    otpCode: { type: String, default: '' },
    otpExpiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerAccount', sellerAccountSchema);
