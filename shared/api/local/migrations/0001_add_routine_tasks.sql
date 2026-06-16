CREATE TABLE `RoutineTaskTable` (
  `id` text PRIMARY KEY NOT NULL,
  `station_id` text NOT NULL,
  `title` text DEFAULT 'undefined' NOT NULL,
  `purpose` text NOT NULL,
  `payload` text DEFAULT '{}' NOT NULL,
  `priority` integer DEFAULT 0 NOT NULL,
  `status` text DEFAULT 'Idle' NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `max_attempts` integer DEFAULT 1 NOT NULL,
  `scheduled_at` integer DEFAULT '"2026-06-17T00:00:00.000Z"' NOT NULL,
  `actual_started_at` integer,
  `actual_ended_at` integer,
  `updated_at` integer DEFAULT '"2026-06-17T00:00:00.000Z"' NOT NULL,
  `created_at` integer DEFAULT '"2026-06-17T00:00:00.000Z"' NOT NULL,
  FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `RoutinesToTasksTable` (
  `routine_id` text NOT NULL,
  `task_id` text NOT NULL,
  `created_at` integer DEFAULT '"2026-06-17T00:00:00.000Z"' NOT NULL,
  FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`task_id`) REFERENCES `RoutineTaskTable`(`id`) ON UPDATE no action ON DELETE no action
);
