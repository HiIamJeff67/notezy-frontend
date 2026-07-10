CREATE TABLE `BlockTable` (
	`id` text PRIMARY KEY NOT NULL,
	`block_pack_id` text NOT NULL,
	`parent_block_id` text,
	`prev_block_id` text,
	`next_block_id` text,
	`type` text DEFAULT 'paragraph' NOT NULL,
	`props` text DEFAULT '{}' NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:04.894Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:04.894Z"' NOT NULL,
	FOREIGN KEY (`block_pack_id`) REFERENCES `BlockPackTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent_block_id`) REFERENCES `BlockTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`prev_block_id`) REFERENCES `BlockTable`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`next_block_id`) REFERENCES `BlockTable`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `BlockPackTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`block_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:04.904Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:04.904Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ItemTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`type` text NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.033Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.033Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RootShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`sub_shelf_count` integer DEFAULT 0 NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`last_analyzed_count` integer DEFAULT '"2026-07-09T15:50:04.918Z"' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:04.919Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:04.919Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RoutineTable` (
	`id` text PRIMARY KEY NOT NULL,
	`station_id` text NOT NULL,
	`title` text DEFAULT 'undefined' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`scheduled_start_at` integer DEFAULT '"2026-07-09T15:50:05.028Z"' NOT NULL,
	`scheduled_end_at` integer DEFAULT '"2026-07-09T15:50:05.028Z"' NOT NULL,
	`period` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.028Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.028Z"' NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutinesToItemsTable` (
	`routine_id` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.028Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `ItemTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutinesToTags` (
	`routine_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.028Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `RoutineTag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutinesToTasksTable` (
	`routine_id` text NOT NULL,
	`task_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `RoutineTaskTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutineTag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`color` text(7) DEFAULT '#FFFFFF' NOT NULL,
	`icon` text,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RoutineTaskTable` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`title` text DEFAULT 'undefined' NOT NULL,
	`purpose` text NOT NULL,
	`cost_unit` integer DEFAULT 0 NOT NULL,
	`payload` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Idle' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 1 NOT NULL,
	`period` text,
	`next_scheduled_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`scheduled_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`actual_started_at` integer,
	`actual_ended_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `StationTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`routine_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SubShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`root_shelf_id` text NOT NULL,
	`prev_sub_shelf_id` text,
	`path` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.033Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.033Z"' NOT NULL,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`prev_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `TestTable` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'unknown' NOT NULL,
	`content` text,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.040Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.040Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `TransactionTable` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_public_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`action_type` text NOT NULL,
	`body` text NOT NULL,
	`affected` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.046Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `UserTable` (
	`public_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'Online' NOT NULL,
	`is_logged_in` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserTable_name_unique` ON `UserTable` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `UserTable_email_unique` ON `UserTable` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_unique_idx_is_logged_in` ON `UserTable` (`is_logged_in`) WHERE "UserTable"."is_logged_in" = ?;--> statement-breakpoint
CREATE TABLE `UsersToTagsTable` (
	`user_public_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`permission` text,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `tag_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `RoutineTag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_routine_tags_unique_idx_routine_owner` ON `UsersToTagsTable` (`tag_id`) WHERE "UsersToTagsTable"."permission" = ?;--> statement-breakpoint
CREATE TABLE `UsersToShelvesTable` (
	`user_public_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`permission` text NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.052Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.052Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `root_shelf_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_shelves_unique_idx_root_shelf_owner` ON `UsersToShelvesTable` (`root_shelf_id`) WHERE "UsersToShelvesTable"."permission" = ?;--> statement-breakpoint
CREATE TABLE `UsersToStationsTable` (
	`user_public_id` text NOT NULL,
	`station_id` text NOT NULL,
	`permission` text NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-07-09T15:50:05.027Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `station_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_stations_unique_idx_station_owner` ON `UsersToStationsTable` (`station_id`) WHERE "UsersToStationsTable"."permission" = ?;