const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    category: { type: Types.ObjectId, ref: 'MenuCategory', required: true },
    tags: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MenuItemSchema.index({ slug: 1 }, { unique: true });
MenuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
