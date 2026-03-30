const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
      }
    ],
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
