const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

exports.requestOrder = (req, res) => {
  try {
    ensureDataDir();
    const payload = req.body || {};
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
    const id =
      "ord_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const order = Object.assign({ _id: id, status: "requested" }, payload);
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    // In a real app you'd notify admins (email/webhook). Here we'll just return success.
    res.status(201).json({ ok: true, id: order._id });
  } catch (e) {
    console.error("Failed to save order request", e);
    res.status(500).json({ ok: false, error: "Failed to request order" });
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
