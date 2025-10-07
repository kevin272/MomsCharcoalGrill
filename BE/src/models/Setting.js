// models/Setting.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true }, // can store GST, deliveryCharge, hours, etc.
  },
  { timestamps: true }
);

SettingSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('Setting', SettingSchema);
