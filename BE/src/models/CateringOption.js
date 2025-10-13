// models/CateringOption.js
const mongoose = require('mongoose');

const CateringOptionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },

    // pricing meta
    priceType: { type: String, enum: ['per_person', 'per_tray', 'fixed'], default: 'per_person' },
    price: { type: Number, default: 0 },           // e.g., 25.90 (person) or 160 (tray)
    minPeople: { type: Number, default: 0 },       // show on UI
    feeds: { type: String, default: '' },          // e.g., "Feeds 10–15 people"

    // Relation to existing MenuItem model
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],

    // assets
    image: { type: String, default: '' },          // stored filename (multer uploads/)
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CateringOption', CateringOptionSchema);
