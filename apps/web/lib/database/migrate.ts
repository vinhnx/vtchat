import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './index';
import { log } from '@repo/shared/logger';

// Load environment variables
config({ path: '.env.local' });

export async function runMigrations() {
    log.info({}, 'Running database migrations...');

    try {
        await migrate(db, {
            migrationsFolder: './lib/database/migrations',
        });
        log.info({}, '✅ Database migrations completed successfully!');
    } catch (error) {
        log.error({ error }, '❌ Database migration failed');
        throw error;
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
