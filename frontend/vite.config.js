import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/Sweet_Heaven/", // This should match your GitHub repository name
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
});
