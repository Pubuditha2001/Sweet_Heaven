const Cake = require("../models/Cake");

// Create a new cake
async function createCake(req, res) {
  try {
    const {
      cakeName,
      cakeDescription,
      cakePrice,
      cakeImage,
      category,
      isFeatured,
    } = req.body;
    const cake = new Cake({
      cakeName,
      cakeDescription,
      cakePrice,
      cakeImage,
      category,
      isFeatured,
    });
    await cake.save();
    res.status(201).json(cake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all cakes
async function getCakes(req, res) {
  try {
    const cakes = await Cake.find();
    res.json(cakes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get a single cake by ID
async function getCakeById(req, res) {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ error: "Cake not found" });
    res.json(cake);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update a cake
async function updateCake(req, res) {
  try {
    const {
      cakeName,
      cakeDescription,
      cakePrice,
      cakeImage,
      category,
      isFeatured,
    } = req.body;
    const cake = await Cake.findByIdAndUpdate(
      req.params.id,
      { cakeName, cakeDescription, cakePrice, cakeImage, category, isFeatured },
      { new: true }
    );
    if (!cake) return res.status(404).json({ error: "Cake not found" });
    res.json(cake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Delete a cake
async function deleteCake(req, res) {
  try {
    const cake = await Cake.findByIdAndDelete(req.params.id);
    if (!cake) return res.status(404).json({ error: "Cake not found" });
    res.json({ message: "Cake deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createCake,
  getCakes,
  getCakeById,
  updateCake,
  deleteCake,
};
