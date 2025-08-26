import { log } from '@repo/shared/logger';
import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './index';

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
        log.error(
            { 
                error, 
                migrationsFolder: './lib/database/migrations',
                operation: 'database_migration',
                nodeEnv: process.env.NODE_ENV,
                databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
            }, 
            '❌ Database migration failed'
        );
        throw error;
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            log.info({}, 'Migration process completed successfully, exiting');
            process.exit(0);
        })
        .catch((error) => {
            log.error(
                { 
                    error, 
                    operation: 'migration_process_exit',
                    nodeEnv: process.env.NODE_ENV
                }, 
                'Migration process failed, exiting with error code'
            );
            process.exit(1);
        });
}
