const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', gallerySchema);
