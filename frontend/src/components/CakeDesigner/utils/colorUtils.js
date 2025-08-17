/**
 * Brightens a hex color by a given factor
 * @param {string} color - Hex color (e.g., "#ffffff")
 * @param {number} factor - Brightness factor (1.0 = no change, 1.5 = 50% brighter)
 * @returns {string} - Brightened hex color
 */
export function brightenColor(color, factor = 1.3) {
  // Remove # if present
  const hex = color.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Apply brightness factor and clamp to 255
  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));

  // Convert back to hex
  const toHex = (n) => n.toString(16).padStart(2, "0");

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Adjusts color for better visibility in 3D environment
 * @param {string} color - Original hex color
 * @returns {string} - Adjusted color
 */
export function adjustColorFor3D(color) {
  // For very light colors (like white), increase brightness significantly
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.8) {
    // Very light colors - brighten significantly
    return brightenColor(color, 1.5);
  } else if (luminance > 0.5) {
    // Medium light colors - moderate brightening
    return brightenColor(color, 1.3);
  } else {
    // Dark colors - slight brightening
    return brightenColor(color, 1.2);
  }
}
