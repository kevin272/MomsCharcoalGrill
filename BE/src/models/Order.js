const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const OrderItemSchema = new Schema(
  {
    menuItem: { type: Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
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

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    items: { type: [OrderItemSchema], validate: v => v.length > 0 },
    customer: { type: CustomerSchema, required: true },
    paymentMode: { type: String, enum: ['COD', 'CallToPay', 'Card'], default: 'COD' },
    totals: { type: TotalsSchema, required: true },
    status: {
      type: String,
      enum: ['new', 'paid', 'preparing', 'delivered', 'cancelled'],
      default: 'new',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', OrderSchema);
