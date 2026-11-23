import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/auth": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "/"),
      },
      "/api/events": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "/"),
      },
      "/api/orders": {
        target: "http://127.0.0.1:3003",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "/"),
      },
      "/api/tickets": {
        target: "http://127.0.0.1:3004",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "/"),
      },
      "/api/checkin": {
        target: "http://127.0.0.1:3006",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "/"),
      },
    },
  },
});
