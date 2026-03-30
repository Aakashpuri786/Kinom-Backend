const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['direct', 'group'], required: true },
    name: { type: String, default: '' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
