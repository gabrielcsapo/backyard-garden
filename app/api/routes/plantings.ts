import { Hono } from "hono";
import {
  getAllPlantings,
  getPlantingById,
  getActivePlantingsWithDetails,
  createPlanting,
  updatePlanting,
  deletePlanting,
} from "../../db/queries.ts";

export const plantingsRoutes = new Hono();

plantingsRoutes.get("/plantings", async (c) => {
  const detail = c.req.query("detail");
  if (detail === "active") {
    const active = await getActivePlantingsWithDetails();
    return c.json(active);
  }
  const plantings = await getAllPlantings();
  return c.json(plantings);
});

plantingsRoutes.get("/plantings/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const planting = await getPlantingById(id);
  if (!planting) return c.json({ error: "Not found" }, 404);
  return c.json(planting);
});

plantingsRoutes.post("/plantings", async (c) => {
  const body = await c.req.json();
  await createPlanting(body);
  return c.json({ success: true }, 201);
});

plantingsRoutes.patch("/plantings/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await updatePlanting(id, body);
  const updated = await getPlantingById(id);
  return c.json(updated);
});

plantingsRoutes.delete("/plantings/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deletePlanting(id);
  return c.json({ success: true });
});
