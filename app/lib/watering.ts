import { db } from "../db/index.ts";
import { logEntries, plantings, plants, yardElements } from "../db/schema.ts";
import { eq, desc, inArray } from "drizzle-orm";

export type WateringStatus = {
  elementId: number;
  bedLabel: string | null;
  lastWatered: string | null;
  daysSinceWatering: number | null;
  needsWatering: boolean;
  waterNeedLevel: string;
  mulched: boolean;
  irrigationType: string;
  plantNames: string[];
};

const WATER_NEED_DAYS: Record<string, number> = {
  very_high: 1,
  high: 2,
  medium: 3,
  low: 5,
};

export async function getWateringStatuses(
  recentRainMm: number = 0,
): Promise<WateringStatus[]> {
  // Get all beds with plantings
  const bedsWithPlantings = await db
    .select({
      elementId: yardElements.id,
      bedLabel: yardElements.label,
      mulched: yardElements.mulched,
      irrigationType: yardElements.irrigationType,
      plantName: plants.name,
      waterNeeds: plants.waterNeeds,
    })
    .from(plantings)
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .where(eq(plantings.status, "planted"));

  if (bedsWithPlantings.length === 0) return [];

  // Group by bed
  const bedMap = new Map<
    number,
    {
      bedLabel: string | null;
      mulched: boolean;
      irrigationType: string;
      plantNames: string[];
      maxWaterNeed: string;
    }
  >();

  for (const row of bedsWithPlantings) {
    const existing = bedMap.get(row.elementId);
    const waterNeed = row.waterNeeds ?? "medium";
    if (existing) {
      existing.plantNames.push(row.plantName);
      // Use the highest water need among plants in the bed
      const currentPriority = WATER_NEED_DAYS[existing.maxWaterNeed] ?? 3;
      const newPriority = WATER_NEED_DAYS[waterNeed] ?? 3;
      if (newPriority < currentPriority) {
        existing.maxWaterNeed = waterNeed;
      }
    } else {
      bedMap.set(row.elementId, {
        bedLabel: row.bedLabel,
        mulched: (row.mulched ?? 0) === 1,
        irrigationType: row.irrigationType ?? "none",
        plantNames: [row.plantName],
        maxWaterNeed: waterNeed,
      });
    }
  }

  const elementIds = Array.from(bedMap.keys());

  // Get last watering log per bed
  const wateringLogs = await db
    .select({
      yardElementId: logEntries.yardElementId,
      date: logEntries.date,
    })
    .from(logEntries)
    .where(
      inArray(logEntries.yardElementId, elementIds),
    )
    .orderBy(desc(logEntries.date));

  // Find most recent watering per bed
  const lastWateredMap = new Map<number, string>();
  for (const log of wateringLogs) {
    if (log.yardElementId && !lastWateredMap.has(log.yardElementId)) {
      lastWateredMap.set(log.yardElementId, log.date);
    }
  }

  const today = new Date();
  const statuses: WateringStatus[] = [];

  for (const [elementId, bed] of bedMap) {
    const lastWatered = lastWateredMap.get(elementId) ?? null;
    let daysSinceWatering: number | null = null;

    if (lastWatered) {
      const lastDate = new Date(lastWatered);
      daysSinceWatering = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    let thresholdDays = WATER_NEED_DAYS[bed.maxWaterNeed] ?? 3;

    // Mulched beds retain moisture longer
    if (bed.mulched) {
      thresholdDays += 1;
    }

    // Significant rain reduces need
    if (recentRainMm > 5) {
      thresholdDays += 1;
    }

    // Drip irrigation means less frequent manual watering needed
    if (bed.irrigationType === "drip") {
      thresholdDays += 2;
    }

    const needsWatering =
      daysSinceWatering === null || daysSinceWatering >= thresholdDays;

    statuses.push({
      elementId,
      bedLabel: bed.bedLabel,
      lastWatered,
      daysSinceWatering,
      needsWatering,
      waterNeedLevel: bed.maxWaterNeed,
      mulched: bed.mulched,
      irrigationType: bed.irrigationType,
      plantNames: [...new Set(bed.plantNames)],
    });
  }

  // Sort: needs watering first, then by days since watering desc
  statuses.sort((a, b) => {
    if (a.needsWatering !== b.needsWatering) return a.needsWatering ? -1 : 1;
    return (b.daysSinceWatering ?? 999) - (a.daysSinceWatering ?? 999);
  });

  return statuses;
}
