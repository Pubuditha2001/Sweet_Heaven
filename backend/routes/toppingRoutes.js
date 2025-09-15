const express = require("express");
const router = express.Router();
const {
  createTopping,
  updateToppingsCollection,
  getToppings,
  getToppingById,
  deleteToppingCollection,
} = require("../controllers/toppingController");

// Get toppings for a cake category and size
router.get("/", getToppings);

// Get topping by ObjectId
router.get("/:id", getToppingById);

// Create topping collection
router.post("/", createTopping);

// Upsert toppings for a cake category and size
router.put("/:id", updateToppingsCollection);

// Delete topping collection
router.delete("/:id", deleteToppingCollection);

module.exports = router;
