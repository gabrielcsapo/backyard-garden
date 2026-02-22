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
  const pestDiseaseId = formData.get("pestDiseaseId")
    ? Number(formData.get("pestDiseaseId"))
    : null;

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
    pestDiseaseId,
  });

  return { success: true };
}

export async function updateLogEntry(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return { success: false, error: "Log entry ID is required." };

  const updates: Record<string, unknown> = {};
  const type = formData.get("type") as string | null;
  const content = formData.get("content") as string | null;
  const date = formData.get("date") as string | null;
  const yieldAmount = formData.get("yieldAmount");
  const yieldUnit = formData.get("yieldUnit") as string | null;
  const plantingId = formData.get("plantingId");
  const yardElementId = formData.get("yardElementId");

  if (type !== null) updates.type = type;
  if (content !== null) updates.content = content || null;
  if (date !== null) updates.date = date;
  if (yieldAmount !== null) updates.yieldAmount = yieldAmount ? Number(yieldAmount) : null;
  if (yieldUnit !== null) updates.yieldUnit = yieldUnit || null;
  if (plantingId !== null) updates.plantingId = plantingId ? Number(plantingId) : null;
  if (yardElementId !== null) updates.yardElementId = yardElementId ? Number(yardElementId) : null;

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "No fields to update." };
  }

  await db.update(logEntries).set(updates).where(eq(logEntries.id, id));
  return { success: true };
}

export async function deleteLogEntry(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return { success: false, error: "Log entry ID is required." };
  await db.delete(logEntries).where(eq(logEntries.id, id));
  return { success: true };
}
