"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { plantings } from "../db/schema.ts";

export async function addPlanting(formData: FormData) {
  const plantId = Number(formData.get("plantId"));
  const yardElementId = Number(formData.get("yardElementId"));
  const quantity = Number(formData.get("quantity")) || 1;
  const notes = (formData.get("notes") as string) || null;
  const status = (formData.get("status") as string) || "planned";
  const plantedDate = (formData.get("plantedDate") as string) || null;
  const expectedHarvestDate = (formData.get("expectedHarvestDate") as string) || null;
  const season = new Date().getFullYear().toString();

  if (!plantId || !yardElementId) {
    throw new Error("Plant and bed are required");
  }

  await db.insert(plantings).values({
    plantId,
    yardElementId,
    quantity,
    notes,
    status,
    plantedDate,
    expectedHarvestDate,
    season,
  });
}

export async function updatePlantingStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = formData.get("status") as string;

  if (!id || !status) {
    throw new Error("Planting ID and status are required");
  }

  const updates: Record<string, unknown> = { status };

  if (status === "seeded" || status === "transplanted") {
    const today = new Date().toISOString().split("T")[0];
    updates.plantedDate = today;
  }

  await db.update(plantings).set(updates).where(eq(plantings.id, id));
}

export async function updatePlanting(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Planting ID is required");

  const updates: Record<string, unknown> = {};

  const status = formData.get("status");
  const quantity = formData.get("quantity");
  const notes = formData.get("notes");

  if (status != null) {
    updates.status = status as string;
    if (status === "seeded" || status === "transplanted") {
      const today = new Date().toISOString().split("T")[0];
      updates.plantedDate = today;
    }
  }
  if (quantity != null) updates.quantity = Number(quantity);
  if (notes != null) updates.notes = (notes as string) || null;

  await db.update(plantings).set(updates).where(eq(plantings.id, id));
}

export async function deletePlanting(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Planting ID is required");
  await db.delete(plantings).where(eq(plantings.id, id));
}
