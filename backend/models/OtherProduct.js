const mongoose = require("mongoose");

const otherProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
});

module.exports = mongoose.model("OtherProduct", otherProductSchema);
