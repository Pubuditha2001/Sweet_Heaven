// geminiService.js
// Service for handling Gemini AI API calls and prompt engineering

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a detailed prompt for cake image generation
 */
function buildCakePrompt({
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
  style = "realistic",
}) {
  let prompt = `Create a ${style} photograph of a beautiful `;

  // Size description
  const sizeDescriptions = {
    small: "small, delicate",
    medium: "medium-sized",
    large: "large, impressive",
  };
  prompt += `${sizeDescriptions[size] || "medium-sized"} `;

  // Shape description
  const shapeDescriptions = {
    circle: "round",
    oval: "oval-shaped",
    square: "square",
    rectangle: "rectangular",
    hexagon: "hexagonal",
    heart: "heart-shaped",
  };
  prompt += `${shapeDescriptions[shape] || "round"} cake `;

  // Color descriptions
  prompt += `with ${getColorDescription(baseColor)} base cake `;

  if (topIcingColor && topIcingColor !== baseColor) {
    prompt += `topped with ${getColorDescription(topIcingColor)} frosting `;
  }

  if (
    sideIcingColor &&
    sideIcingColor !== topIcingColor &&
    sideIcingColor !== baseColor
  ) {
    prompt += `and ${getColorDescription(sideIcingColor)} side decorations `;
  }

  // Add flavor context if provided
  if (flavor) {
    const flavorDescriptions = {
      vanilla: "vanilla sponge with classic vanilla frosting",
      chocolate: "rich chocolate layers with chocolate ganache",
      strawberry: "pink strawberry cake with berry frosting",
      red_velvet: "red velvet cake with cream cheese frosting",
      lemon: "light lemon cake with citrus buttercream",
      carrot: "moist carrot cake with cream cheese frosting",
    };
    if (flavorDescriptions[flavor]) {
      prompt += `featuring ${flavorDescriptions[flavor]} `;
    }
  }

  // Add decorations
  if (decorations && decorations.length > 0) {
    const decorationMap = {
      flowers: "delicate buttercream flowers",
      pearls: "elegant edible pearls",
      sprinkles: "colorful sprinkles",
      chocolate_drip: "glossy chocolate drip decoration",
      fresh_berries: "fresh strawberries and berries",
      gold_accents: "luxurious gold leaf accents",
      piped_borders: "intricate piped borders",
    };

    const decorationList = decorations
      .map((d) => decorationMap[d] || d)
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 decorations to avoid overwhelming prompt

    if (decorationList.length > 0) {
      prompt += `decorated with ${decorationList.join(", ")} `;
    }
  }

  // Add theme context
  if (theme) {
    const themeDescriptions = {
      elegant: "in an elegant, sophisticated style",
      fun: "with playful, fun design elements",
      minimalist: "with clean, minimalist design",
      vintage: "with vintage, classic styling",
      modern: "with contemporary, modern aesthetics",
      rustic: "with rustic, homemade charm",
    };
    if (themeDescriptions[theme]) {
      prompt += `${themeDescriptions[theme]} `;
    }
  }

  // Add occasion context
  if (occasion) {
    const occasionContexts = {
      birthday: "perfect for a birthday celebration",
      wedding: "elegant enough for a wedding",
      anniversary: "romantic anniversary cake",
      graduation: "celebratory graduation cake",
      baby_shower: "sweet baby shower cake",
      general: "perfect for any special occasion",
    };
    if (occasionContexts[occasion]) {
      prompt += `${occasionContexts[occasion]} `;
    }
  }

  // Add custom text if provided
  if (customText && customText.trim().length > 0) {
    prompt += `with "${customText.trim()}" written on it `;
  }

  // Environmental and presentation details
  prompt += `placed on a clean white ceramic cake stand against a soft, neutral background with professional lighting. `;
  prompt += `The image should be high quality, well-lit, and showcase the cake's details clearly. `;
  prompt += `Studio photography style with soft shadows and appetizing presentation.`;

  // Style-specific additions
  if (style === "realistic") {
    prompt += ` Photorealistic, professional bakery quality, highly detailed.`;
  } else if (style === "artistic") {
    prompt += ` Artistic interpretation with beautiful lighting and composition.`;
  }

  return prompt;
}

/**
 * Convert hex color to descriptive text
 */
function getColorDescription(hexColor) {
  if (!hexColor) return "white";

  const colorMap = {
    "#ffffff": "pristine white",
    "#f5d0e6": "soft pink",
    "#ffc0cb": "light pink",
    "#ffb3ba": "strawberry pink",
    "#7b3f00": "rich chocolate brown",
    "#c7f9cc": "mint green",
    "#bae6fd": "sky blue",
    "#fff8dc": "creamy vanilla",
    "#add8e6": "light blue",
    "#ffffe0": "pale yellow",
    "#98fb98": "soft green",
    "#dda0dd": "lavender purple",
  };

  // Return mapped color or attempt to describe based on hex
  if (colorMap[hexColor.toLowerCase()]) {
    return colorMap[hexColor.toLowerCase()];
  }

  // Basic color detection for unmapped colors
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  if (r > 200 && g > 200 && b > 200) return "light cream";
  if (r > 150 && g < 100 && b < 100) return "warm red";
  if (r < 100 && g > 150 && b < 100) return "fresh green";
  if (r < 100 && g < 100 && b > 150) return "deep blue";
  if (r > 150 && g > 100 && b < 100) return "coral orange";
  if (r > 100 && g < 100 && b > 150) return "purple";

  return "colorful";
}

/**
 * Generate cake image using Gemini AI
 */
async function generateCakeImage(cakeData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    // For now, Gemini primarily works with text generation
    // We'll use Gemini to create an enhanced prompt and then
    // either use it with an image generation API or return structured data

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildCakePrompt(cakeData);

    console.log("Generated cake prompt:", prompt);

    // Note: Gemini doesn't directly generate images yet in the same way as DALL-E
    // This is a placeholder for when image generation becomes available
    // or when integrating with another image generation service

    const result = await model.generateContent([
      `Based on this cake description, create a detailed prompt that could be used with an image generation AI: ${prompt}. 
      Enhance it with professional photography terms and specific visual details that would help create a stunning, realistic cake image.
      Keep the response focused and under 200 words.`,
    ]);

    const enhancedPrompt = result.response.text();

    // TODO: Integrate with actual image generation service (DALL-E, Midjourney, etc.)
    // For now, return the enhanced prompt
    return {
      enhancedPrompt,
      originalPrompt: prompt,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate cake image: ${error.message}`);
  }
}

module.exports = {
  generateCakeImage,
  buildCakePrompt,
};
