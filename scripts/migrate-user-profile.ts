#!/usr/bin/env bun

/**
 * Migration script to add enhanced user profile fields
 * Run with: bun run scripts/migrate-user-profile.ts
 */

import { log } from '@repo/shared/logger';
import { sql } from 'drizzle-orm';
import { db } from '../apps/web/lib/database';

async function runMigration() {
    // CLI output for user
    console.log('🚀 Starting user profile enhancement migration...');
    log.info('Starting user profile migration');

    try {
        // Read and execute the migration SQL
        console.log('📝 Adding enhanced user profile fields...');
        log.info('Adding enhanced user profile fields');

        await db.execute(sql`
            -- Add enhanced user profile fields
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_marketing BOOLEAN DEFAULT false;
        `);
        log.info('Enhanced user profile fields added');

        console.log('📊 Adding performance indexes...');
        log.info('Adding performance indexes');

        await db.execute(sql`
            -- Add indexes for performance
            CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
            CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
            CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);
        `);
        log.info('Performance indexes added');

        console.log('🔄 Updating timestamps...');
        log.info('Updating timestamps');

        await db.execute(sql`
            -- Update the updated_at field for this migration
            UPDATE users SET updated_at = NOW() WHERE bio IS NULL;
        `);
        log.info('Timestamps updated');

        console.log('✅ Migration completed successfully!');
        console.log('🎉 Enhanced user profile fields are now available:');
        console.log('   - Bio (personal description)');
        console.log('   - Location (city, country)');
        console.log('   - Website (personal/company URL)');
        console.log('   - Company (employer)');
        console.log('   - Job Title (professional role)');
        console.log('   - Timezone, Language, Theme preferences');
        console.log('   - Notification preferences');
        log.info('User profile migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        log.error({ error }, 'User profile migration failed');
        process.exit(1);
    }
}

// Run the migration
runMigration()
    .then(() => {
        console.log('🏁 Migration script completed');
        log.info('Migration script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration script failed:', error);
        log.error({ error }, 'Migration script failed');
        process.exit(1);
    });
