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

export async function deleteTask(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(tasks).where(eq(tasks.id, id));
  return { success: true };
}
