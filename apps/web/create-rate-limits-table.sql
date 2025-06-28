-- Create user_rate_limits table for Gemini 2.5 Flash Lite rate limiting
CREATE TABLE IF NOT EXISTS "user_rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"daily_request_count" text DEFAULT '0' NOT NULL,
	"minute_request_count" text DEFAULT '0' NOT NULL,
	"last_daily_reset" timestamp DEFAULT now() NOT NULL,
	"last_minute_reset" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_rate_limits_user_id_unique" UNIQUE("user_id")
);

-- Add foreign key constraint
ALTER TABLE "user_rate_limits" 
ADD CONSTRAINT "user_rate_limits_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Add index for performance
CREATE INDEX IF NOT EXISTS "user_model_index" ON "user_rate_limits" USING btree ("user_id","model_id");
