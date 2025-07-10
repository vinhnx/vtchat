-- Create provider_usage table for cost tracking
CREATE TABLE IF NOT EXISTS "provider_usage" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"request_timestamp" timestamp DEFAULT now() NOT NULL,
	"estimated_cost_cents" integer NOT NULL,
	"provider" text DEFAULT 'gemini' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "provider_usage" ADD CONSTRAINT "provider_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "user_time_index" ON "provider_usage" USING btree ("user_id","request_timestamp");
CREATE INDEX IF NOT EXISTS "monthly_usage_index" ON "provider_usage" USING btree ("request_timestamp","provider");
CREATE INDEX IF NOT EXISTS "cost_tracking_index" ON "provider_usage" USING btree ("provider","request_timestamp");