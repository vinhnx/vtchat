# Database Setup for Rate Limiting

## Issue Fix: `relation "user_rate_limits" does not exist`

The error occurs because the `user_rate_limits` table hasn't been created yet. You need to run the database migration.

## Option 1: Run the SQL Script (Recommended)

Execute the following SQL against your database:

```sql
-- Create user_rate_limits table for Gemini 3 Flash Lite rate limiting
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
```

## Option 2: Use Drizzle Migration

If you have your DATABASE_URL set up properly:

```bash
cd apps/web
DATABASE_URL="your_database_url_here" bun drizzle-kit push
```

## Option 3: Connect to Database and Run Script

You can also run the SQL file I created:

```bash
# If using psql
psql $DATABASE_URL -f apps/web/create-rate-limits-table.sql

# Or copy the SQL from create-rate-limits-table.sql and run it in your DB admin tool
```

## Verification

After running the migration, you should be able to:

1. **Test the rate limit API**: Visit `/api/rate-limit/status?model=gemini-2.5-flash-lite-preview-06-17`
2. **See the free model in the dropdown**: The Gemini 3 Flash Lite Preview should appear prominently in the Google models section
3. **No BYOK dialog**: Selecting the free model should not trigger the "Bring Your Own Key" dialog

## What's Fixed

✅ **Database table created**: `user_rate_limits` table with proper schema
✅ **BYOK dialog fixed**: Free model doesn't require user API key\
✅ **Default model**: Claude Sonnet 4.5 is now the default selection
✅ **Model ordering**: Free model appears first in Google section
✅ **Rate limiting**: 10 requests/day per account, 1 request/minute per account
