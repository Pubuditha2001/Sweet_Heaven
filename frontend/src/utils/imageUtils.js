// Utility function to normalize image URLs
export function normalizeImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return "";

  const trimmed = imageUrl.trim();

  // If it's a data URL (base64), return as-is
  if (trimmed.startsWith("data:")) return trimmed;

  // If it's already a full URL, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Clean the path by removing ./ prefix
  let cleanPath = trimmed.replace(/^\.\//, "");

  // Ensure path starts with /
  if (!cleanPath.startsWith("/")) {
    cleanPath = "/" + cleanPath;
  }

  // Use Vite's BASE_URL (which should be '/Sweet_Heaven/' in production)
  const base = import.meta.env.BASE_URL || "/";

  // If base is not just "/", prepend it
  if (base !== "/" && !cleanPath.startsWith(base)) {
    // Remove leading slash from cleanPath since base already has trailing slash
    cleanPath = cleanPath.substring(1);
    return base + cleanPath;
  }

  return cleanPath;
}

// Function to get the fallback image for accessories
export function getAccessoryFallback() {
  return normalizeImageUrl("accessoryFallback.png");
}

// Function to get the fallback image for toppings
export function getToppingFallback() {
  return normalizeImageUrl("fallback.jpg");
}

// Function to handle image error (set fallback)
export function handleImageError(e) {
  e.target.src = getAccessoryFallback();
}

// Function to handle topping image error (set topping fallback)
export function handleToppingImageError(e) {
  e.target.src = getToppingFallback();
}
