CREATE TABLE "provider_usage" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"request_timestamp" timestamp DEFAULT now() NOT NULL,
	"estimated_cost_cents" integer NOT NULL,
	"provider" text DEFAULT 'gemini' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_rate_limits" DROP CONSTRAINT "user_rate_limits_user_id_unique";--> statement-breakpoint
ALTER TABLE "provider_usage" ADD CONSTRAINT "provider_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_time_index" ON "provider_usage" USING btree ("user_id","request_timestamp");--> statement-breakpoint
CREATE INDEX "monthly_usage_index" ON "provider_usage" USING btree ("request_timestamp","provider");--> statement-breakpoint
CREATE INDEX "cost_tracking_index" ON "provider_usage" USING btree ("provider","request_timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_model" ON "user_rate_limits" USING btree ("user_id","model_id");