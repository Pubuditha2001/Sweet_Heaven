// Utility function to normalize image URLs
export function normalizeImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return "";

  const trimmed = imageUrl.trim();

  // If it's a data URL (base64), return as-is
  if (trimmed.startsWith("data:")) return trimmed;

  // If it's already a full URL, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // If it starts with ./, convert to absolute path
  if (trimmed.startsWith("./")) return trimmed.replace(/^\.\//, "/");

  // If it already starts with /, return as-is
  if (trimmed.startsWith("/")) return trimmed;

  // Otherwise, assume it's a relative path and make it absolute
  return "/" + trimmed;
}

// Function to get the fallback image for accessories
export function getAccessoryFallback() {
  return "/accessoryFallback.png";
}

// Function to get the fallback image for toppings
export function getToppingFallback() {
  return "/fallback.jpg";
}

// Function to handle image error (set fallback)
export function handleImageError(e) {
  e.target.src = getAccessoryFallback();
}

// Function to handle topping image error (set topping fallback)
export function handleToppingImageError(e) {
  e.target.src = getToppingFallback();
}
