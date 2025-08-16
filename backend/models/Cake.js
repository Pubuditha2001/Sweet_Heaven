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
  cakePrice: {
    type: Number,
    required: true,
  },
  cakeImage: {
    type: String,
    required: true, // Path to image in ../frontend/src/assets/cakes/cakeCategory/cake.jpg
  },
});

module.exports = mongoose.model("Cake", cakeSchema);
