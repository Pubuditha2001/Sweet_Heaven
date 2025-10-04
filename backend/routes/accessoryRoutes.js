const express = require("express");
const router = express.Router();
const accessoryController = require("../controllers/accessoryController");

// Get all accessories
router.get("/", accessoryController.getAccessories);
// Get hidden accessories
router.get("/hidden/all", accessoryController.getHiddenAccessories);
// Get accessory by ID
router.get("/:id", accessoryController.getAccessoriesById);
// Create accessory
router.post("/", accessoryController.createAccessory);
// Update accessory
router.put("/:id", accessoryController.updateAccessory);
// Hide/unhide accessory
router.patch("/:id/hide", accessoryController.hideAccessory);
// Delete accessory
router.delete("/:id", accessoryController.deleteAccessory);

module.exports = router;
