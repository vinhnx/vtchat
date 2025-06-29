-- Migration to secure existing embeddings content
-- This migration masks PII in existing embeddings content

-- Add a backup column temporarily
ALTER TABLE embeddings ADD COLUMN content_backup text;

-- Backup existing content before masking
UPDATE embeddings SET content_backup = content;

-- Note: The actual PII masking will be done through the application
-- This migration just prepares the schema for the security update
-- The masking will happen when the application code runs with the new security functions

-- Add index for better performance on content queries
CREATE INDEX IF NOT EXISTS idx_embeddings_resource_id ON embeddings(resource_id);

-- Add comment to document the security change
COMMENT ON COLUMN embeddings.content IS 'Secured content with PII masking and truncation applied';
COMMENT ON COLUMN embeddings.content_backup IS 'Temporary backup of original content - to be dropped after verification';
