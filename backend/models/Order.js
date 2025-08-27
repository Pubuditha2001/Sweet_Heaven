const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productType: String,
  itemId: String,
  sizeId: String,
  toppings: [{ toppingId: String }],
  qty: { type: Number, default: 1 },
  price: Number,
  addedAt: Date,
});

const ClientDetailsSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  phone2: String,
  email: String,
  confirmationMethod: String,
  scheduledDate: String,
});

const OrderSchema = new mongoose.Schema(
  {
    cartId: String,
    items: [OrderItemSchema],
    subtotal: Number,
    note: String,
    clientDetails: ClientDetailsSchema,
    status: { type: String, default: "requested" },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
