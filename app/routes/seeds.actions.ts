"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { seedInventory } from "../db/schema.ts";

export async function addSeed(formData: FormData) {
  const plantId = formData.get("plantId") ? Number(formData.get("plantId")) : null;
  const variety = (formData.get("variety") as string) || null;
  const brand = (formData.get("brand") as string) || null;
  const purchaseDate = (formData.get("purchaseDate") as string) || null;
  const expirationDate = (formData.get("expirationDate") as string) || null;
  const quantityRemaining = formData.get("quantityRemaining") ? Number(formData.get("quantityRemaining")) : null;
  const quantityUnit = (formData.get("quantityUnit") as string) || "packets";
  const lotNumber = (formData.get("lotNumber") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  await db.insert(seedInventory).values({
    plantId,
    variety,
    brand,
    purchaseDate,
    expirationDate,
    quantityRemaining,
    quantityUnit,
    lotNumber,
    notes,
  });

  return { success: true };
}

export async function updateSeed(formData: FormData) {
  const id = Number(formData.get("id"));
  const updates: Record<string, unknown> = {};

  const variety = formData.get("variety");
  if (variety != null) updates.variety = (variety as string) || null;
  const brand = formData.get("brand");
  if (brand != null) updates.brand = (brand as string) || null;
  const quantityRemaining = formData.get("quantityRemaining");
  if (quantityRemaining != null) updates.quantityRemaining = Number(quantityRemaining);
  const notes = formData.get("notes");
  if (notes != null) updates.notes = (notes as string) || null;

  await db.update(seedInventory).set(updates).where(eq(seedInventory.id, id));
  return { success: true };
}

export async function deleteSeed(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(seedInventory).where(eq(seedInventory.id, id));
  return { success: true };
}
