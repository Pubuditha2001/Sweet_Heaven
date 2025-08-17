const Accessory = require("../models/Accessory");

// Get all accessories
async function getAccessories(req, res) {
  try {
    const accessories = await Accessory.find();
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create a new accessory
async function createAccessory(req, res) {
  try {
    const { name, description, price, image } = req.body;
    const accessory = new Accessory({ name, description, price, image });
    await accessory.save();
    res.status(201).json(accessory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getAccessories,
  createAccessory,
};
