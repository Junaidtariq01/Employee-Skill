import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: "../",
  server: {
    proxy: {
      "/api": {
        target: "https://buildify-w2h8.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
