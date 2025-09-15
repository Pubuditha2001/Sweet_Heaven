const Topping = require("../models/Topping");

// Create a new topping collection
async function createTopping(req, res) {
  try {
    const { collectionName, toppings } = req.body;
    if (!collectionName)
      return res.status(400).json({ error: "collectionName is required" });

    // Prevent creating a duplicate collection
    const existing = await Topping.findOne({ collectionName });
    if (existing)
      return res
        .status(409)
        .json({ error: "Topping collection already exists" });

    const toppingDoc = new Topping({
      collectionName,
      toppings: toppings || [],
    });
    await toppingDoc.save();
    res.status(201).json(toppingDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

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

// Update topping collection by ID
async function updateToppingsCollection(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const toppingDoc = await Topping.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!toppingDoc) {
      return res.status(404).json({ error: "Topping collection not found" });
    }
    res.json(toppingDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get toppings for a cake category and size
async function getToppings(req, res) {
  try {
    const { collectionName } = req.query;
    // If a specific collectionName is requested, return that document
    if (collectionName) {
      const toppingDoc = await Topping.findOne({ collectionName });
      if (!toppingDoc)
        return res.status(404).json({ error: "Toppings not found" });
      return res.json(toppingDoc);
    }

    // No collectionName provided: return list of collection ids and names
    const docs = await Topping.find({}, "collectionName").lean();
    const list = docs.map((d) => ({
      id: d._id && d._id.toString(),
      collectionName: d.collectionName,
    }));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all topping collection names

// Delete a topping collection
async function deleteToppingCollection(req, res) {
  try {
    const { id } = req.params;
    const toppingDoc = await Topping.findByIdAndDelete(id);

    if (!toppingDoc) {
      return res.status(404).json({ error: "Topping collection not found" });
    }

    res.json({ message: "Topping collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createTopping,
  updateToppingsCollection,
  getToppings,
  getToppingById,
  deleteToppingCollection,
};
