import { db } from "../db/index.ts";
import { plantings, plants, logEntries, yardElements } from "../db/schema.ts";
import { eq, sql } from "drizzle-orm";

export type YieldSummary = {
  plantingId: number;
  plantName: string;
  bedLabel: string | null;
  expectedYield: number | null;
  actualYield: number;
  yieldUnit: string;
  quantity: number;
  progressPct: number;
};

export async function getYieldSummaries(): Promise<YieldSummary[]> {
  // Get active plantings with yield expectations
  const activePlantings = await db
    .select({
      id: plantings.id,
      quantity: plantings.quantity,
      plantName: plants.name,
      expectedYieldPerPlant: plants.expectedYieldPerPlant,
      expectedYieldUnit: plants.expectedYieldUnit,
      bedLabel: yardElements.label,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))
    .where(sql`${plantings.status} IN ('planted', 'growing')`);

  if (activePlantings.length === 0) return [];

  // Get harvest logs grouped by planting
  const harvestLogs = await db
    .select({
      plantingId: logEntries.plantingId,
      yieldAmount: logEntries.yieldAmount,
      yieldUnit: logEntries.yieldUnit,
    })
    .from(logEntries)
    .where(eq(logEntries.type, "harvest"));

  // Sum actual yields per planting
  const actualYieldMap = new Map<number, number>();
  for (const log of harvestLogs) {
    if (log.plantingId && log.yieldAmount) {
      const current = actualYieldMap.get(log.plantingId) ?? 0;
      actualYieldMap.set(log.plantingId, current + log.yieldAmount);
    }
  }

  const summaries: YieldSummary[] = [];

  for (const p of activePlantings) {
    const qty = p.quantity ?? 1;
    const expectedPerPlant = p.expectedYieldPerPlant;
    const expectedTotal = expectedPerPlant ? expectedPerPlant * qty : null;
    const actualYield = actualYieldMap.get(p.id) ?? 0;
    const unit = p.expectedYieldUnit ?? "lbs";

    const progressPct =
      expectedTotal && expectedTotal > 0
        ? Math.min(100, Math.round((actualYield / expectedTotal) * 100))
        : 0;

    summaries.push({
      plantingId: p.id,
      plantName: p.plantName,
      bedLabel: p.bedLabel,
      expectedYield: expectedTotal,
      actualYield,
      yieldUnit: unit,
      quantity: qty,
      progressPct,
    });
  }

  // Sort by progress percentage descending
  summaries.sort((a, b) => b.progressPct - a.progressPct);

  return summaries;
}
