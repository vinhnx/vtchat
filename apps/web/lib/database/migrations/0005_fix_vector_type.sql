-- Fix vector type for proper pgvector format
-- Drop existing table if it exists (since this is likely a development database)
DROP TABLE IF EXISTS "embeddings" CASCADE;

-- Recreate embeddings table with proper vector type
CREATE TABLE "embeddings" (
    "id" varchar(191) PRIMARY KEY,
    "resource_id" varchar(191) NOT NULL,
    "content" text NOT NULL,
    "embedding" vector(768) NOT NULL,
    CONSTRAINT "embeddings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE
);

-- Create HNSW index for efficient vector similarity search
CREATE INDEX "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);
