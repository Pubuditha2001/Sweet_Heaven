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
    // Populate cart items with latest cake/topping/price data
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const resolvedItemId = item.itemId;
        let details = null;
        if (item.productType === "cake") {
          const Cake = require("../models/Cake");
          details = resolvedItemId
            ? await Cake.findById(resolvedItemId).lean()
            : null;
        } else if (item.productType === "accessory") {
          const Accessory = require("../models/Accessory");
          details = resolvedItemId
            ? await Accessory.findById(resolvedItemId).lean()
            : null;
        }
        // normalize toppings for response: array of toppingId strings
        const toppings = Array.isArray(item.toppings)
          ? item.toppings.map((t) => String(t.toppingId || t))
          : undefined;

        return {
          _id: item._id,
          productType: item.productType,
          itemId: item.itemId,
          sizeId: item.sizeId,
          toppings,
          qty: item.qty,
          details,
          addedAt: item.addedAt,
        };
      })
    );
    res.json({ cartId: cart.cartId, items: populatedItems });
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
    if (!item || !item.productType || !item.itemId)
      return res.status(400).json({ error: "productType and itemId required" });

    let cart = await Cart.findOne({ cartId });
    if (!cart) {
      try {
        cart = await Cart.create({ cartId, items: [] });
      } catch (err) {
        if (err.code === 11000) {
          cart = await Cart.findOne({ cartId });
        } else {
          throw err;
        }
      }
    }

    // Check if same item exists, then increase qty
    // Use unified itemId (frontend should supply this)
    const incomingItemId = item.itemId;
    const incomingSizeId = item.sizeId || undefined;
    // incoming toppings may be array of ids; normalize to array of strings
    const incomingToppings = Array.isArray(item.toppings)
      ? item.toppings.map((t) => String(t))
      : undefined;

    // helper to compare toppings arrays (order-insensitive)
    function toppingsEqual(a, b) {
      if (!a && !b) return true;
      if ((!a && b) || (a && !b)) return false;
      if (a.length !== b.length) return false;
      const sa = [...a].map(String).sort();
      const sb = [...b].map(String).sort();
      return sa.every((val, idx) => val === sb[idx]);
    }

    const idx = cart.items.findIndex((i) => {
      if (i.productType !== item.productType) return false;
      if (String(i.itemId) !== String(incomingItemId)) return false;
      // for cakes, also match sizeId and toppings
      if (item.productType === "cake") {
        const existingSizeId = i.sizeId ? String(i.sizeId) : undefined;
        if ((existingSizeId || undefined) !== (incomingSizeId || undefined))
          return false;
        const existingToppings = Array.isArray(i.toppings)
          ? i.toppings.map((t) => String(t.toppingId || t))
          : undefined;
        if (!toppingsEqual(existingToppings, incomingToppings)) return false;
      }
      return true;
    });

    if (idx > -1) {
      cart.items[idx].qty = (cart.items[idx].qty || 0) + (item.qty || 1);
      cart.items[idx].addedAt = new Date();
    } else {
      const toppingsToStore = incomingToppings
        ? incomingToppings.map((t) => ({ toppingId: t }))
        : undefined;
      cart.items.push({
        productType: item.productType,
        // persist only unified itemId
        itemId: incomingItemId,
        sizeId: incomingSizeId,
        toppings: toppingsToStore,
        qty: item.qty || 1,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return await getCart(req, res);
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

    const idx = cart.items.findIndex((i) => i._id.toString() === itemId);
    if (idx === -1) return res.status(404).json({ error: "item not found" });
    if (typeof qty === "number") cart.items[idx].qty = Math.max(1, qty);
    await cart.save();
    // Return populated cart
    return await getCart(req, res);
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
    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    // Return populated cart
    return await getCart(req, res);
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
    // Return populated cart
    return await getCart(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
