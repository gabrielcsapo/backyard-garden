"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { logEntries } from "../db/schema.ts";

export async function createLogEntry(formData: FormData) {
  const plantingId = formData.get("plantingId") ? Number(formData.get("plantingId")) : null;
  const yardElementId = formData.get("yardElementId")
    ? Number(formData.get("yardElementId"))
    : null;
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const type = formData.get("type") as string;
  const content = (formData.get("content") as string) || null;
  const stage = (formData.get("stage") as string) || null;
  const yieldAmount = formData.get("yieldAmount") ? Number(formData.get("yieldAmount")) : null;
  const yieldUnit = (formData.get("yieldUnit") as string) || null;

  if (!type) {
    return { success: false, error: "Event type is required." };
  }

  await db.insert(logEntries).values({
    plantingId,
    yardElementId,
    date,
    type,
    content,
    stage,
    yieldAmount,
    yieldUnit,
  });

  return { success: true };
}

export async function deleteLogEntry(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return { success: false, error: "Log entry ID is required." };
  await db.delete(logEntries).where(eq(logEntries.id, id));
  return { success: true };
}
