CREATE TABLE `StationTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`routine_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-06-12T03:13:41.153Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.153Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RoutineTag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`color` text(7) DEFAULT '#FFFFFF' NOT NULL,
	`icon` text,
	`updated_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ItemTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`type` text NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-06-12T03:13:41.161Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.161Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutineTable` (
	`id` text PRIMARY KEY NOT NULL,
	`station_id` text NOT NULL,
	`title` text DEFAULT 'undefined' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`scheduled_start_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	`scheduled_end_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	`period` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutinesToItemsTable` (
	`routine_id` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `ItemTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutinesToTags` (
	`routine_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `RoutineTag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `UsersToTagsTable` (
	`user_public_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`permission` text,
	`updated_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.154Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `tag_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `RoutineTag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_routine_tags_unique_idx_routine_owner` ON `UsersToTagsTable` (`tag_id`) WHERE "UsersToTagsTable"."permission" = ?;
--> statement-breakpoint
CREATE TABLE `UsersToStationsTable` (
	`user_public_id` text NOT NULL,
	`station_id` text NOT NULL,
	`permission` text NOT NULL,
	`updated_at` integer DEFAULT '"2026-06-12T03:13:41.153Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-06-12T03:13:41.153Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `station_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_stations_unique_idx_station_owner` ON `UsersToStationsTable` (`station_id`) WHERE "UsersToStationsTable"."permission" = ?;
