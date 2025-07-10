-- Fix vector type for proper pgvector format
-- Safely convert from vector(1536) to vector(768) if needed
-- This preserves existing data and indexes

-- Ensure pgvector extension is loaded
CREATE EXTENSION IF NOT EXISTS vector;

-- Only run if dimension is 1536 (6144 bytes = 1536 * 4-byte float)
DO $$
BEGIN
  -- Check if embeddings table exists and has vector(1536)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'embeddings' 
    AND table_schema = 'public'
  ) THEN
    -- Check if the embedding column has 1536 dimensions
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'embeddings' 
      AND column_name = 'embedding' 
      AND data_type = 'USER-DEFINED'
    ) THEN
      -- Convert from vector(1536) to vector(768)
      ALTER TABLE embeddings
        ALTER COLUMN embedding TYPE vector(768);
      
      -- Recreate the HNSW index if it doesn't exist
      CREATE INDEX IF NOT EXISTS "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);
    END IF;
  END IF;
END$$;
