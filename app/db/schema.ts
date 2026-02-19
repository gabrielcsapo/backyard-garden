import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  zipCode: text("zip_code"),
  zone: text("zone"),
  lastFrostDate: text("last_frost_date"),
  firstFrostDate: text("first_frost_date"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const yards = sqliteTable("yards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  widthFt: integer("width_ft").notNull(),
  heightFt: integer("height_ft").notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const yardElements = sqliteTable("yard_elements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  yardId: integer("yard_id")
    .notNull()
    .references(() => yards.id, { onDelete: "cascade" }),
  shapeType: text("shape_type").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  label: text("label"),
  sunExposure: text("sun_exposure").default("full_sun"),
  rotation: integer("rotation").default(0),
  metadata: text("metadata", { mode: "json" }),
  seasonExtension: text("season_extension").default("none"),
  irrigationType: text("irrigation_type").default("none"),
  mulched: integer("mulched").default(0),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const plants = sqliteTable("plants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  variety: text("variety"),
  description: text("description"),
  category: text("category"),
  family: text("family"),
  zoneMin: text("zone_min"),
  zoneMax: text("zone_max"),
  sunRequirement: text("sun_requirement"),
  daysToHarvest: integer("days_to_harvest"),
  spacingInches: integer("spacing_inches"),
  indoorStartWeeksBeforeFrost: integer("indoor_start_weeks_before_frost"),
  directSowWeeksBeforeFrost: integer("direct_sow_weeks_before_frost"),
  transplantWeeksAfterFrost: integer("transplant_weeks_after_frost"),
  companions: text("companions", { mode: "json" }),
  incompatible: text("incompatible", { mode: "json" }),
  successionIntervalWeeks: integer("succession_interval_weeks"),
  waterNeeds: text("water_needs"),
  frostTolerance: text("frost_tolerance"),
  growthHabit: text("growth_habit"),
  matureHeightInches: integer("mature_height_inches"),
  rootDepth: text("root_depth"),
  expectedYieldPerPlant: real("expected_yield_per_plant"),
  expectedYieldUnit: text("expected_yield_unit"),
  seedViabilityYears: integer("seed_viability_years"),
  minSoilTempF: integer("min_soil_temp_f"),
  gddBaseTemp: integer("gdd_base_temp"),
  gddToHarvest: integer("gdd_to_harvest"),
  nitrogenFixing: integer("nitrogen_fixing"),
  commonPests: text("common_pests", { mode: "json" }),
  commonDiseases: text("common_diseases", { mode: "json" }),
  harvestWindowDays: integer("harvest_window_days"),
  storageLifeDays: integer("storage_life_days"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const plantings = sqliteTable("plantings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plantId: integer("plant_id")
    .notNull()
    .references(() => plants.id),
  yardElementId: integer("yard_element_id")
    .notNull()
    .references(() => yardElements.id, { onDelete: "cascade" }),
  plantedDate: text("planted_date"),
  status: text("status").default("planned"),
  expectedHarvestDate: text("expected_harvest_date"),
  quantity: integer("quantity").default(1),
  notes: text("notes"),
  season: text("season"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const logEntries = sqliteTable("log_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plantingId: integer("planting_id").references(() => plantings.id),
  yardElementId: integer("yard_element_id").references(() => yardElements.id),
  date: text("date").notNull(),
  type: text("type").notNull(),
  content: text("content"),
  photoPath: text("photo_path"),
  stage: text("stage"),
  yieldAmount: real("yield_amount"),
  yieldUnit: text("yield_unit"),
  pestDiseaseId: integer("pest_disease_id"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const weatherCache = sqliteTable("weather_cache", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  date: text("date").notNull(),
  data: text("data", { mode: "json" }),
  fetchedAt: text("fetched_at").notNull(),
});

export const seedInventory = sqliteTable("seed_inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plantId: integer("plant_id").references(() => plants.id),
  variety: text("variety"),
  brand: text("brand"),
  purchaseDate: text("purchase_date"),
  expirationDate: text("expiration_date"),
  quantityRemaining: real("quantity_remaining"),
  quantityUnit: text("quantity_unit").default("packets"),
  lotNumber: text("lot_number"),
  notes: text("notes"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const pestDisease = sqliteTable("pest_disease", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  symptoms: text("symptoms"),
  organicTreatments: text("organic_treatments", { mode: "json" }),
  preventionTips: text("prevention_tips", { mode: "json" }),
  affectedPlants: text("affected_plants", { mode: "json" }),
  beneficialPredators: text("beneficial_predators", { mode: "json" }),
  activeMonths: text("active_months", { mode: "json" }),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"),
  recurrence: text("recurrence"),
  recurrenceEndDate: text("recurrence_end_date"),
  completedAt: text("completed_at"),
  plantingId: integer("planting_id").references(() => plantings.id),
  yardElementId: integer("yard_element_id").references(() => yardElements.id),
  taskType: text("task_type"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const soilProfiles = sqliteTable("soil_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  yardElementId: integer("yard_element_id").references(() => yardElements.id),
  testDate: text("test_date"),
  ph: real("ph"),
  nitrogenLevel: text("nitrogen_level"),
  phosphorusLevel: text("phosphorus_level"),
  potassiumLevel: text("potassium_level"),
  organicMatterPct: real("organic_matter_pct"),
  soilType: text("soil_type"),
  notes: text("notes"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});
