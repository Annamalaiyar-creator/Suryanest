CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`payload` text NOT NULL,
	`attachment` text,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
