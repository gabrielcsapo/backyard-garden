import http from "node:http";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

// Proxy /api requests in preview mode (Vite's built-in proxy only works in dev)
function apiProxyPlugin(): Plugin {
  const API_TARGET = "http://localhost:3001";
  return {
    name: "api-proxy-preview",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();
        const url = new URL(req.url, API_TARGET);
        const proxyReq = http.request(
          url,
          { method: req.method, headers: { ...req.headers, host: url.host } },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
            proxyRes.pipe(res);
          },
        );
        proxyReq.on("error", () => {
          res.writeHead(502);
          res.end("API server unavailable");
        });
        req.pipe(proxyReq);
      });
    },
  };
}

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
    apiProxyPlugin(),
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
    // Proxy API requests to Hono server so iOS can point to one URL
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["react-router", "react-router/internal/react-server-client"],
  },
}) as any;
