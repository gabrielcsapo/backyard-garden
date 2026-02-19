import { Hono } from "hono";
import {
  getYardElements,
  getYardElementById,
  createYardElement,
  updateYardElement,
  deleteYardElement,
  duplicateYardElement,
} from "../../db/queries.ts";

export const elementsRoutes = new Hono();

elementsRoutes.get("/yards/:yardId/elements", async (c) => {
  const yardId = Number(c.req.param("yardId"));
  const elements = await getYardElements(yardId);
  return c.json(elements);
});

elementsRoutes.post("/yards/:yardId/elements", async (c) => {
  const yardId = Number(c.req.param("yardId"));
  const body = await c.req.json();
  await createYardElement({ ...body, yardId });
  return c.json({ success: true }, 201);
});

elementsRoutes.put("/elements/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await updateYardElement(id, body);
  const updated = await getYardElementById(id);
  return c.json(updated);
});

elementsRoutes.delete("/elements/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteYardElement(id);
  return c.json({ success: true });
});

elementsRoutes.post("/elements/:id/duplicate", async (c) => {
  const id = Number(c.req.param("id"));
  const yardId = Number(c.req.query("yardId") ?? "0");
  const result = await duplicateYardElement(id, yardId);
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result, 201);
});
