import { Hono } from "hono";
import { db } from "../../db/index.ts";
import {
  settings,
  yards,
  yardElements,
  plants,
  plantings,
  logEntries,
  seedInventory,
  tasks,
  soilProfiles,
} from "../../db/schema.ts";
import { sql } from "drizzle-orm";

export const syncRoutes = new Hono();

/**
 * GET /api/sync?since=<ISO timestamp>
 * Returns all rows from mutable tables updated since the given timestamp.
 * If no `since` param, returns everything (full sync).
 */
syncRoutes.get("/sync", async (c) => {
  const since = c.req.query("since");
  const filter = since
    ? sql`updated_at > ${since}`
    : sql`1=1`;

  const [
    settingsRows,
    yardsRows,
    elementsRows,
    plantsRows,
    plantingsRows,
    logRows,
    seedRows,
    taskRows,
    soilRows,
  ] = await Promise.all([
    db.select().from(settings).where(filter),
    db.select().from(yards).where(filter),
    db.select().from(yardElements).where(filter),
    db.select().from(plants).where(filter),
    db.select().from(plantings).where(filter),
    db.select().from(logEntries).where(filter),
    db.select().from(seedInventory).where(filter),
    db.select().from(tasks).where(filter),
    db.select().from(soilProfiles).where(filter),
  ]);

  return c.json({
    syncedAt: new Date().toISOString(),
    settings: settingsRows[0] ?? null,
    yards: yardsRows,
    yardElements: elementsRows,
    plants: plantsRows,
    plantings: plantingsRows,
    logEntries: logRows,
    seedInventory: seedRows,
    tasks: taskRows,
    soilProfiles: soilRows,
  });
});

/**
 * POST /api/sync
 * Receives changes from the iOS client.
 * Last-write-wins conflict resolution based on updatedAt.
 * Body format: same shape as GET /api/sync response.
 */
syncRoutes.post("/sync", async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  let applied = 0;

  // Settings (upsert) — settings is a single object (not array)
  if (body.settings) {
    const row = body.settings;
    const existing = await db.select().from(settings).limit(1);
    if (existing.length > 0) {
      if (!existing[0].updatedAt || row.updatedAt > existing[0].updatedAt) {
        await db.update(settings).set({ ...row, updatedAt: now }).where(sql`id = ${existing[0].id}`);
        applied++;
      }
    } else {
      await db.insert(settings).values({ ...row, updatedAt: now });
      applied++;
    }
  }

  // Generic upsert for tables with id
  const tables = [
    { key: "yards", table: yards },
    { key: "yardElements", table: yardElements },
    { key: "plantings", table: plantings },
    { key: "logEntries", table: logEntries },
    { key: "seedInventory", table: seedInventory },
    { key: "tasks", table: tasks },
    { key: "soilProfiles", table: soilProfiles },
  ] as const;

  for (const { key, table } of tables) {
    const rows = body[key];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row.id) continue;
      const existing = await db.select().from(table).where(sql`id = ${row.id}`).limit(1);
      if (existing.length > 0) {
        const existingUpdatedAt = (existing[0] as Record<string, unknown>).updatedAt as string | null;
        if (!existingUpdatedAt || row.updatedAt > existingUpdatedAt) {
          const { id: _id, ...rest } = row;
          await db.update(table).set({ ...rest, updatedAt: now }).where(sql`id = ${row.id}`);
          applied++;
        }
      } else {
        await db.insert(table).values({ ...row, updatedAt: now });
        applied++;
      }
    }
  }

  return c.json({ success: true, applied, syncedAt: now });
});
