const mongoose = require('mongoose');

const supportConversationSchema = new mongoose.Schema(
  {
    supportAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportChatAccount', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportConversation', supportConversationSchema);
