const express = require("express");
const router = express.Router();
const {
  updateToppingsCollection,
  getToppings,
  getToppingById,
} = require("../controllers/toppingController");
// Get topping by ObjectId
router.get("/:id", getToppingById);

// Upsert toppings for a cake category and size
router.post("/", updateToppingsCollection);

// Get toppings for a cake category and size
router.get("/", getToppings);

module.exports = router;
