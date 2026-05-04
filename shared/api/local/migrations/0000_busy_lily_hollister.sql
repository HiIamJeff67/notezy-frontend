CREATE TABLE `BlockTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_block_id` text,
	`block_group_id` text NOT NULL,
	`type` text DEFAULT 'paragraph' NOT NULL,
	`props` text DEFAULT '{}' NOT NULL,
	`content` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.245Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.245Z"' NOT NULL
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
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.250Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.250Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
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
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.254Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.254Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `block_pack_unique_idx_parent_sub_shelf_id_name` ON `BlockPackTable` (`parent_sub_shelf_id`,`name`);--> statement-breakpoint
CREATE TABLE `RootShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_public_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`sub_shelf_count` integer DEFAULT 0 NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`last_analyzed_count` integer DEFAULT '"2026-05-01T12:30:58.256Z"' NOT NULL,
	`deleted_at` integer DEFAULT '"2026-05-01T12:30:58.256Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.256Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.256Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
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
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.258Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.258Z"' NOT NULL
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
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.260Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_unique_idx_entity_id_entity_type_action_type` ON `TransactionTable` (`entity_id`,`entity_type`,`action_type`);--> statement-breakpoint
CREATE TABLE `UserTable` (
	`public_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'Guest' NOT NULL,
	`plan` text DEFAULT 'Free' NOT NULL,
	`status` text DEFAULT 'Online' NOT NULL,
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.249Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-05-01T12:30:58.249Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserTable_name_unique` ON `UserTable` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `UserTable_email_unique` ON `UserTable` (`email`);--> statement-breakpoint
CREATE TABLE `UserAccountTable` (
	`public_id` text PRIMARY KEY NOT NULL,
	`country_code` text,
	`phone_number` text,
	`google_credential` text,
	`discord_credential` text,
	`root_shelf_count` integer DEFAULT 0 NOT NULL,
	`block_pack_count` integer DEFAULT 0 NOT NULL,
	`block_count` integer DEFAULT 0 NOT NULL,
	`material_count` integer DEFAULT 0 NOT NULL,
	`workflow_count` integer DEFAULT 0 NOT NULL,
	`additional_items_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.263Z"' NOT NULL,
	FOREIGN KEY (`public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `UserInfoTable` (
	`public_id` text PRIMARY KEY NOT NULL,
	`avatar_url` text,
	`header` text,
	`introduction` text,
	`gender` text DEFAULT 'PreferNotToSay' NOT NULL,
	`country` text,
	`birth_date` integer DEFAULT '"2026-05-01T12:30:58.267Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.267Z"' NOT NULL,
	FOREIGN KEY (`public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `UserSettingTable` (
	`public_id` text PRIMARY KEY NOT NULL,
	`language` text DEFAULT 'English' NOT NULL,
	`general_setting_code` integer DEFAULT 0 NOT NULL,
	`privacy_setting_code` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT '"2026-05-01T12:30:58.268Z"' NOT NULL,
	FOREIGN KEY (`public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE VIEW `UserDataView` AS select "UserTable"."public_id", "UserTable"."name", "UserTable"."display_name", "UserTable"."email", "UserTable"."role", "UserTable"."plan", "UserTable"."status", "UserInfoTable"."avatar_url", "UserSettingTable"."language", "UserSettingTable"."general_setting_code", "UserSettingTable"."privacy_setting_code", "UserTable"."created_at", "UserTable"."updated_at" from "UserTable" left join "UserInfoTable" on "UserInfoTable"."public_id" = "UserTable"."public_id" left join "UserSettingTable" on "UserSettingTable"."public_id" = "UserTable"."public_id" left join "UserAccountTable" on "UserAccountTable"."public_id" = "UserTable"."public_id";