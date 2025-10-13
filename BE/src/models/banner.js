const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const HeroBannerSchema = new Schema(
  {
    items: [{ type: Types.ObjectId, ref: 'MenuItem', required: true }], // ordered
    primaryItem: { type: Types.ObjectId, ref: 'MenuItem', required: true }, // must be one of items
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ensure primaryItem ∈ items
HeroBannerSchema.pre('validate', function (next) {
  if (this.items?.length && this.primaryItem) {
    const ok = this.items.some(id => String(id) === String(this.primaryItem));
    if (!ok) return next(new Error('primaryItem must be one of items'));
  }
  next();
});

module.exports = mongoose.model('HeroBanner', HeroBannerSchema);
