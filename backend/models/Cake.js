const mongoose = require("mongoose");

const cakeSchema = new mongoose.Schema({
  cakeName: {
    type: String,
    required: true,
  },
  cakeDescription: {
    type: String,
    required: true,
  },
  detailedDescription: {
    type: String,
  },
  prices: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  toppingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topping",
    required: false,
    description: "Reference to toppings collection document for this cake",
  },
  cakeImage: {
    type: String,
    required: true, // Path to image in ../frontend/src/assets/cakes/cakeCategory/cake.jpg
  },
  category: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Cake", cakeSchema);
