import { createApiUrl } from "../utils/apiConfig.js";
// gemini.js
// Frontend API client for Gemini AI image generation

// Use the centralized API configuration
const API_BASE = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL
  : import.meta.env.VITE_DEV_API_URL;

/**
 * Generate AI cake image based on cake designer selections
 */
export const generateCakeImage = async (cakeData) => {
  try {
    const response = await fetch(`${API_BASE}/gemini/generate-cake-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cakeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to generate cake image:", error);
    throw error;
  }
};

/**
 * Transform cake designer data to API format
 */
export const transformCakeDataForAPI = (
  cakeData,
  additionalSelections = {}
) => {
  return {
    size: cakeData.size,
    shape: cakeData.shape,
    baseColor: cakeData.baseColor,
    topIcingColor: cakeData.topIcingColor,
    sideIcingColor: cakeData.sideIcingColor,
    dimensions: cakeData.dimensions,

    // Additional selections from Controls component
    flavor: additionalSelections.flavor || "vanilla",
    decorations: additionalSelections.decorations || [],
    theme: additionalSelections.theme || "elegant",
    occasion: additionalSelections.occasion || "general",
    customText: additionalSelections.customText || "",
    style: additionalSelections.style || "home made",
  };
};
