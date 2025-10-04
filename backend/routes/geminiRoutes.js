// geminiRoutes.js
// Routes for Gemini AI image generation

const express = require("express");
const {
  generateCakeImageController,
} = require("../controllers/geminiController");

const router = express.Router();

// POST /api/gemini/generate-cake-image
// Generate AI cake image based on user selections
router.post("/generate-cake-image", generateCakeImageController);

module.exports = router;
