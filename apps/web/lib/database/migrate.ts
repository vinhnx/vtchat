import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './index';
import { logger } from '@repo/shared/logger';

// Load environment variables
config({ path: '.env.local' });

export async function runMigrations() {
    logger.info('Running database migrations...');

    try {
        await migrate(db, {
            migrationsFolder: './lib/database/migrations',
        });
        logger.info('✅ Database migrations completed successfully!');
    } catch (error) {
        logger.error({ error }, '❌ Database migration failed');
        throw error;
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
