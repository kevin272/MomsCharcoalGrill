const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const TotalsSchema = new Schema(
  {
    subtotal: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    delivery: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CateringOrderSchema = new Schema(
  {
    customer: { type: CustomerSchema, required: true },
    eventDate: { type: Date, required: true },
    package: { type: Types.ObjectId, ref: 'CateringPackage', required: true },
    peopleCount: { type: Number, required: true, min: 1 },
    specialRequirements: { type: String, default: '' },
    totals: { type: TotalsSchema, required: true },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'fulfilled', 'cancelled'],
      default: 'new',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

CateringOrderSchema.index({ eventDate: 1 });
CateringOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CateringOrder', CateringOrderSchema);
