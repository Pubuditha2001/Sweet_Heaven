const express = require("express");
const router = express.Router();
const accessoryController = require("../controllers/accessoryController");

// Get all accessories
router.get("/", accessoryController.getAccessories);
// Create accessory
router.post("/", accessoryController.createAccessory);

module.exports = router;
