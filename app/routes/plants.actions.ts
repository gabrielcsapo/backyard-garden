"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { plants } from "../db/schema.ts";

export async function addPlant(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) {
    throw new Error("Plant name is required");
  }

  const companionsRaw = formData.get("companions") as string | null;
  const incompatibleRaw = formData.get("incompatible") as string | null;

  const companions = companionsRaw
    ? companionsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const incompatible = incompatibleRaw
    ? incompatibleRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  db.insert(plants)
    .values({
      name,
      variety: (formData.get("variety") as string) || null,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || null,
      zoneMin: (formData.get("zoneMin") as string) || null,
      zoneMax: (formData.get("zoneMax") as string) || null,
      sunRequirement: (formData.get("sunRequirement") as string) || null,
      daysToHarvest: formData.get("daysToHarvest") ? Number(formData.get("daysToHarvest")) : null,
      spacingInches: formData.get("spacingInches") ? Number(formData.get("spacingInches")) : null,
      indoorStartWeeksBeforeFrost: formData.get("indoorStartWeeksBeforeFrost")
        ? Number(formData.get("indoorStartWeeksBeforeFrost"))
        : null,
      directSowWeeksBeforeFrost: formData.get("directSowWeeksBeforeFrost")
        ? Number(formData.get("directSowWeeksBeforeFrost"))
        : null,
      transplantWeeksAfterFrost: formData.get("transplantWeeksAfterFrost")
        ? Number(formData.get("transplantWeeksAfterFrost"))
        : null,
      companions: companions as any,
      incompatible: incompatible as any,
    })
    .run();
}

export async function deletePlant(id: number) {
  db.delete(plants).where(eq(plants.id, id)).run();
}
