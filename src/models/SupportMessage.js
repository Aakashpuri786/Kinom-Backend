const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportConversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ['admin', 'user'], required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
