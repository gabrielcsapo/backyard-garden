"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { soilProfiles } from "../db/schema.ts";

export async function addSoilProfile(formData: FormData) {
  const yardElementId = formData.get("yardElementId") ? Number(formData.get("yardElementId")) : null;
  const testDate = (formData.get("testDate") as string) || null;
  const ph = formData.get("ph") ? Number(formData.get("ph")) : null;
  const nitrogenLevel = (formData.get("nitrogenLevel") as string) || null;
  const phosphorusLevel = (formData.get("phosphorusLevel") as string) || null;
  const potassiumLevel = (formData.get("potassiumLevel") as string) || null;
  const organicMatterPct = formData.get("organicMatterPct") ? Number(formData.get("organicMatterPct")) : null;
  const soilType = (formData.get("soilType") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  await db.insert(soilProfiles).values({
    yardElementId,
    testDate,
    ph,
    nitrogenLevel,
    phosphorusLevel,
    potassiumLevel,
    organicMatterPct,
    soilType,
    notes,
  });

  return { success: true };
}

export async function deleteSoilProfile(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(soilProfiles).where(eq(soilProfiles.id, id));
  return { success: true };
}
