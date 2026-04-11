const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    source: { type: String, default: 'shared' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
