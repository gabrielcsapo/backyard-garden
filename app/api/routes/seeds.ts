import { Hono } from "hono";
import {
  getAllSeeds,
  addSeed,
  updateSeed,
  deleteSeed,
} from "../../db/queries.ts";

export const seedsRoutes = new Hono();

seedsRoutes.get("/seed-inventory", async (c) => {
  const seeds = await getAllSeeds();
  return c.json(seeds);
});

seedsRoutes.post("/seed-inventory", async (c) => {
  const body = await c.req.json();
  await addSeed(body);
  return c.json({ success: true }, 201);
});

seedsRoutes.put("/seed-inventory/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await updateSeed(id, body);
  return c.json({ success: true });
});

seedsRoutes.delete("/seed-inventory/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteSeed(id);
  return c.json({ success: true });
});
