-- Add additional constraints for VT+ usage table as recommended by Oracle review
-- These constraints improve data integrity and prevent invalid states

-- Add CHECK constraint to ensure used >= 0
DO $$ BEGIN
 ALTER TABLE "vtplus_usage" ADD CONSTRAINT "vtplus_usage_used_non_negative" CHECK (used >= 0);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add CHECK constraint for valid feature values
DO $$ BEGIN
 ALTER TABLE "vtplus_usage" ADD CONSTRAINT "vtplus_usage_feature_valid" CHECK (feature IN ('DR', 'PS', 'RAG'));
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add CHECK constraint to prevent unreasonably high usage (safety guard)
DO $$ BEGIN
 ALTER TABLE "vtplus_usage" ADD CONSTRAINT "vtplus_usage_used_reasonable" CHECK (used <= 1000000);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
