const mongoose = require('mongoose');
const { Schema } = mongoose;

const SauceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SauceSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Sauce', SauceSchema);
