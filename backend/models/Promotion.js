// models/Promotion.js
// Defines the structure of a promotion/discount in the database

const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
  minOrderAmount: Number,
  frequentCustomer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Promotion", promotionSchema);
