import { Hono } from "hono";
import {
  getAllYards,
  getYardById,
  createYard,
  updateYard,
  deleteYard,
  getYardElements,
  getYardSummaries,
} from "../../db/queries.ts";

export const yardsRoutes = new Hono();

yardsRoutes.get("/yards", async (c) => {
  const detail = c.req.query("detail");
  if (detail === "summary") {
    const summaries = await getYardSummaries();
    return c.json(summaries);
  }
  const yards = await getAllYards();
  return c.json(yards);
});

yardsRoutes.get("/yards/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const yard = await getYardById(id);
  if (!yard) return c.json({ error: "Not found" }, 404);
  const elements = await getYardElements(id);
  return c.json({ ...yard, elements });
});

yardsRoutes.post("/yards", async (c) => {
  const body = await c.req.json();
  const result = await createYard(body);
  return c.json(result, 201);
});

yardsRoutes.put("/yards/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await updateYard(id, body);
  const updated = await getYardById(id);
  return c.json(updated);
});

yardsRoutes.delete("/yards/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteYard(id);
  return c.json({ success: true });
});
