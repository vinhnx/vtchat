CREATE TABLE "quota_configs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"feature" text NOT NULL,
	"plan" text NOT NULL,
	"quota_limit" integer DEFAULT 0 NOT NULL,
	"quota_window" text DEFAULT 'daily' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quota_configs_feature_plan_unique" UNIQUE("feature","plan")
);
--> statement-breakpoint
DROP INDEX "cost_tracking_index";--> statement-breakpoint
CREATE INDEX "idx_quota_configs_feature_plan" ON "quota_configs" USING btree ("feature","plan") WHERE "quota_configs"."is_active" = $1;--> statement-breakpoint
CREATE INDEX "idx_quota_configs_updated" ON "quota_configs" USING btree ("updated_at" desc);--> statement-breakpoint
ALTER TABLE "provider_usage" DROP COLUMN "estimated_cost_cents";