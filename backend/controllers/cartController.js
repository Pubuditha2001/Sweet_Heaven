const Cart = require("../models/Cart");

// Get cart by cartId (create if not exists)
async function getCart(req, res) {
  try {
    const { cartId } = req.params;
    if (!cartId) return res.status(400).json({ error: "cartId required" });
    let cart = await Cart.findOne({ cartId });
    if (!cart) {
      cart = new Cart({ cartId, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add or merge item into cart
async function addItem(req, res) {
  try {
    const { cartId } = req.params;
    const item = req.body;
    if (!cartId) return res.status(400).json({ error: "cartId required" });
    if (!item || !item.id)
      return res.status(400).json({ error: "item with id required" });

    let cart = await Cart.findOne({ cartId });
    if (!cart) {
      cart = new Cart({ cartId, items: [] });
    }

    // Normalize incoming item to always include productCategory
    const normalized = {
      ...item,
      productCategory: item.productCategory || "cake",
    };

    // If the incoming item contains accessories inline, split them into separate accessory items
    if (
      item.accessories &&
      Array.isArray(item.accessories) &&
      item.accessories.length > 0 &&
      !String(item.id).startsWith("accessory:")
    ) {
      // push/update the parent item but do NOT persist accessories inside it
      const cakeItem = { ...normalized };
      // ensure accessories are not stored inline
      delete cakeItem.accessories;
      const cakeIdx = cart.items.findIndex((i) => i.id === cakeItem.id);
      if (cakeIdx > -1) {
        cart.items[cakeIdx].qty =
          (cart.items[cakeIdx].qty || 0) + (cakeItem.qty || 1);
        cart.items[cakeIdx].addedAt = new Date();
      } else {
        cart.items.push(cakeItem);
      }

      // for each accessory, add as its own cart item (id prefix 'accessory:')
      for (const a of item.accessories) {
        const aid = (a.id || a._id || a.name).toString();
        const accId = `accessory:${aid}`;
        const accItem = {
          id: accId,
          productId: aid,
          name: a.name || aid,
          qty: item.qty || 1,
          unitPrice: a.price || 0,
          toppings: [],
          // mark category explicitly so frontend/lookup knows where to fetch
          productCategory: "accessory",
          addedAt: new Date(),
        };
        const existingAccIdx = cart.items.findIndex((i) => i.id === accId);
        if (existingAccIdx > -1) {
          cart.items[existingAccIdx].qty =
            (cart.items[existingAccIdx].qty || 0) + (accItem.qty || 1);
          cart.items[existingAccIdx].addedAt = new Date();
        } else {
          cart.items.push(accItem);
        }
      }
    } else {
      const idx = cart.items.findIndex((i) => i.id === normalized.id);
      if (idx > -1) {
        cart.items[idx].qty =
          (cart.items[idx].qty || 0) + (normalized.qty || 1);
        cart.items[idx].addedAt = new Date();
      } else {
        cart.items.push(normalized);
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update item qty or replace
async function updateItem(req, res) {
  try {
    const { cartId, itemId } = req.params;
    const { qty } = req.body;
    if (!cartId) return res.status(400).json({ error: "cartId required" });

    const cart = await Cart.findOne({ cartId });
    if (!cart) return res.status(404).json({ error: "cart not found" });

    const idx = cart.items.findIndex((i) => i.id === itemId);
    if (idx === -1) return res.status(404).json({ error: "item not found" });
    if (typeof qty === "number") cart.items[idx].qty = Math.max(1, qty);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Remove item
async function removeItem(req, res) {
  try {
    const { cartId, itemId } = req.params;
    if (!cartId) return res.status(400).json({ error: "cartId required" });
    const cart = await Cart.findOne({ cartId });
    if (!cart) return res.status(404).json({ error: "cart not found" });
    cart.items = cart.items.filter((i) => i.id !== itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Clear cart
async function clearCart(req, res) {
  try {
    const { cartId } = req.params;
    if (!cartId) return res.status(400).json({ error: "cartId required" });
    const cart = await Cart.findOne({ cartId });
    if (!cart) return res.status(404).json({ error: "cart not found" });
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
