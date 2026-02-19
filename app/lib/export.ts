import { db } from "../db/index.ts";
import { logEntries, plantings, plants, yardElements, seedInventory } from "../db/schema.ts";
import { eq, sql } from "drizzle-orm";

function escapeCSV(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCSV).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(","));
  }
  return lines.join("\n");
}

export async function exportLogEntries(): Promise<string> {
  const entries = await db
    .select({
      date: logEntries.date,
      type: logEntries.type,
      content: logEntries.content,
      plantName: plants.name,
      bedLabel: yardElements.label,
      yieldAmount: logEntries.yieldAmount,
      yieldUnit: logEntries.yieldUnit,
      stage: logEntries.stage,
    })
    .from(logEntries)
    .leftJoin(plantings, eq(logEntries.plantingId, plantings.id))
    .leftJoin(plants, eq(plantings.plantId, plants.id))
    .leftJoin(yardElements, eq(logEntries.yardElementId, yardElements.id))
    .orderBy(sql`${logEntries.date} DESC`);

  return toCSV(
    ["Date", "Type", "Plant", "Bed", "Content", "Yield Amount", "Yield Unit", "Stage"],
    entries.map((e) => [
      e.date,
      e.type,
      e.plantName,
      e.bedLabel,
      e.content,
      e.yieldAmount,
      e.yieldUnit,
      e.stage,
    ]),
  );
}

export async function exportSeedInventory(): Promise<string> {
  const seeds = await db
    .select({
      plantName: plants.name,
      variety: seedInventory.variety,
      brand: seedInventory.brand,
      purchaseDate: seedInventory.purchaseDate,
      expirationDate: seedInventory.expirationDate,
      quantityRemaining: seedInventory.quantityRemaining,
      quantityUnit: seedInventory.quantityUnit,
      lotNumber: seedInventory.lotNumber,
      notes: seedInventory.notes,
    })
    .from(seedInventory)
    .leftJoin(plants, eq(seedInventory.plantId, plants.id))
    .orderBy(sql`${plants.name} ASC`);

  return toCSV(
    ["Plant", "Variety", "Brand", "Purchase Date", "Expiration Date", "Qty", "Unit", "Lot", "Notes"],
    seeds.map((s) => [
      s.plantName,
      s.variety,
      s.brand,
      s.purchaseDate,
      s.expirationDate,
      s.quantityRemaining,
      s.quantityUnit,
      s.lotNumber,
      s.notes,
    ]),
  );
}

export async function exportPlantings(): Promise<string> {
  const data = await db
    .select({
      plantName: plants.name,
      bedLabel: yardElements.label,
      plantedDate: plantings.plantedDate,
      status: plantings.status,
      quantity: plantings.quantity,
      season: plantings.season,
      expectedHarvestDate: plantings.expectedHarvestDate,
      notes: plantings.notes,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))
    .orderBy(sql`${plantings.plantedDate} DESC`);

  return toCSV(
    ["Plant", "Bed", "Planted Date", "Status", "Quantity", "Season", "Expected Harvest", "Notes"],
    data.map((p) => [
      p.plantName,
      p.bedLabel,
      p.plantedDate,
      p.status,
      p.quantity,
      p.season,
      p.expectedHarvestDate,
      p.notes,
    ]),
  );
}
