const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

// Generate a short human-friendly order ID: e.g. SH-4F6A3B
function generateOrderId() {
  // Use a short base36 timestamp slice + a small random suffix.
  // Format: SH-<3chars_ts><3chars_rand> => ~6 chars after prefix.
  const ts = Date.now().toString(36).slice(-3).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SH-${ts}${rnd}`;
}

exports.requestOrder = async (req, res) => {
  try {
    ensureDataDir();
    const payload = req.body || {};

    // Normalize items: ensure each item has a size object (label + optional id) when possible
    if (payload.items && Array.isArray(payload.items)) {
      payload.items = payload.items.map((it) => {
        const copy = Object.assign({}, it);
        // ensure we capture a human-friendly name snapshot for the item
        copy.itemName =
          copy.itemName ||
          copy.name ||
          copy.cakeName ||
          copy.productName ||
          (copy.cake && (copy.cake.cakeName || copy.cake.name)) ||
          (copy.accessory && (copy.accessory.name || copy.accessory.title)) ||
          copy.productType ||
          "Item";
        // keep legacy 'name' field populated for older UIs
        copy.name = copy.name || copy.itemName;
        // If item.size is an object (from older shape), extract the label.
        if (copy.size && typeof copy.size === "object") {
          copy.size = copy.size.size || String(copy.size._id || "");
        }
        // If sizeId exists but size is missing, set size to the label if available
        if ((!copy.size || copy.size === "") && copy.sizeId) {
          copy.size = String(copy.sizeId);
        }
        // Normalize toppings to an array of simple strings (names)
        if (copy.toppings && Array.isArray(copy.toppings)) {
          copy.toppings = copy.toppings.map((t) => {
            if (typeof t === "string") return t;
            if (!t) return String(t);
            return (
              t.name ||
              t.toppingName ||
              t.toppingId ||
              t.id ||
              (t.topping && (t.topping.name || String(t.topping))) ||
              String(t)
            );
          });
        } else {
          copy.toppings = [];
        }
        return copy;
      });
    }

    // Ensure a human-friendly orderId is present. Allow client to provide one
    // (for cases like resumed carts), otherwise generate it here.
    const orderId = payload.orderId || generateOrderId();
    let savedId = null;

    // If Mongoose model is available, try to persist to MongoDB
    if (OrderModel) {
      try {
        const doc = await OrderModel.create(
          Object.assign({ status: "requested", orderId }, payload)
        );
        savedId = String(doc._id);
      } catch (dbErr) {
        console.error(
          "Failed to save order to MongoDB, falling back to file:",
          dbErr
        );
        savedId = null;
      }
    }

    // Always keep a file-backed copy as fallback/backup
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
    const fileId =
      savedId ||
      "ord_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const order = Object.assign(
      { _id: fileId, status: "requested", orderId },
      payload
    );
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    // Prepare the order object to return/emit
    const savedOrder = Object.assign(
      { _id: savedId || fileId, orderId },
      order
    );

    // Emit real-time event if Socket.IO is available
    try {
      const io = req.app && req.app.locals && req.app.locals.io;
      if (io && typeof io.emit === "function") {
        io.emit("new_order", savedOrder);
      }
    } catch (emitErr) {
      console.error("Failed to emit new_order event:", emitErr);
    }

    // Return whichever id is authoritative (Mongo id if saved, else file id)
    return res
      .status(201)
      .json({ ok: true, id: savedId || fileId, orderId, order: savedOrder });
  } catch (e) {
    console.error("Failed to save order request", e);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to request order" });
  }
};

// Try to use Mongoose model if available
let OrderModel = null;
try {
  OrderModel = require("../models/Order");
} catch (e) {
  // ignore, fallback to file storage
}

// Admin: list orders (paginated simple)
exports.listOrders = async (req, res) => {
  if (OrderModel) {
    try {
      const page = Math.max(0, parseInt(req.query.page) || 0);
      const limit = Math.max(1, parseInt(req.query.limit) || 50);
      const docs = await OrderModel.find()
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean();
      return res.json({ ok: true, items: docs });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // fallback to file-based listing
  try {
    ensureDataDir();
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
    return res.json({ ok: true, items: orders.reverse() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// Admin: get single order
exports.getOrder = async (req, res) => {
  const { id } = req.params;
  if (OrderModel) {
    try {
      const doc = await OrderModel.findById(id).lean();
      if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
      return res.json({ ok: true, item: doc });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  try {
    ensureDataDir();
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
    const order = orders.find((o) => String(o._id) === String(id));
    if (!order) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, item: order });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// Admin: update order
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  if (OrderModel) {
    try {
      const doc = await OrderModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();
      if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
      return res.json({ ok: true, item: doc });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  try {
    ensureDataDir();
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
    const idx = orders.findIndex((o) => String(o._id) === String(id));
    if (idx === -1)
      return res.status(404).json({ ok: false, error: "Not found" });
    orders[idx] = { ...orders[idx], ...updates };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return res.json({ ok: true, item: orders[idx] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
