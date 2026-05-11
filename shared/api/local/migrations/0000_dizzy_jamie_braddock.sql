CREATE TABLE `BlockTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_block_id` text,
	`block_group_id` text NOT NULL,
	`type` text DEFAULT 'paragraph' NOT NULL,
	`props` text DEFAULT '{}' NOT NULL,
	`content` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.075Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.075Z"' NOT NULL,
	FOREIGN KEY (`block_group_id`) REFERENCES `BlockGroupTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent_block_id`) REFERENCES `BlockTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `BlockGroupTable` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_public_id` text NOT NULL,
	`block_pack_id` text NOT NULL,
	`prev_block_group_id` text,
	`sync_block_group_id` text,
	`size` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.079Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.079Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`block_pack_id`) REFERENCES `BlockPackTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`prev_block_group_id`) REFERENCES `BlockGroupTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `block_group_unique_idx_block_pack_id_prev_block_group_id` ON `BlockGroupTable` (`block_pack_id`,`prev_block_group_id`) WHERE "BlockGroupTable"."deleted_at" is not null;--> statement-breakpoint
CREATE TABLE `BlockPackTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`block_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.084Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.084Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `block_pack_unique_idx_parent_sub_shelf_id_name` ON `BlockPackTable` (`parent_sub_shelf_id`,`name`) WHERE "BlockPackTable"."deleted_at" is not null;--> statement-breakpoint
CREATE TABLE `RootShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_public_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`sub_shelf_count` integer DEFAULT 0 NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`last_analyzed_count` integer DEFAULT '"2026-05-11T13:48:18.088Z"' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.088Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.088Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `root_shelf_unique_idx_name_owner_id` ON `RootShelfTable` (`name`,`owner_public_id`) WHERE "RootShelfTable"."deleted_at" is not null;--> statement-breakpoint
CREATE TABLE `SubShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`root_shelf_id` text NOT NULL,
	`prev_sub_shelf_id` text,
	`path` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.091Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.091Z"' NOT NULL,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`prev_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_shelf_unique_idx_name_root_shelf_id_path` ON `SubShelfTable` (`name`,`root_shelf_id`,`path`) WHERE "SubShelfTable"."deleted_at" is not null;--> statement-breakpoint
CREATE TABLE `TestTable` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'unknown' NOT NULL,
	`content` text,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.112Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.112Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `TransactionTable` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_public_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`action_type` text NOT NULL,
	`payload` text NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.117Z"' NOT NULL,
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
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.122Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.122Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserTable_name_unique` ON `UserTable` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `UserTable_email_unique` ON `UserTable` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_unique_idx_is_logged_in` ON `UserTable` (`is_logged_in`) WHERE "UserTable"."is_logged_in" = ?;--> statement-breakpoint
CREATE TABLE `UsersToShelvesTable` (
	`owner_public_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`permission` text,
	`updated_at` integer DEFAULT '"2026-05-11T13:48:18.126Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-11T13:48:18.126Z"' NOT NULL,
	PRIMARY KEY(`owner_public_id`, `root_shelf_id`),
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_shelves_unique_idx_root_shelf_owner` ON `UsersToShelvesTable` (`root_shelf_id`) WHERE "UsersToShelvesTable"."permission" = ?;