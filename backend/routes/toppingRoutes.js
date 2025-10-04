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

// Get hidden toppings
router.get(
  "/hidden/all",
  require("../controllers/toppingController").getHiddenToppings
);

// Get topping by ObjectId
router.get("/:id", getToppingById);

// Create topping collection
router.post("/", createTopping);

// Upsert toppings for a cake category and size
router.put("/:id", updateToppingsCollection);

// Hide/unhide topping collection
router.patch(
  "/:id/hide",
  require("../controllers/toppingController").hideToppingCollection
);

// Delete topping collection
router.delete("/:id", deleteToppingCollection);

module.exports = router;
