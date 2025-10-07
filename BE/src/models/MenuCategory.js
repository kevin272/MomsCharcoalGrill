const mongoose = require('mongoose');
const { Schema } = mongoose;

const MenuCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuCategorySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('MenuCategory', MenuCategorySchema);
