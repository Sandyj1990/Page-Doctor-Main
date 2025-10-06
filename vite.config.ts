import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Lovable tagger removed per user request

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      port: 3000,
      overlay: false,
    },
  },
  // Prevent Node.js modules from being bundled for browser
  optimizeDeps: {
    exclude: ['child_process', 'fs', 'path', 'os', 'crawlee', 'puppeteer', 'async_hooks']
  },
  build: {
    rollupOptions: {
      external: ['child_process', 'fs', 'path', 'os', 'crawlee', 'puppeteer', 'async_hooks']
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
