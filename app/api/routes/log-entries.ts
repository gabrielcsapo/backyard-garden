import { Hono } from "hono";
import {
  getAllLogEntries,
  createLogEntry,
  deleteLogEntry,
} from "../../db/queries.ts";

export const logEntriesRoutes = new Hono();

logEntriesRoutes.get("/log-entries", async (c) => {
  const entries = await getAllLogEntries();
  return c.json(entries);
});

logEntriesRoutes.post("/log-entries", async (c) => {
  const body = await c.req.json();
  await createLogEntry(body);
  return c.json({ success: true }, 201);
});

logEntriesRoutes.delete("/log-entries/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteLogEntry(id);
  return c.json({ success: true });
});
