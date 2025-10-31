// models/Notice.js
const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true },   // the banner image you CRUD in admin
  linkUrl: { type: String },                     // optional: click-through URL
  isActive: { type: Boolean, default: true },
  dismissible: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },        // higher shows first
  startsAt: { type: Date },                      // optional schedule
  endsAt: { type: Date },                        // optional schedule
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

NoticeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Notice', NoticeSchema);
