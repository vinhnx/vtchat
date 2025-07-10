-- Migration to secure existing embeddings content
-- This migration prepares the schema for PII masking

-- Add a backup column temporarily (NULL by default to avoid large updates)
DO $$ BEGIN
    ALTER TABLE embeddings ADD COLUMN content_backup text;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Note: The actual PII masking and backup will be done through the application
-- in batches to avoid locking large tables. This migration just prepares the schema.
-- The masking will happen when the application code runs with the new security functions

-- Add index for better performance on content queries
CREATE INDEX IF NOT EXISTS idx_embeddings_resource_id ON embeddings(resource_id);

-- Add comment to document the security change
COMMENT ON COLUMN embeddings.content IS 'Secured content with PII masking and truncation applied';
COMMENT ON COLUMN embeddings.content_backup IS 'Temporary backup of original content - to be dropped after verification';
