import { eq, desc, gte, inArray, sql } from "drizzle-orm";
import { db } from "./index.ts";
import {
  settings,
  yards,
  yardElements,
  plants,
  plantings,
  logEntries,
  seedInventory,
  pestDisease,
  tasks,
  soilProfiles,
} from "./schema.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getAllSettings() {
  const rows = await db.select().from(settings).limit(1);
  return rows[0] ?? null;
}

export async function updateSettings(data: {
  zipCode?: string | null;
  zone?: string | null;
  lastFrostDate?: string | null;
  firstFrostDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const existing = await db.select().from(settings).limit(1);
  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ ...data, updatedAt: now() })
      .where(eq(settings.id, existing[0].id));
  } else {
    await db.insert(settings).values({ ...data, updatedAt: now() });
  }
}

// ---------------------------------------------------------------------------
// Yards
// ---------------------------------------------------------------------------

export async function getAllYards() {
  return db.select().from(yards);
}

export async function getYardById(id: number) {
  const rows = await db.select().from(yards).where(eq(yards.id, id));
  return rows[0] ?? null;
}

export async function createYard(data: {
  name: string;
  widthFt: number;
  heightFt: number;
}) {
  const result = await db
    .insert(yards)
    .values({ ...data, updatedAt: now() })
    .returning({ id: yards.id });
  return result[0];
}

export async function updateYard(
  id: number,
  data: {
    name?: string;
    widthFt?: number;
    heightFt?: number;
  },
) {
  await db
    .update(yards)
    .set({ ...data, updatedAt: now() })
    .where(eq(yards.id, id));
}

export async function deleteYard(id: number) {
  await db.delete(yards).where(eq(yards.id, id));
}

// ---------------------------------------------------------------------------
// Yard Elements
// ---------------------------------------------------------------------------

export async function getYardElements(yardId: number) {
  return db.select().from(yardElements).where(eq(yardElements.yardId, yardId));
}

export async function getYardElementById(id: number) {
  const rows = await db
    .select()
    .from(yardElements)
    .where(eq(yardElements.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllYardElements() {
  return db.select().from(yardElements);
}

export async function createYardElement(data: {
  yardId: number;
  shapeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string | null;
  sunExposure?: string | null;
  rotation?: number | null;
  metadata?: unknown;
  seasonExtension?: string | null;
  irrigationType?: string | null;
  mulched?: number | null;
}) {
  await db.insert(yardElements).values({ ...data, updatedAt: now() });
}

export async function updateYardElement(
  id: number,
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label?: string | null;
    sunExposure?: string | null;
    shapeType?: string;
    rotation?: number | null;
    seasonExtension?: string | null;
    irrigationType?: string | null;
    mulched?: number | null;
    metadata?: unknown;
  },
) {
  await db
    .update(yardElements)
    .set({ ...data, updatedAt: now() })
    .where(eq(yardElements.id, id));
}

export async function deleteYardElement(id: number) {
  await db.delete(yardElements).where(eq(yardElements.id, id));
}

export async function duplicateYardElement(id: number, yardId: number) {
  const original = await db
    .select()
    .from(yardElements)
    .where(eq(yardElements.id, id))
    .limit(1);
  if (!original[0]) return null;
  const el = original[0];
  const result = await db
    .insert(yardElements)
    .values({
      yardId,
      shapeType: el.shapeType,
      x: el.x + 1,
      y: el.y + 1,
      width: el.width,
      height: el.height,
      label: el.label ? `${el.label} (copy)` : null,
      sunExposure: el.sunExposure,
      rotation: el.rotation,
      updatedAt: now(),
    })
    .returning({ id: yardElements.id });
  return result[0] ?? null;
}

// ---------------------------------------------------------------------------
// Plants
// ---------------------------------------------------------------------------

export async function getAllPlants() {
  return db.select().from(plants);
}

export async function getPlantById(id: number) {
  const rows = await db.select().from(plants).where(eq(plants.id, id));
  return rows[0] ?? null;
}

/**
 * Subset of plant fields used by the yard editor.
 */
export async function getPlantsForYardEditor() {
  return db
    .select({
      id: plants.id,
      name: plants.name,
      variety: plants.variety,
      category: plants.category,
      spacingInches: plants.spacingInches,
      daysToHarvest: plants.daysToHarvest,
      sunRequirement: plants.sunRequirement,
      companions: plants.companions,
      incompatible: plants.incompatible,
    })
    .from(plants);
}

/**
 * Minimal plant list (id + name) used for dropdowns.
 */
export async function getPlantOptions() {
  return db
    .select({ id: plants.id, name: plants.name })
    .from(plants)
    .orderBy(sql`${plants.name} ASC`);
}

// ---------------------------------------------------------------------------
// Plantings
// ---------------------------------------------------------------------------

export async function getAllPlantings() {
  return db.select().from(plantings);
}

export async function getPlantingById(id: number) {
  const rows = await db
    .select()
    .from(plantings)
    .where(eq(plantings.id, id));
  return rows[0] ?? null;
}

export async function getPlantingsByElementIds(elementIds: number[]) {
  if (elementIds.length === 0) return [];
  return db
    .select({
      id: plantings.id,
      plantId: plantings.plantId,
      yardElementId: plantings.yardElementId,
      status: plantings.status,
      quantity: plantings.quantity,
      notes: plantings.notes,
      plantedDate: plantings.plantedDate,
    })
    .from(plantings)
    .where(inArray(plantings.yardElementId, elementIds));
}

/**
 * Plantings joined with plant name / variety and bed label.
 * Used by the log quick-log form and other places.
 */
export async function getPlantingsWithDetails() {
  return db
    .select({
      id: plantings.id,
      plantName: plants.name,
      plantVariety: plants.variety,
      yardElementId: plantings.yardElementId,
      bedLabel: yardElements.label,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id));
}

/**
 * Active plantings (status != 'done') joined with plant + bed info.
 * Used by the calendar, home dashboard, and pests page.
 */
export async function getActivePlantingsWithDetails() {
  return db
    .select({
      id: plantings.id,
      plantId: plantings.plantId,
      status: plantings.status,
      plantedDate: plantings.plantedDate,
      yardElementId: plantings.yardElementId,
      quantity: plantings.quantity,
      plantName: plants.name,
      plantVariety: plants.variety,
      category: plants.category,
      indoorStartWeeks: plants.indoorStartWeeksBeforeFrost,
      directSowWeeks: plants.directSowWeeksBeforeFrost,
      transplantWeeks: plants.transplantWeeksAfterFrost,
      daysToHarvest: plants.daysToHarvest,
      bedLabel: yardElements.label,
      bedShapeType: yardElements.shapeType,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))
    .where(sql`${plantings.status} != 'done'`);
}

export async function createPlanting(data: {
  plantId: number;
  yardElementId: number;
  quantity?: number | null;
  notes?: string | null;
  status?: string | null;
  plantedDate?: string | null;
  expectedHarvestDate?: string | null;
  season?: string | null;
}) {
  await db.insert(plantings).values({
    ...data,
    quantity: data.quantity ?? 1,
    status: data.status ?? "planned",
    season: data.season ?? new Date().getFullYear().toString(),
    updatedAt: now(),
  });
}

export async function updatePlanting(
  id: number,
  data: {
    status?: string | null;
    quantity?: number | null;
    notes?: string | null;
    plantedDate?: string | null;
    expectedHarvestDate?: string | null;
  },
) {
  const updates: Record<string, unknown> = { ...data, updatedAt: now() };

  // Auto-set plantedDate when advancing to seeded or transplanted
  if (
    (data.status === "seeded" || data.status === "transplanted") &&
    data.plantedDate === undefined
  ) {
    updates.plantedDate = today();
  }

  await db.update(plantings).set(updates).where(eq(plantings.id, id));
}

export async function deletePlanting(id: number) {
  await db.delete(plantings).where(eq(plantings.id, id));
}

// ---------------------------------------------------------------------------
// Log Entries
// ---------------------------------------------------------------------------

/**
 * All log entries joined with plant name / variety and bed label.
 * Ordered by date descending, then id descending.
 */
export async function getAllLogEntries() {
  return db
    .select({
      id: logEntries.id,
      date: logEntries.date,
      type: logEntries.type,
      content: logEntries.content,
      stage: logEntries.stage,
      yieldAmount: logEntries.yieldAmount,
      yieldUnit: logEntries.yieldUnit,
      photoPath: logEntries.photoPath,
      plantingId: logEntries.plantingId,
      yardElementId: logEntries.yardElementId,
      plantName: plants.name,
      plantVariety: plants.variety,
      bedLabel: yardElements.label,
      bedShapeType: yardElements.shapeType,
    })
    .from(logEntries)
    .leftJoin(plantings, eq(logEntries.plantingId, plantings.id))
    .leftJoin(plants, eq(plantings.plantId, plants.id))
    .leftJoin(yardElements, eq(logEntries.yardElementId, yardElements.id))
    .orderBy(desc(logEntries.date), desc(logEntries.id));
}

/**
 * Recent log entries (last N). Joined with plant + bed info.
 */
export async function getRecentLogEntries(limit = 5) {
  return db
    .select({
      id: logEntries.id,
      date: logEntries.date,
      type: logEntries.type,
      content: logEntries.content,
      plantName: plants.name,
      bedLabel: yardElements.label,
    })
    .from(logEntries)
    .leftJoin(plantings, eq(logEntries.plantingId, plantings.id))
    .leftJoin(plants, eq(plantings.plantId, plants.id))
    .leftJoin(yardElements, eq(logEntries.yardElementId, yardElements.id))
    .orderBy(desc(logEntries.date), desc(logEntries.id))
    .limit(limit);
}

/**
 * Count of log entries since a given date string (YYYY-MM-DD).
 */
export async function getLogEntriesSince(dateStr: string) {
  return db
    .select({ id: logEntries.id })
    .from(logEntries)
    .where(gte(logEntries.date, dateStr));
}

export async function createLogEntry(data: {
  plantingId?: number | null;
  yardElementId?: number | null;
  date?: string;
  type: string;
  content?: string | null;
  stage?: string | null;
  yieldAmount?: number | null;
  yieldUnit?: string | null;
  photoPath?: string | null;
  pestDiseaseId?: number | null;
}) {
  await db.insert(logEntries).values({
    ...data,
    date: data.date ?? today(),
    updatedAt: now(),
  });
}

export async function deleteLogEntry(id: number) {
  await db.delete(logEntries).where(eq(logEntries.id, id));
}

// ---------------------------------------------------------------------------
// Seed Inventory
// ---------------------------------------------------------------------------

export async function getAllSeeds() {
  return db
    .select({
      id: seedInventory.id,
      plantId: seedInventory.plantId,
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
    .orderBy(sql`${seedInventory.expirationDate} ASC`);
}

export async function addSeed(data: {
  plantId?: number | null;
  variety?: string | null;
  brand?: string | null;
  purchaseDate?: string | null;
  expirationDate?: string | null;
  quantityRemaining?: number | null;
  quantityUnit?: string | null;
  lotNumber?: string | null;
  notes?: string | null;
}) {
  await db.insert(seedInventory).values({
    ...data,
    quantityUnit: data.quantityUnit ?? "packets",
    updatedAt: now(),
  });
}

export async function updateSeed(
  id: number,
  data: {
    variety?: string | null;
    brand?: string | null;
    quantityRemaining?: number | null;
    notes?: string | null;
  },
) {
  await db
    .update(seedInventory)
    .set({ ...data, updatedAt: now() })
    .where(eq(seedInventory.id, id));
}

export async function deleteSeed(id: number) {
  await db.delete(seedInventory).where(eq(seedInventory.id, id));
}

// ---------------------------------------------------------------------------
// Pests & Diseases
// ---------------------------------------------------------------------------

export async function getAllPests() {
  return db
    .select()
    .from(pestDisease)
    .orderBy(sql`${pestDisease.type} ASC, ${pestDisease.name} ASC`);
}

export async function getPestById(id: number) {
  const rows = await db
    .select()
    .from(pestDisease)
    .where(eq(pestDisease.id, id));
  return rows[0] ?? null;
}

/**
 * Returns unique plant names from active plantings (status != 'done').
 * Useful for the pest symptom checker.
 */
export async function getActivePlantNames() {
  const rows = await db
    .select({ name: plants.name })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .where(sql`${plantings.status} != 'done'`);
  return [...new Set(rows.map((r) => r.name))].sort();
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function getAllTasks() {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      recurrence: tasks.recurrence,
      completedAt: tasks.completedAt,
      taskType: tasks.taskType,
      plantingId: tasks.plantingId,
      yardElementId: tasks.yardElementId,
      bedLabel: yardElements.label,
    })
    .from(tasks)
    .leftJoin(yardElements, eq(tasks.yardElementId, yardElements.id))
    .orderBy(sql`${tasks.completedAt} IS NOT NULL, ${tasks.dueDate} ASC`);
}

export async function getTaskById(id: number) {
  const rows = await db.select().from(tasks).where(eq(tasks.id, id));
  return rows[0] ?? null;
}

export async function createTask(data: {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  recurrence?: string | null;
  recurrenceEndDate?: string | null;
  taskType?: string | null;
  plantingId?: number | null;
  yardElementId?: number | null;
}) {
  await db.insert(tasks).values({ ...data, updatedAt: now() });
}

export async function completeTask(id: number) {
  await db
    .update(tasks)
    .set({ completedAt: new Date().toISOString(), updatedAt: now() })
    .where(eq(tasks.id, id));
}

export async function uncompleteTask(id: number) {
  await db
    .update(tasks)
    .set({ completedAt: null, updatedAt: now() })
    .where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ---------------------------------------------------------------------------
// Soil Profiles
// ---------------------------------------------------------------------------

export async function getAllSoilProfiles() {
  return db
    .select({
      id: soilProfiles.id,
      yardElementId: soilProfiles.yardElementId,
      bedLabel: yardElements.label,
      testDate: soilProfiles.testDate,
      ph: soilProfiles.ph,
      nitrogenLevel: soilProfiles.nitrogenLevel,
      phosphorusLevel: soilProfiles.phosphorusLevel,
      potassiumLevel: soilProfiles.potassiumLevel,
      organicMatterPct: soilProfiles.organicMatterPct,
      soilType: soilProfiles.soilType,
      notes: soilProfiles.notes,
    })
    .from(soilProfiles)
    .leftJoin(yardElements, eq(soilProfiles.yardElementId, yardElements.id))
    .orderBy(sql`${soilProfiles.testDate} DESC`);
}

export async function addSoilProfile(data: {
  yardElementId?: number | null;
  testDate?: string | null;
  ph?: number | null;
  nitrogenLevel?: string | null;
  phosphorusLevel?: string | null;
  potassiumLevel?: string | null;
  organicMatterPct?: number | null;
  soilType?: string | null;
  notes?: string | null;
}) {
  await db.insert(soilProfiles).values({ ...data, updatedAt: now() });
}

export async function deleteSoilProfile(id: number) {
  await db.delete(soilProfiles).where(eq(soilProfiles.id, id));
}

// ---------------------------------------------------------------------------
// Bed Options (used by soil page and other dropdowns)
// ---------------------------------------------------------------------------

export async function getBedOptions() {
  return db
    .select({ id: yardElements.id, label: yardElements.label })
    .from(yardElements)
    .orderBy(sql`${yardElements.label} ASC`);
}

// ---------------------------------------------------------------------------
// Yard Summaries (composite query used by yard list and home dashboard)
// ---------------------------------------------------------------------------

export async function getYardSummaries() {
  const allYards = await db.select().from(yards);

  return Promise.all(
    allYards.map(async (yard) => {
      const elements = await db
        .select({
          id: yardElements.id,
          shapeType: yardElements.shapeType,
          x: yardElements.x,
          y: yardElements.y,
          width: yardElements.width,
          height: yardElements.height,
          label: yardElements.label,
          rotation: yardElements.rotation,
        })
        .from(yardElements)
        .where(eq(yardElements.yardId, yard.id));

      let plantingCount = 0;
      let activePlantingCount = 0;
      const elementIds = elements.map((e) => e.id);
      if (elementIds.length > 0) {
        const allP = await db
          .select({ id: plantings.id, status: plantings.status })
          .from(plantings)
          .where(inArray(plantings.yardElementId, elementIds));
        plantingCount = allP.length;
        activePlantingCount = allP.filter((p) => p.status !== "done").length;
      }

      return {
        ...yard,
        elements,
        elementCount: elements.length,
        plantingCount,
        activePlantingCount,
      };
    }),
  );
}
