import { db } from "../db/index.ts";
import { weatherCache, plantings, plants, yardElements } from "../db/schema.ts";
import { eq, sql } from "drizzle-orm";

export type GDDProgress = {
  plantingId: number;
  plantName: string;
  bedLabel: string | null;
  gddRequired: number;
  gddAccumulated: number;
  progressPct: number;
  estimatedDaysRemaining: number | null;
};

/**
 * Calculate Growing Degree Days from daily temperature data.
 * GDD = max(0, (Tmax + Tmin) / 2 - Tbase)
 */
export function calculateDailyGDD(
  tempMaxF: number,
  tempMinF: number,
  baseTemp: number,
): number {
  const avg = (tempMaxF + tempMinF) / 2;
  return Math.max(0, avg - baseTemp);
}

/**
 * Get GDD progress for active plantings that have gddToHarvest data.
 */
export async function getGDDProgress(
  latitude: number,
  longitude: number,
): Promise<GDDProgress[]> {
  // Get plantings with GDD data
  const gddPlantings = await db
    .select({
      id: plantings.id,
      plantedDate: plantings.plantedDate,
      plantName: plants.name,
      gddBaseTemp: plants.gddBaseTemp,
      gddToHarvest: plants.gddToHarvest,
      bedLabel: yardElements.label,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))
    .where(
      sql`${plantings.status} IN ('planted', 'growing') AND ${plants.gddToHarvest} IS NOT NULL AND ${plantings.plantedDate} IS NOT NULL`,
    );

  if (gddPlantings.length === 0) return [];

  // Get cached weather history
  const weatherHistory = await db
    .select({
      date: weatherCache.date,
      data: weatherCache.data,
    })
    .from(weatherCache)
    .where(
      sql`${weatherCache.latitude} = ${latitude} AND ${weatherCache.longitude} = ${longitude}`,
    );

  // Build a map of date -> weather data
  const weatherMap = new Map<string, any>();
  for (const w of weatherHistory) {
    if (w.data && typeof w.data === "object") {
      const forecast = w.data as any;
      if (forecast.daily) {
        for (const day of forecast.daily) {
          weatherMap.set(day.date, day);
        }
      }
    }
  }

  const today = new Date();
  const results: GDDProgress[] = [];

  for (const p of gddPlantings) {
    if (!p.plantedDate || !p.gddToHarvest || !p.gddBaseTemp) continue;

    let gddAccumulated = 0;
    const plantDate = new Date(p.plantedDate);
    const current = new Date(plantDate);

    // Accumulate GDD from planted date to today
    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      const dayWeather = weatherMap.get(dateStr);

      if (dayWeather) {
        gddAccumulated += calculateDailyGDD(
          dayWeather.tempMaxF,
          dayWeather.tempMinF,
          p.gddBaseTemp,
        );
      } else {
        // Estimate ~15 GDD/day if no data
        gddAccumulated += 15;
      }

      current.setDate(current.getDate() + 1);
    }

    const progressPct = Math.min(
      100,
      Math.round((gddAccumulated / p.gddToHarvest) * 100),
    );

    // Estimate remaining days (average 15 GDD/day)
    const remaining = p.gddToHarvest - gddAccumulated;
    const estimatedDaysRemaining = remaining > 0 ? Math.ceil(remaining / 15) : 0;

    results.push({
      plantingId: p.id,
      plantName: p.plantName,
      bedLabel: p.bedLabel,
      gddRequired: p.gddToHarvest,
      gddAccumulated: Math.round(gddAccumulated),
      progressPct,
      estimatedDaysRemaining: remaining > 0 ? estimatedDaysRemaining : null,
    });
  }

  results.sort((a, b) => b.progressPct - a.progressPct);
  return results;
}
