CREATE TABLE "vtplus_usage" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"feature" text NOT NULL,
	"period_start" date NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "vtplus_usage" ADD CONSTRAINT "vtplus_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vtplus_usage_lookup_index" ON "vtplus_usage" USING btree ("user_id","feature","period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "vtplus_usage_user_feature_period_unique" ON "vtplus_usage" USING btree ("user_id","feature","period_start");