const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, default: '' },
    quote: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
