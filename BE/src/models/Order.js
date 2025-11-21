const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

/**
 * Order item subdocument schema.  An order item references the menuItem it
 * originated from, stores a snapshot of the item's name/price/image, and
 * records the quantity purchased.  Keeping a copy of name/price allows
 * orders to remain accurate even if the menu item later changes.
 */
const OrderItemSchema = new Schema(
  {
    menuItem: { type: Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    extra: { type: String, default: '', trim: true },
    selectionSummary: { type: String, default: '', trim: true },
    selections: [{
      menuItem: { type: Types.ObjectId, ref: 'MenuItem' },
      name: { type: String, trim: true },
      qty: { type: Number, min: 0 },
      extras: [{ type: String, trim: true }],
    }],
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
  },
  { _id: false },
);

/**
 * Totals subdocument schema.  Stores the cost breakdown for an order
 * including the subtotal (sum of item costs), GST, delivery fee and grand
 * total.  Using a nested object simplifies updates and ensures values are
 * always present together.
 */
const TotalsSchema = new Schema(
  {
    subtotal: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    delivery: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

/**
 * Customer subdocument schema.  Captures basic contact information for the
 * person placing the order.  Additional fields can be added here (email,
 * address etc.) without affecting the rest of the model.
 */
const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  { _id: false },
);

/**
 * Order schema.  Represents a single customer order containing multiple
 * items, totals, status and optional notes.  The `status` field is limited
 * to a handful of values representing the order lifecycle.
 */
const OrderSchema = new Schema(
  {
    items: { type: [OrderItemSchema], validate: (v) => v.length > 0 },
    customer: { type: CustomerSchema, required: true },
    paymentMode: { 
    type: String, 
    enum: ['COD','PAY_TO_CALL'], 
    required: true 
  },
    totals: { type: TotalsSchema, required: true },
    status: {
      type: String,
      enum: ['new', 'paid', 'preparing', 'delivered', 'cancelled'],
      default: 'new',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', OrderSchema);
