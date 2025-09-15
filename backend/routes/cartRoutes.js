const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// cartId is an application-provided id (e.g., stored in client localStorage)
router.get("/:cartId", cartController.getCart);
router.post("/:cartId/items", cartController.addItem);
router.put("/:cartId/items/:itemId", cartController.updateItem);
router.delete("/:cartId/items/:itemId", cartController.removeItem);
router.delete("/:cartId", cartController.clearCart);

module.exports = router;
