const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 300
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['office', 'team', 'events', 'projects', 'awards', 'other'],
    default: 'other'
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', GallerySchema);