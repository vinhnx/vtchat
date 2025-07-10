-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create resources table for RAG knowledge base
CREATE TABLE IF NOT EXISTS "resources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create embeddings table for RAG vector search
CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"resource_id" varchar(191) NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768) NOT NULL
);

-- Create user_rate_limits table for VT+ usage tracking
CREATE TABLE IF NOT EXISTS "user_rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"daily_request_count" text DEFAULT '0' NOT NULL,
	"minute_request_count" text DEFAULT '0' NOT NULL,
	"last_daily_reset" timestamp DEFAULT now() NOT NULL,
	"last_minute_reset" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "resources" ADD CONSTRAINT "resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_rate_limits" ADD CONSTRAINT "user_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);
CREATE INDEX IF NOT EXISTS "user_model_index" ON "user_rate_limits" USING btree ("user_id","model_id");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_model" ON "user_rate_limits" USING btree ("user_id","model_id");
