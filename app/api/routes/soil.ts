import { Hono } from "hono";
import {
  getAllSoilProfiles,
  addSoilProfile,
  deleteSoilProfile,
  getBedOptions,
} from "../../db/queries.ts";

export const soilRoutes = new Hono();

soilRoutes.get("/soil-profiles", async (c) => {
  const profiles = await getAllSoilProfiles();
  return c.json(profiles);
});

soilRoutes.post("/soil-profiles", async (c) => {
  const body = await c.req.json();
  await addSoilProfile(body);
  return c.json({ success: true }, 201);
});

soilRoutes.delete("/soil-profiles/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteSoilProfile(id);
  return c.json({ success: true });
});

soilRoutes.get("/beds", async (c) => {
  const beds = await getBedOptions();
  return c.json(beds);
});
