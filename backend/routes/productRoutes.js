// routes/productRoutes.js
// Product-related API endpoints

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");

// Public: Get all products
router.get("/", productController.getProducts);

// Admin: Add product
router.post("/", auth, productController.addProduct);

// ...existing code for edit, delete, etc...

module.exports = router;
