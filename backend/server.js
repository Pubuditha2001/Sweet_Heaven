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

app.use("/api/cakes", cakeRoutes);
app.use("/api/toppings", toppingRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/other-products", otherProductRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Sweet Heaven API!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
