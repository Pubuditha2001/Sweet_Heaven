const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productType: {
    type: String,
    required: true,
    enum: ["cake", "accessory"],
    default: "cake",
  },
  // Generic item id used by frontend/controller (unified across product types)
  itemId: { type: mongoose.Schema.Types.ObjectId },
  sizeId: { type: mongoose.Schema.Types.ObjectId }, // _id of cake price
  qty: { type: Number, default: 1 },
  toppings: {
    type: [
      {
        toppingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topping",
        },
      },
    ],
    required: false,
    default: undefined,
  },
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
