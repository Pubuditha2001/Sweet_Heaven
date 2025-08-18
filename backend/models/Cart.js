const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, // deterministic signature from client
  productId: String,
  name: String,
  image: String,
  sizeIndex: Number,
  sizeLabel: String,
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  toppings: [{ id: String, name: String }],
  accessories: [{ id: String, name: String }],
  addedAt: { type: Date, default: Date.now },
});

const CartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

CartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Cart", CartSchema);
