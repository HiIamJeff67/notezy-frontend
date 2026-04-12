CREATE TABLE `BlockTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_block_id` text,
	`block_group_id` text NOT NULL,
	`type` text DEFAULT 'paragraph' NOT NULL,
	`props` text DEFAULT '{}' NOT NULL,
	`content` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-04-12T13:07:01.694Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-04-12T13:07:01.694Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `BlockGroupTable` (
	`id` text PRIMARY KEY NOT NULL,
	`block_pack_id` text NOT NULL,
	`prev_block_group_id` text,
	`sync_block_group_id` text,
	`size` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-04-12T13:07:01.700Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-04-12T13:07:01.700Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `block_group_unique_idx_block_pack_id_prev_block_group_id` ON `BlockGroupTable` (`block_pack_id`,`prev_block_group_id`);--> statement-breakpoint
CREATE TABLE `BlockPackTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`block_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-04-12T13:07:01.706Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-04-12T13:07:01.706Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `block_pack_unique_idx_parent_sub_shelf_id_name` ON `BlockPackTable` (`parent_sub_shelf_id`,`name`);--> statement-breakpoint
CREATE TABLE `RootShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`sub_shelf_count` integer DEFAULT 0 NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`last_analyzed_count` integer DEFAULT '"2026-04-12T13:07:01.714Z"' NOT NULL,
	`deleted_at` integer DEFAULT '"2026-04-12T13:07:01.714Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-04-12T13:07:01.714Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-04-12T13:07:01.714Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `root_shelf_unique_idx_owner_id_name` ON `RootShelfTable` (`name`);--> statement-breakpoint
CREATE TABLE `SubShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`root_shelf_id` text NOT NULL,
	`prev_sub_shelf_id` text NOT NULL,
	`path` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-04-12T13:07:01.718Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-04-12T13:07:01.718Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_shelf_unique_idx_name_root_shelf_id_path` ON `SubShelfTable` (`name`,`root_shelf_id`,`path`);--> statement-breakpoint
CREATE TABLE `TransactionTable` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`action_type` text NOT NULL,
	`payload` text NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT '"2026-04-12T13:07:01.724Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_unique_idx_entity_id_entity_type_action_type` ON `TransactionTable` (`entity_id`,`entity_type`,`action_type`);