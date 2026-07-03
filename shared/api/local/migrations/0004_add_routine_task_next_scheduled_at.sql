ALTER TABLE `RoutineTaskTable` ADD `next_scheduled_at` integer;
--> statement-breakpoint
UPDATE `RoutineTaskTable`
SET `next_scheduled_at` = `scheduled_at`
WHERE `next_scheduled_at` IS NULL;
