PRAGMA foreign_keys = OFF;
--> statement-breakpoint
DROP TABLE `TransactionTable`;
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
	`created_at` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys = ON;
