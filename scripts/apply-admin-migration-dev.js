/**
 * Apply admin migration to development database
 * Usage: bun run scripts/apply-admin-migration-dev.js
 */

import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import { log } from '@repo/shared/lib/logger';

async function applyAdminMigration() {
    if (!process.env.DATABASE_URL) {
        log.error('❌ DATABASE_URL environment variable is required. Please set it in your .env.local file');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        log.info('✅ Connected to database');

        // Read the SQL migration file
        const migrationSql = readFileSync('./scripts/apply-admin-migration-dev.sql', 'utf8');

        // Split by statements and execute each one
        const statements = migrationSql
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt && !stmt.startsWith('--'));

        log.info({ statementCount: statements.length }, 'Executing SQL statements');

        for (const statement of statements) {
            if (statement) {
                log.debug({ statement: statement.substring(0, 50) }, 'Executing SQL statement');
                await client.query(statement);
            }
        }

        log.info('✅ Admin migration applied successfully');
    } catch (error) {
        log.error({ error: error.message }, '❌ Error applying admin migration');
        if (error.message.includes('already exists')) {
            log.warn('⚠️  Migration may have already been applied');
        }
        process.exit(1);
    } finally {
        await client.end();
        log.info('✅ Database connection closed');
    }
}

// Run the migration
applyAdminMigration().then(() => {
    log.info('🎉 Migration completed successfully');
    process.exit(0);
});
