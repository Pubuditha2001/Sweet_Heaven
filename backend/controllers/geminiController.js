// geminiController.js
// Controller for handling Gemini AI image generation requests

const geminiImageService = require("../utils/geminiImageService");
const cloudinary = require("../utils/cloudinary");

const generateCakeImageController = async (req, res) => {
  try {
    // Handle both direct prompt and structured cake data formats
    if (req.body.prompt) {
      // Direct prompt from test script
      const { prompt } = req.body;

      console.log("🎂 Received direct prompt for Gemini 2.0 generation...");
      console.log("Prompt:", prompt);

      // Generate image directly with the provided prompt
      const imageResult = await geminiImageService.generateCakeImageFromPrompt(
        prompt
      );

      let imageUrl = null;
      let cloudinaryId = null;

      if (imageResult.imageData && imageResult.mimeType) {
        console.log(
          "✅ Image generated successfully, uploading to Cloudinary..."
        );

        const dataUrl = `data:${imageResult.mimeType};base64,${imageResult.imageData}`;

        const uploadResult = await cloudinary.uploader.upload(dataUrl, {
          folder: "sweet-heaven/ai-generated-cakes",
          public_id: `gemini_cake_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "fill", quality: "auto:good" },
          ],
        });

        imageUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
        console.log("🚀 Upload complete! Image URL:", imageUrl);
      }

      return res.json({
        success: true,
        data: {
          imageUrl,
          prompt: imageResult.prompt || prompt,
          service: imageResult.service,
          mimeType: imageResult.mimeType,
          generatedAt: imageResult.timestamp,
          cloudinaryId,
          demoMode: imageResult.demoMode || false,
          cost: 0,
          note: imageResult.note || "Direct prompt processing",
        },
      });
    }

    // Handle structured cake data (from frontend)
    let cakeData = req.body.cakeData || req.body;

    const {
      size,
      shape,
      baseColor,
      topIcingColor,
      sideIcingColor,
      flavor,
      decorations,
      theme,
      occasion,
      customText,
      style = "artistic digital painting",
    } = cakeData;

    // Validate required fields for structured data
    if (!size || !shape || !baseColor) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: size, shape, and baseColor are required",
      });
    }

    // Rate limiting check (simple implementation)
    const userIP = req.ip || req.connection.remoteAddress;
    // TODO: Implement proper rate limiting with Redis or memory store

    console.log("🎂 Starting Gemini 2.0 cake image generation...");
    console.log("Cake data:", {
      size,
      shape,
      baseColor,
      topIcingColor,
      sideIcingColor,
    });

    // Generate actual cake image using Gemini 2.0 image generation
    const imageResult = await geminiImageService.generateCakeImage({
      size,
      shape,
      baseColor,
      topIcingColor,
      sideIcingColor,
      flavor,
      decorations,
      theme,
      occasion,
      customText,
      style,
    });

    let imageUrl = null;
    let cloudinaryId = null;

    if (imageResult.imageData && imageResult.mimeType) {
      console.log(
        "✅ Image generated successfully, uploading to Cloudinary..."
      );

      // Upload generated image to Cloudinary
      const dataUrl = `data:${imageResult.mimeType};base64,${imageResult.imageData}`;

      const uploadResult = await cloudinary.uploader.upload(dataUrl, {
        folder: "sweet-heaven/ai-generated-cakes",
        public_id: `gemini_cake_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "fill", quality: "auto:good" },
        ],
      });

      imageUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;
      console.log("🚀 Upload complete! Image URL:", imageUrl);
    } else {
      console.log("📝 Demo mode - prompt generated successfully");
    }

    res.json({
      success: true,
      data: {
        imageUrl,
        prompt: imageResult.prompt,
        service: imageResult.service,
        mimeType: imageResult.mimeType,
        generatedAt: imageResult.timestamp,
        cloudinaryId,
        demoMode: imageResult.demoMode || false,
        parameters: {
          size,
          shape,
          baseColor,
          topIcingColor,
          sideIcingColor,
          flavor,
          decorations,
          theme,
          occasion,
          style,
        },
        cost: 0, // FREE with Gemini 2.0!
        note:
          imageResult.note ||
          "Gemini 2.0 integration ready - image generation pending safety filter resolution",
      },
    });
  } catch (error) {
    console.error("Gemini generation error:", error);

    // Don't expose internal error details to client
    res.status(500).json({
      success: false,
      message: "Failed to generate cake image. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  generateCakeImageController,
};
