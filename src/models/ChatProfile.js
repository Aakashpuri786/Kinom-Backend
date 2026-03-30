const mongoose = require('mongoose');

const chatProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatProfile', chatProfileSchema);
