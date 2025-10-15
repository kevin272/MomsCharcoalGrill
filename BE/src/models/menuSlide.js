// models/MenuSlide.js
const mongoose = require('mongoose');

const MenuSlideSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['menu', 'cateringmenu'], required: true, index: true },
    image: { type: String, required: true }, // e.g. /uploads/<filename>
    title: { type: String, default: '' },
    caption: { type: String, default: '' },
    linkTo: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuSlide', MenuSlideSchema);
