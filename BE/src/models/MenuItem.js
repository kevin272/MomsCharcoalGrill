const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

/**
 * MenuItem schema.  Defines a single item that can appear on the menu.  Each
 * item belongs to a category, has a price, description, image and optional
 * tags.  The slug is generated from the name and used as a unique
 * identifier in URLs.
 */
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
  { timestamps: true },
);

// Ensure slug is unique and add a text index on name/description/tags
MenuItemSchema.index({ slug: 1 }, { unique: true });
MenuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);