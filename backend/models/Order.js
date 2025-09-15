const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productType: String,
  itemId: String,
  // store a human-friendly item name snapshot at time of ordering
  itemName: String,
  // store the selected size label directly. We don't persist a size id here per
  // current requirement — only the human-readable size (e.g. "1.5kg").
  size: String,
  // store toppings as an array of plain strings (e.g. ["Mango", "Pistachio"])
  toppings: [String],
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
    // Short, human-friendly order id (e.g. SH-4F6A3B)
    orderId: String,
    cartId: String,
    items: [OrderItemSchema],
    subtotal: Number,
    note: String,
    // Optional reason provided when an order is rejected by admin
    rejectedReason: String,
    clientDetails: ClientDetailsSchema,
    status: { type: String, default: "requested" },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
