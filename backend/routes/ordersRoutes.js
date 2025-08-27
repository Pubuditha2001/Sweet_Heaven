const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");

// public endpoint to request an order (no payment handling)
router.post("/request", orderController.requestOrder);

// Admin endpoints: list, get, update (protected)
router.get("/", auth, orderController.listOrders);
router.get("/:id", auth, orderController.getOrder);
router.put("/:id", auth, orderController.updateOrder);

module.exports = router;
