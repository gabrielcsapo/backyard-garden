import { Hono } from "hono";
import { getAllPests, getPestById } from "../../db/queries.ts";

export const pestsRoutes = new Hono();

pestsRoutes.get("/pests", async (c) => {
  const pests = await getAllPests();
  return c.json(pests);
});

pestsRoutes.get("/pests/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const pest = await getPestById(id);
  if (!pest) return c.json({ error: "Not found" }, 404);
  return c.json(pest);
});
