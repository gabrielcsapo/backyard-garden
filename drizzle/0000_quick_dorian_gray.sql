CREATE TABLE `log_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`planting_id` integer,
	`yard_element_id` integer,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`content` text,
	`photo_path` text,
	`stage` text,
	`yield_amount` real,
	`yield_unit` text,
	FOREIGN KEY (`planting_id`) REFERENCES `plantings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`yard_element_id`) REFERENCES `yard_elements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plantings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plant_id` integer NOT NULL,
	`yard_element_id` integer NOT NULL,
	`planted_date` text,
	`status` text DEFAULT 'planned',
	`expected_harvest_date` text,
	`quantity` integer DEFAULT 1,
	`notes` text,
	`season` text,
	FOREIGN KEY (`plant_id`) REFERENCES `plants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`yard_element_id`) REFERENCES `yard_elements`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `plants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`variety` text,
	`description` text,
	`category` text,
	`family` text,
	`zone_min` text,
	`zone_max` text,
	`sun_requirement` text,
	`days_to_harvest` integer,
	`spacing_inches` integer,
	`indoor_start_weeks_before_frost` integer,
	`direct_sow_weeks_before_frost` integer,
	`transplant_weeks_after_frost` integer,
	`companions` text,
	`incompatible` text,
	`succession_interval_weeks` integer
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`zip_code` text,
	`zone` text,
	`last_frost_date` text,
	`first_frost_date` text
);
--> statement-breakpoint
CREATE TABLE `yard_elements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`yard_id` integer NOT NULL,
	`shape_type` text NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`label` text,
	`sun_exposure` text DEFAULT 'full_sun',
	`rotation` integer DEFAULT 0,
	`metadata` text,
	FOREIGN KEY (`yard_id`) REFERENCES `yards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `yards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`width_ft` integer NOT NULL,
	`height_ft` integer NOT NULL
);
