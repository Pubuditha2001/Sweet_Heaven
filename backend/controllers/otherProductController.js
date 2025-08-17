const OtherProduct = require("../models/OtherProduct");

// Get all other products
async function getOtherProducts(req, res) {
  try {
    const products = await OtherProduct.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create a new other product
async function createOtherProduct(req, res) {
  try {
    const { name, description, price, image, category } = req.body;
    const product = new OtherProduct({
      name,
      description,
      price,
      image,
      category,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getOtherProducts,
  createOtherProduct,
};
