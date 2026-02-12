import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import * as schema from "./schema.ts";
import plantsJsonRaw from "./plants.json";

const sqlite = new Database("./data/garden.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Run pending migrations automatically on startup
migrate(db, { migrationsFolder: "./drizzle" });

// Auto-seed plants from plants.json on startup — the JSON file is the source of truth.
// Upserts by name so user-added plants (not in JSON) are preserved.
type PlantJson = {
  name: string;
  variety: string | null;
  description: string | null;
  category: string | null;
  family: string | null;
  zoneMin: string | null;
  zoneMax: string | null;
  sunRequirement: string | null;
  daysToHarvest: number | null;
  spacingInches: number | null;
  indoorStartWeeksBeforeFrost: number | null;
  directSowWeeksBeforeFrost: number | null;
  transplantWeeksAfterFrost: number | null;
  companions: string[] | null;
  incompatible: string[] | null;
  successionIntervalWeeks: number | null;
};

const plantsJson: PlantJson[] = plantsJsonRaw as PlantJson[];

for (const p of plantsJson) {
  const existing = db
    .select({ id: schema.plants.id })
    .from(schema.plants)
    .where(eq(schema.plants.name, p.name))
    .get();

  if (existing) {
    db.update(schema.plants)
      .set({
        variety: p.variety,
        description: p.description,
        category: p.category,
        family: p.family,
        zoneMin: p.zoneMin,
        zoneMax: p.zoneMax,
        sunRequirement: p.sunRequirement,
        daysToHarvest: p.daysToHarvest,
        spacingInches: p.spacingInches,
        indoorStartWeeksBeforeFrost: p.indoorStartWeeksBeforeFrost,
        directSowWeeksBeforeFrost: p.directSowWeeksBeforeFrost,
        transplantWeeksAfterFrost: p.transplantWeeksAfterFrost,
        companions: p.companions as any,
        incompatible: p.incompatible as any,
        successionIntervalWeeks: p.successionIntervalWeeks,
      })
      .where(eq(schema.plants.id, existing.id))
      .run();
  } else {
    db.insert(schema.plants)
      .values({
        name: p.name,
        variety: p.variety,
        description: p.description,
        category: p.category,
        family: p.family,
        zoneMin: p.zoneMin,
        zoneMax: p.zoneMax,
        sunRequirement: p.sunRequirement,
        daysToHarvest: p.daysToHarvest,
        spacingInches: p.spacingInches,
        indoorStartWeeksBeforeFrost: p.indoorStartWeeksBeforeFrost,
        directSowWeeksBeforeFrost: p.directSowWeeksBeforeFrost,
        transplantWeeksAfterFrost: p.transplantWeeksAfterFrost,
        companions: p.companions as any,
        incompatible: p.incompatible as any,
        successionIntervalWeeks: p.successionIntervalWeeks,
      })
      .run();
  }
}
