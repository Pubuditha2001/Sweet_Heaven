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

async function getAccessoriesById(req, res) {
  try {
    const { id } = req.params;
    const accessory = await Accessory.findById(id);
    if (!accessory) {
      return res.status(404).json({ error: "Accessory not found" });
    }
    res.json(accessory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update an accessory
async function updateAccessory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    const accessory = await Accessory.findByIdAndUpdate(
      id,
      { name, description, price, image },
      { new: true, runValidators: true }
    );

    if (!accessory) {
      return res.status(404).json({ error: "Accessory not found" });
    }

    res.json(accessory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Delete an accessory
async function deleteAccessory(req, res) {
  try {
    const { id } = req.params;
    const accessory = await Accessory.findByIdAndDelete(id);

    if (!accessory) {
      return res.status(404).json({ error: "Accessory not found" });
    }

    res.json({ message: "Accessory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAccessories,
  createAccessory,
  getAccessoriesById,
  updateAccessory,
  deleteAccessory,
};
