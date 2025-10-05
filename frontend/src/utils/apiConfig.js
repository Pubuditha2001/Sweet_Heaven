// API Configuration for Sweet Heaven Frontend

const getApiBaseUrl = () => {
  // In production (GitHub Pages), use the Railway backend URL from environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In development, use localhost or environment variable
  return import.meta.env.VITE_DEV_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Socket.IO configuration
export const getSocketUrl = () => {
  return API_BASE_URL;
};

export default API_BASE_URL;
