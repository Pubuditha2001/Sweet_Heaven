// models/Order.js
// Defines the structure of an order in the database

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      customCake: { type: Object }, // Details for custom cake orders
    },
  ],
  total: { type: Number, required: true },
  paymentStatus: { type: String, default: "pending" },
  deliveryRequested: { type: Boolean, default: false },
  referenceImage: String, // Cloudinary URL for custom cake design
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
