const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Sauce schema
 *
 * Defines the fields for a sauce item. Mirrors the upstream implementation
 * in the original project.  Each sauce has a unique name, numeric price,
 * optional description and image, an availability flag and an order field
 * for sorting.
 */
const SauceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Unique name index to prevent duplicates
SauceSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Sauce', SauceSchema);