const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  itemName: { type: String },
  itemSlug: { type: String },
  platform: { type: String, enum: ['zomato', 'swiggy', 'blinkit', 'zepto', 'bigbasket', 'dmart', 'jiomart'] },
  price: { type: Number },
  deliveryFee: { type: Number },
  platformFee: { type: Number },
  totalPrice: { type: Number },
  directUrl: { type: String },
  city: { type: String },
  inStock: { type: Boolean },
  imageUrl: { type: String },
  scrapedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Price', priceSchema);
