import { Hono } from "hono";
import {
  getAllTasks,
  createTask,
  completeTask,
  uncompleteTask,
  deleteTask,
} from "../../db/queries.ts";

export const tasksRoutes = new Hono();

tasksRoutes.get("/tasks", async (c) => {
  const tasks = await getAllTasks();
  return c.json(tasks);
});

tasksRoutes.post("/tasks", async (c) => {
  const body = await c.req.json();
  await createTask(body);
  return c.json({ success: true }, 201);
});

tasksRoutes.put("/tasks/:id/complete", async (c) => {
  const id = Number(c.req.param("id"));
  await completeTask(id);
  return c.json({ success: true });
});

tasksRoutes.put("/tasks/:id/uncomplete", async (c) => {
  const id = Number(c.req.param("id"));
  await uncompleteTask(id);
  return c.json({ success: true });
});

tasksRoutes.delete("/tasks/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await deleteTask(id);
  return c.json({ success: true });
});
