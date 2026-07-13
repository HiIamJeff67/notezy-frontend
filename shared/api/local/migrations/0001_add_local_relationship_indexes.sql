CREATE INDEX IF NOT EXISTS `block_block_pack_idx` ON `BlockTable` (`block_pack_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `block_parent_idx` ON `BlockTable` (`parent_block_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `block_pack_parent_sub_shelf_idx` ON `BlockPackTable` (`parent_sub_shelf_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `item_parent_sub_shelf_idx` ON `ItemTable` (`parent_sub_shelf_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `item_root_shelf_idx` ON `ItemTable` (`root_shelf_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routine_station_idx` ON `RoutineTable` (`station_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routine_task_routine_idx` ON `RoutineTaskTable` (`routine_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sub_shelf_root_shelf_idx` ON `SubShelfTable` (`root_shelf_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sub_shelf_prev_idx` ON `SubShelfTable` (`prev_sub_shelf_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routines_to_items_routine_idx` ON `RoutinesToItemsTable` (`routine_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routines_to_items_item_idx` ON `RoutinesToItemsTable` (`item_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routines_to_tags_routine_idx` ON `RoutinesToTags` (`routine_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routines_to_tags_tag_idx` ON `RoutinesToTags` (`tag_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routines_to_tasks_routine_idx` ON `RoutinesToTasksTable` (`routine_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `routines_to_tasks_task_idx` ON `RoutinesToTasksTable` (`task_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transaction_owner_retry_idx` ON `TransactionTable` (`owner_public_id`, `retry_count`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `users_to_routine_tags_tag_idx` ON `UsersToTagsTable` (`tag_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `users_to_shelves_root_shelf_idx` ON `UsersToShelvesTable` (`root_shelf_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `users_to_stations_station_idx` ON `UsersToStationsTable` (`station_id`);
