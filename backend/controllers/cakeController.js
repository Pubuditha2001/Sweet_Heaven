const Cake = require("../models/Cake");

// Create a new cake
async function createCake(req, res) {
  try {
    const {
      cakeName,
      cakeDescription,
      detailedDescription,
      prices,
      priceBasedPricing,
      price,
      cakeImage,
      images,
      category,
      isFeatured,
      toppingRef,
    } = req.body;
    // prefer images array, but keep cakeImage for backward compatibility
    const normalizedCakeImage =
      (Array.isArray(images) && images.length > 0 && images[0]) || cakeImage;

    const cakeData = {
      cakeName,
      cakeDescription,
      detailedDescription,
      cakeImage: normalizedCakeImage,
      images: Array.isArray(images) ? images : images ? [images] : undefined,
      category,
      isFeatured,
      toppingRef,
    };

    if (priceBasedPricing) {
      cakeData.priceBasedPricing = true;
      cakeData.prices = Array.isArray(prices) ? prices : [];
      cakeData.price = undefined;
    } else {
      cakeData.priceBasedPricing = false;
      cakeData.price =
        typeof price === "number" ? price : price ? Number(price) : undefined;
      cakeData.prices = undefined;
    }

    const cake = new Cake(cakeData);
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
      detailedDescription,
      prices,
      priceBasedPricing,
      price,
      cakeImage,
      images,
      category,
      isFeatured,
      toppingRef,
    } = req.body;
    const normalizedCakeImage =
      (Array.isArray(images) && images.length > 0 && images[0]) || cakeImage;

    const cakeData = {
      cakeName,
      cakeDescription,
      detailedDescription,
      cakeImage: normalizedCakeImage,
      images: Array.isArray(images) ? images : images ? [images] : undefined,
      category,
      isFeatured,
      toppingRef,
    };

    if (priceBasedPricing) {
      cakeData.priceBasedPricing = true;
      cakeData.prices = Array.isArray(prices) ? prices : [];
      cakeData.price = undefined;
    } else {
      cakeData.priceBasedPricing = false;
      cakeData.price =
        typeof price === "number" ? price : price ? Number(price) : undefined;
      cakeData.prices = undefined;
    }

    const cake = await Cake.findByIdAndUpdate(req.params.id, cakeData, {
      new: true,
    });
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
