const mongoose = require('mongoose');

const supportIdentitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    displayName: { type: String, required: true },
    active: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportIdentity', supportIdentitySchema);
