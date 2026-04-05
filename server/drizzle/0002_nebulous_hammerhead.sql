CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`script_id` integer NOT NULL,
	`interval` text,
	`runs_left` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `triggers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer NOT NULL,
	`trigger_at` integer NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `files` ADD `schedule_id` integer;