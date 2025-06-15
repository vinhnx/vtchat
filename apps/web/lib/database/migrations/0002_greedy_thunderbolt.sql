ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "display_username";