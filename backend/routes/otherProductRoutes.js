const express = require("express");
const router = express.Router();
const otherProductController = require("../controllers/otherProductController");

// Get all other products
router.get("/", otherProductController.getOtherProducts);
// Create other product
router.post("/", otherProductController.createOtherProduct);

module.exports = router;
