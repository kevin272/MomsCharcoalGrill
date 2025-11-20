// models/CateringOption.js
const mongoose = require('mongoose');

// Per-menu-item extra selections (e.g., "with gravy", "no gravy")
const ItemConfigSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    extraOptions: [{ type: String, trim: true }],
  },
  { _id: false },
);

// Optional selection limits for special options (e.g., General Catering)
const SelectionRulesSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    // Map of category key -> max allowed selections (e.g., { chicken: 1, salad: 2 })
    categoryLimits: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { _id: false },
);

const CateringOptionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },

    // pricing meta
    priceType: { type: String, enum: ['per_person', 'per_tray', 'fixed'], default: 'per_person' },
    price: { type: Number, default: 0 },           // e.g., 25.90 (person) or 160 (tray)
    minPeople: { type: Number, default: 0 },       // show on UI
    feeds: { type: String, default: '' },          // e.g., "Feeds 10-15 people"

    // Relation to existing MenuItem model
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    itemConfigurations: { type: [ItemConfigSchema], default: [] },

    // Special selection limits (used for "General Catering")
    selectionRules: { type: SelectionRulesSchema, default: () => ({ enabled: false, categoryLimits: {} }) },

    // assets
    image: { type: String, default: '' },          // stored filename (multer uploads/)
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CateringOption', CateringOptionSchema);
