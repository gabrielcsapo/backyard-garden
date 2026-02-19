import { Hono } from "hono";
import { getAllPlants, getPlantById } from "../../db/queries.ts";

export const plantsRoutes = new Hono();

plantsRoutes.get("/plants", async (c) => {
  const plants = await getAllPlants();
  return c.json(plants);
});

plantsRoutes.get("/plants/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const plant = await getPlantById(id);
  if (!plant) return c.json({ error: "Not found" }, 404);
  return c.json(plant);
});
