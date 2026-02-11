import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  build: {
    minify: false,
  },
  plugins: [
    // import("vite-plugin-inspect").then(m => m.default()),
    tailwindcss(),
    react(),
    rsc({
      entries: {
        client: "./react-router-vite/entry.browser.tsx",
        ssr: "./react-router-vite/entry.ssr.tsx",
        rsc: "./react-router-vite/entry.rsc.single.tsx",
      },
    }),
  ],
  preview: {
    // Allow connections from iOS simulator and local network devices
    host: true,
    port: 3000,
    // Allow requests from reverse proxy with different origin
    allowedHosts: ["*"],
  },
  server: {
    // Allow connections from iOS simulator and local network devices
    host: true,
    port: 3000,
    // Serve static files from data directory
    fs: {
      allow: ["..", "./data"],
    },
    // Allow requests from reverse proxy with different origin
    allowedHosts: ["*"],
  },
  optimizeDeps: {
    include: ["react-router", "react-router/internal/react-server-client"],
  },
}) as any;
