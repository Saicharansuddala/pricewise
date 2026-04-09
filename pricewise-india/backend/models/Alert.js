const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  itemName: { type: String, required: true, lowercase: true, trim: true },
  itemSlug: { type: String },
  targetPrice: { type: Number, required: true },
  platform: { type: String, default: null },
  city: { type: String },
  isActive: { type: Boolean, default: true },
  triggerCount: { type: Number, default: 0 },
  lastTriggered: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
