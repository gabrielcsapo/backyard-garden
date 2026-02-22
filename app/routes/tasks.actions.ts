"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { tasks } from "../db/schema.ts";

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const dueDate = (formData.get("dueDate") as string) || null;
  const recurrence = (formData.get("recurrence") as string) || null;
  const taskType = (formData.get("taskType") as string) || null;
  const plantingId = formData.get("plantingId") ? Number(formData.get("plantingId")) : null;
  const yardElementId = formData.get("yardElementId") ? Number(formData.get("yardElementId")) : null;

  if (!title) {
    return { success: false, error: "Title is required." };
  }

  await db.insert(tasks).values({
    title,
    description,
    dueDate,
    recurrence,
    taskType,
    plantingId,
    yardElementId,
  });

  return { success: true };
}

export async function completeTask(formData: FormData) {
  const id = Number(formData.get("id"));
  await db
    .update(tasks)
    .set({ completedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));
  return { success: true };
}

export async function uncompleteTask(formData: FormData) {
  const id = Number(formData.get("id"));
  await db
    .update(tasks)
    .set({ completedAt: null })
    .where(eq(tasks.id, id));
  return { success: true };
}

export async function updateTask(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return { success: false, error: "Task ID is required." };

  const updates: Record<string, unknown> = {};
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const dueDate = formData.get("dueDate") as string | null;
  const recurrence = formData.get("recurrence") as string | null;
  const taskType = formData.get("taskType") as string | null;

  if (title !== null) updates.title = title;
  if (description !== null) updates.description = description || null;
  if (dueDate !== null) updates.dueDate = dueDate || null;
  if (recurrence !== null) updates.recurrence = recurrence || null;
  if (taskType !== null) updates.taskType = taskType || null;

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "No fields to update." };
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, id));
  return { success: true };
}

export async function deleteTask(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(tasks).where(eq(tasks.id, id));
  return { success: true };
}
