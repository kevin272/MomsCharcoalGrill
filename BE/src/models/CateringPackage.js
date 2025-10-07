const mongoose = require('mongoose');
const { Schema } = mongoose;

const CateringPackageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    perPersonPrice: { type: Number, min: 0 },
    trayPrice: { type: Number, min: 0 },
    minPeople: { type: Number, default: 20, min: 1 },
    description: { type: String, default: '' },
    items: [{ type: String, trim: true }],
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CateringPackageSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('CateringPackage', CateringPackageSchema);
