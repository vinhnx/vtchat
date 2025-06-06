import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './index';

// Load environment variables
config({ path: '.env.local' });

export async function runMigrations() {
    console.log('Running database migrations...');

    try {
        await migrate(db, {
            migrationsFolder: './lib/database/migrations',
        });
        console.log('✅ Database migrations completed successfully!');
    } catch (error) {
        console.error('❌ Database migration failed:', error);
        throw error;
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
