import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/Sweet_Heaven/" : "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Change port if your backend runs elsewhere
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  define: {
    __API_URL__: JSON.stringify(
      process.env.NODE_ENV === "production"
        ? "https://sweetheaven-production.up.railway.app"
        : ""
    ),
  },
});
