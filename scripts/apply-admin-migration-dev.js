/**
 * Apply admin migration to development database
 * Usage: bun run scripts/apply-admin-migration-dev.js
 */

/* eslint-disable no-console */

import { readFileSync } from 'node:fs';
import { Client } from 'pg';

async function applyAdminMigration() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is required');
        console.error('Please set it in your .env.local file');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read the SQL migration file
        const migrationSql = readFileSync('./scripts/apply-admin-migration-dev.sql', 'utf8');

        // Split by statements and execute each one
        const statements = migrationSql
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt && !stmt.startsWith('--'));

        console.log(`Executing ${statements.length} SQL statements...`);

        for (const statement of statements) {
            if (statement) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await client.query(statement);
            }
        }

        console.log('✅ Admin migration applied successfully');
    } catch (error) {
        console.error('❌ Error applying admin migration:', error.message);
        if (error.message.includes('already exists')) {
            console.log('⚠️  Migration may have already been applied');
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log('✅ Database connection closed');
    }
}

// Run the migration
applyAdminMigration().then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
});
