"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { settings } from "../db/schema.ts";

export async function saveSettings(formData: FormData) {
  const zipCode = (formData.get("zipCode") as string) || null;
  const zone = formData.get("zone") as string;
  const lastFrostDate = formData.get("lastFrostDate") as string;
  const firstFrostDate = formData.get("firstFrostDate") as string;

  if (!zone) {
    return { success: false, error: "Please select a USDA hardiness zone." };
  }

  const existing = await db.select().from(settings).limit(1);

  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ zipCode, zone, lastFrostDate, firstFrostDate, latitude, longitude })
      .where(eq(settings.id, existing[0].id));
  } else {
    await db.insert(settings).values({ zipCode, zone, lastFrostDate, firstFrostDate, latitude, longitude });
  }

  return { success: true };
}
