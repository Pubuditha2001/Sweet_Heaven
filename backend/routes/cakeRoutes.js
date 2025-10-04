const express = require("express");
const router = express.Router();
const cakeController = require("../controllers/cakeController");

// Create a new cake
router.post("/", cakeController.createCake);

// Get all cakes
router.get("/", cakeController.getCakes);

// Get hidden cakes
router.get("/hidden/all", cakeController.getHiddenCakes);

// Get a single cake by ID
router.get("/:id", cakeController.getCakeById);

// Update a cake
router.put("/:id", cakeController.updateCake);

// Hide/unhide a cake
router.patch("/:id/hide", cakeController.hideCake);

// Delete a cake
router.delete("/:id", cakeController.deleteCake);

module.exports = router;
