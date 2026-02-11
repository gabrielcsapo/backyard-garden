import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  zipCode: text("zip_code"),
  zone: text("zone"),
  lastFrostDate: text("last_frost_date"),
  firstFrostDate: text("first_frost_date"),
});

export const yards = sqliteTable("yards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  widthFt: integer("width_ft").notNull(),
  heightFt: integer("height_ft").notNull(),
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
});
