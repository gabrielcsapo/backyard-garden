import { Hono } from "hono";
import { cors } from "hono/cors";
import { settingsRoutes } from "./routes/settings.ts";
import { yardsRoutes } from "./routes/yards.ts";
import { elementsRoutes } from "./routes/elements.ts";
import { plantsRoutes } from "./routes/plants.ts";
import { plantingsRoutes } from "./routes/plantings.ts";
import { logEntriesRoutes } from "./routes/log-entries.ts";
import { seedsRoutes } from "./routes/seeds.ts";
import { tasksRoutes } from "./routes/tasks.ts";
import { pestsRoutes } from "./routes/pests.ts";
import { soilRoutes } from "./routes/soil.ts";
import { weatherRoutes } from "./routes/weather.ts";
import { syncRoutes } from "./routes/sync.ts";
import { photosRoutes } from "./routes/photos.ts";

export const app = new Hono();

// CORS for iOS app access
app.use("*", cors());

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Mount routes
app.route("/api", settingsRoutes);
app.route("/api", yardsRoutes);
app.route("/api", elementsRoutes);
app.route("/api", plantsRoutes);
app.route("/api", plantingsRoutes);
app.route("/api", logEntriesRoutes);
app.route("/api", seedsRoutes);
app.route("/api", tasksRoutes);
app.route("/api", pestsRoutes);
app.route("/api", soilRoutes);
app.route("/api", weatherRoutes);
app.route("/api", syncRoutes);
app.route("/api", photosRoutes);
