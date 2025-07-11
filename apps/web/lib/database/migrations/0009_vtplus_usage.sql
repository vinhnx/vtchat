-- Create vtplus_usage table for VT+ feature quota tracking
CREATE TABLE IF NOT EXISTS "vtplus_usage" (
    "id" bigserial PRIMARY KEY,
    "user_id" text NOT NULL,
    "feature" text NOT NULL,
    "period_start" date NOT NULL,
    "used" integer NOT NULL DEFAULT 0,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "vtplus_usage" ADD CONSTRAINT "vtplus_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create unique constraint for user/feature/period combination
DO $$ BEGIN
 ALTER TABLE "vtplus_usage" ADD CONSTRAINT "vtplus_usage_user_feature_period_unique" UNIQUE ("user_id", "feature", "period_start");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS "vtplus_usage_lookup_index" ON "vtplus_usage" USING btree ("user_id", "feature", "period_start");
