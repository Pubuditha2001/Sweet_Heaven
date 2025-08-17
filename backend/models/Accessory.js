const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
});

module.exports = mongoose.model("Accessory", accessorySchema);
