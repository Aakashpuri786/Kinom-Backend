const mongoose = require('mongoose');

const supportChatAccountSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    status: { type: String, default: 'online' },
    active: { type: Boolean, default: true },
    assignedIdentityId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportIdentity' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportChatAccount', supportChatAccountSchema);
