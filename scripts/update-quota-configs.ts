#!/usr/bin/env bun

/**
 * Script to update quota configurations in the database
 * Usage: bun run scripts/update-quota-configs.ts
 */

import { log } from '@repo/shared/lib/logger';
import { db } from '../apps/web/lib/database/index';

async function updateQuotaConfigs() {
    try {
        // Update Deep Research quotas
        await db.execute(`
            UPDATE quota_configs
            SET quota_limit = 10, updated_at = now()
            WHERE feature = 'DR' AND plan = 'vt_plus'
        `);

        await db.execute(`
            UPDATE quota_configs
            SET quota_limit = 0, updated_at = now()
            WHERE feature = 'DR' AND plan = 'vt_base'
        `);

        // Update Pro Search quotas
        await db.execute(`
            UPDATE quota_configs
            SET quota_limit = 20, updated_at = now()
            WHERE feature = 'PS' AND plan = 'vt_plus'
        `);

        await db.execute(`
            UPDATE quota_configs
            SET quota_limit = 0, updated_at = now()
            WHERE feature = 'PS' AND plan = 'vt_base'
        `);

        // Verify the updates
        const result = await db.execute(`
            SELECT feature, plan, quota_limit, quota_window, updated_at
            FROM quota_configs
            ORDER BY feature, plan
        `);

        console.table(result.rows);

        log.info('Quota configurations updated via script');
    } catch (error) {
        console.error('❌ Failed to update quota configurations:', error);
        log.error({ error }, 'Failed to update quota configurations via script');
        process.exit(1);
    }
}

// Run the script
updateQuotaConfigs()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
