/**
 * Apply admin migration to development database
 * Usage: bun run scripts/apply-admin-migration-dev.js
 */

import { readFileSync } from 'node:fs';
import { Client } from 'pg';

async function applyAdminMigration() {
    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL environment variable is required');
        console.log('Please set your development database URL and run again.');
        console.log(
            'Example: DATABASE_URL="postgresql://..." bun run scripts/apply-admin-migration-dev.js'
        );
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to development database');

        // Read the SQL migration file
        const migrationSql = readFileSync('./scripts/apply-admin-migration-dev.sql', 'utf8');

        // Split by statements and execute each one
        const statements = migrationSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('--'));

        console.log(`📝 Executing ${statements.length} migration statements...`);

        for (const statement of statements) {
            if (statement) {
                console.log(`   Running: ${statement.substring(0, 60)}...`);
                await client.query(statement);
            }
        }

        console.log('✅ Admin migration applied successfully to development database!');
        console.log('🚀 You can now restart your dev server: bun dev');
    } catch (error) {
        console.error('❌ Error applying admin migration:', error.message);
        if (error.message.includes('already exists')) {
            console.log('ℹ️  Some columns may already exist - this is normal.');
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

// Run the migration
applyAdminMigration().then(() => {
    process.exit(0);
});
