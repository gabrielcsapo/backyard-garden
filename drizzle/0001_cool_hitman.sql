CREATE TABLE `pest_disease` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`symptoms` text,
	`organic_treatments` text,
	`prevention_tips` text,
	`affected_plants` text,
	`beneficial_predators` text,
	`active_months` text
);
--> statement-breakpoint
CREATE TABLE `seed_inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plant_id` integer,
	`variety` text,
	`brand` text,
	`purchase_date` text,
	`expiration_date` text,
	`quantity_remaining` real,
	`quantity_unit` text DEFAULT 'packets',
	`lot_number` text,
	`notes` text,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`plant_id`) REFERENCES `plants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `soil_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`yard_element_id` integer,
	`test_date` text,
	`ph` real,
	`nitrogen_level` text,
	`phosphorus_level` text,
	`potassium_level` text,
	`organic_matter_pct` real,
	`soil_type` text,
	`notes` text,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`yard_element_id`) REFERENCES `yard_elements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_date` text,
	`recurrence` text,
	`recurrence_end_date` text,
	`completed_at` text,
	`planting_id` integer,
	`yard_element_id` integer,
	`task_type` text,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`planting_id`) REFERENCES `plantings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`yard_element_id`) REFERENCES `yard_elements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `weather_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`date` text NOT NULL,
	`data` text,
	`fetched_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `log_entries` ADD `pest_disease_id` integer;--> statement-breakpoint
ALTER TABLE `log_entries` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `plantings` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `water_needs` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `frost_tolerance` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `growth_habit` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `mature_height_inches` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `root_depth` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `expected_yield_per_plant` real;--> statement-breakpoint
ALTER TABLE `plants` ADD `expected_yield_unit` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `seed_viability_years` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `min_soil_temp_f` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `gdd_base_temp` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `gdd_to_harvest` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `nitrogen_fixing` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `common_pests` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `common_diseases` text;--> statement-breakpoint
ALTER TABLE `plants` ADD `harvest_window_days` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `storage_life_days` integer;--> statement-breakpoint
ALTER TABLE `plants` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `settings` ADD `longitude` real;--> statement-breakpoint
ALTER TABLE `settings` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `yard_elements` ADD `season_extension` text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `yard_elements` ADD `irrigation_type` text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `yard_elements` ADD `mulched` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `yard_elements` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `yards` ADD `updated_at` text;