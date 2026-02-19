import { Hono } from "hono";
import { getAllSettings, updateSettings } from "../../db/queries.ts";

export const settingsRoutes = new Hono();

settingsRoutes.get("/settings", async (c) => {
  const settings = await getAllSettings();
  return c.json(settings);
});

settingsRoutes.post("/settings", async (c) => {
  const body = await c.req.json();
  await updateSettings(body);
  const updated = await getAllSettings();
  return c.json(updated);
});
