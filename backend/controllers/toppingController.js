// Get topping by ObjectId
async function getToppingById(req, res) {
  try {
    const toppingDoc = await Topping.findById(req.params.id);
    if (!toppingDoc)
      return res.status(404).json({ error: "Topping not found" });
    res.json(toppingDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const Topping = require("../models/Topping");

// Create or update topping document for a cake category and size
async function updateToppingsCollection(req, res) {
  try {
    const { collectionName, toppings } = req.body;
    const toppingDoc = await Topping.findOneAndUpdate(
      { collectionName },
      { toppings },
      { upsert: true, new: true }
    );
    res.status(201).json(toppingDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get toppings for a cake category and size
async function getToppings(req, res) {
  try {
    const { collectionName } = req.query;
    const toppingDoc = await Topping.findOne({ collectionName });
    if (!toppingDoc)
      return res.status(404).json({ error: "Toppings not found" });
    res.json(toppingDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  updateToppingsCollection,
  getToppings,
  getToppingById,
};
