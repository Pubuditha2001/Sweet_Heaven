// models/Product.js
// Defines the structure of a product in the database

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., cake, cupcake
  description: String,
  price: { type: Number, required: true },
  images: [String], // Array of Cloudinary URLs
  featured: { type: Boolean, default: false },
});

module.exports = mongoose.model("Product", productSchema);
