// server.js
// Main entry point for Sweet Heaven backend

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Debug: log incoming socket.io HTTP requests (polling handshake) for troubleshooting
app.use((req, res, next) => {
  try {
    if (req.url && req.url.startsWith("/socket.io/")) {
      console.log("[socket.io request]", req.method, req.url, {
        origin: req.headers.origin,
        referer: req.headers.referer,
      });
    }
  } catch (e) {
    // ignore logging errors
  }
  next();
});

// Create HTTP server and attach Socket.IO
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" },
});
// Expose io to routes/controllers via app.locals
app.locals.io = io;
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// Simple Socket.IO auth middleware using JWT (admin token expected in socket.handshake.auth.token)
const jwt = require("jsonwebtoken");
io.use((socket, next) => {
  const token = socket.handshake?.auth?.token;
  if (!token) return next(); // allow anonymous sockets for now (non-admin)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch (err) {
    console.warn("Socket auth failed:", err.message || err);
    // don't block the socket entirely — simply continue as unauthenticated
    return next();
  }
});

// Log engine-level connection errors
try {
  if (io.engine && typeof io.engine.on === "function") {
    io.engine.on("connection_error", (err) => {
      console.warn(
        "engine connection_error:",
        err && err.message ? err.message : err
      );
    });
  }
} catch (e) {
  console.warn("Failed to attach engine error logger", e);
}

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes

const toppingRoutes = require("./routes/toppingRoutes");
const cakeRoutes = require("./routes/cakeRoutes");
const accessoryRoutes = require("./routes/accessoryRoutes");
const otherProductRoutes = require("./routes/otherProductRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

app.use("/api/cakes", cakeRoutes);
app.use("/api/toppings", toppingRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/other-products", otherProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/gemini", geminiRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Sweet Heaven API!");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
