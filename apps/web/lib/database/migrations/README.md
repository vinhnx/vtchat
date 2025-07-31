# Database Migrations

This directory contains the database migration files for the VTChat application.

## Migration History

### 0011_add_resources_table.sql (2025-01-31)

- **Issue**: The `resources` table was defined in the schema but missing from the database
- **Fix**: Added the missing `resources` table with proper foreign key constraints
- **Impact**: Fixes the admin analytics route error "relation 'resources' does not exist"
- **Applied to**: Both dev (lucky-cake-27376292) and production (autumn-block-60790575) databases

## Running Migrations

To generate new migrations:

```bash
cd apps/web
bun run generate
```

To apply migrations:

```bash
cd apps/web
bunx drizzle-kit migrate
```

## Notes

- The resources table stores user-generated content/resources
- It has a foreign key relationship to the users table with cascade delete
- The table was manually created using Neon MCP tools to fix the immediate issue
- This migration file documents the change for future reference
