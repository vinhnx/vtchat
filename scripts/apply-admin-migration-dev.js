/**
 * Apply admin migration to development database
 * Usage: bun run scripts/apply-admin-migration-dev.js
 */

import { readFileSync } from "node:fs";
import { Client } from "pg";

async function applyAdminMigration() {
    if (!process.env.DATABASE_URL) {
        log.info("❌ DATABASE_URL environment variable is required");
        log.info("Please set your development database URL and run again.");
        log.info(
            'Example: DATABASE_URL="postgresql://..." bun run scripts/apply-admin-migration-dev.js',
        );
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        log.info("✅ Connected to development database");

        // Read the SQL migration file
        const migrationSql = readFileSync("./scripts/apply-admin-migration-dev.sql", "utf8");

        // Split by statements and execute each one
        const statements = migrationSql
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt && !stmt.startsWith("--"));

        log.info(`📝 Executing ${statements.length} migration statements...`);

        for (const statement of statements) {
            if (statement) {
                log.info(`   Running: ${statement.substring(0, 60)}...`);
                await client.query(statement);
            }
        }

        log.info("✅ Admin migration applied successfully to development database!");
        log.info("🚀 You can now restart your dev server: bun dev");
    } catch (error) {
        log.error("❌ Error applying admin migration:", error.message);
        if (error.message.includes("already exists")) {
            log.info("ℹ️  Some columns may already exist - this is normal.");
        }
        process.exit(1);
    } finally {
        await client.end();
        log.info("🔌 Database connection closed");
    }
}

// Run the migration
applyAdminMigration().then(() => {
    process.exit(0);
});
