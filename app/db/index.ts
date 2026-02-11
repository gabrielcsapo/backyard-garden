import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.ts";
import plantsJson from "./plants.json";

const sqlite = new Database("./data/garden.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Run pending migrations automatically on startup
migrate(db, { migrationsFolder: "./drizzle" });

// Seed plants if table is empty
const existing = db.select().from(schema.plants).limit(1).all();
if (existing.length === 0) {
  for (const plant of plantsJson) {
    db.insert(schema.plants)
      .values(plant as typeof schema.plants.$inferInsert)
      .run();
  }
}
