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
  prices: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
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
