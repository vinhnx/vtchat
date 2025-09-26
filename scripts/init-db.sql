-- VTChat Database Initialization
-- This script runs when the PostgreSQL container starts for the first time

-- Create the vtchat_dev database if it doesn't exist
-- (This is already created by POSTGRES_DB env var, but keeping for clarity)

-- Set up any initial database configuration
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy';
END;
$$ LANGUAGE plpgsql;