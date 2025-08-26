#!/usr/bin/env node

/**
 * Sync Subscription Data Script
 *
 * This script ensures that users with vt_plus in their plan_slug
 * have corresponding records in the user_subscriptions table.
 *
 * Usage: node scripts/sync-subscription-data.js
 */

import { log } from '@repo/shared/logger';
import { and, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, userSubscriptions } from '../apps/web/lib/database/schema.js';
import { PlanSlug } from '../packages/shared/types/subscription.ts';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL environment variable is required');
    log.error('DATABASE_URL environment variable is required');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function syncSubscriptionData() {
    log.info('Starting subscription data sync');

    try {
        // Find users with vt_plus plan_slug but no subscription record
        log.info('Finding users with vt_plus plan without subscription records');
        const usersWithoutSubscriptions = await db
            .select({
                id: users.id,
                email: users.email,
                planSlug: users.planSlug,
            })
            .from(users)
            .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
            .where(and(eq(users.planSlug, PlanSlug.VT_PLUS), isNull(userSubscriptions.id)));

        if (usersWithoutSubscriptions.length === 0) {
            log.info('All users with vt_plus plan already have subscription records');
            return;
        }

        log.info(
            { userCount: usersWithoutSubscriptions.length },
            'Found users needing subscription records',
        );
        usersWithoutSubscriptions.forEach((user) => {
        });

        // Create subscription records for these users
        for (const user of usersWithoutSubscriptions) {
            const subscriptionData = {
                id: crypto.randomUUID(),
                userId: user.id,
                plan: PlanSlug.VT_PLUS,
                status: SubscriptionStatusEnum.ACTIVE,
                creditsRemaining: 1000,
                creditsUsed: 0,
                monthlyCredits: 1000,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await db.insert(userSubscriptions).values(subscriptionData);

            log.info({ userId: user.id }, 'Created subscription record for user');
        }

        log.info(
            { count: usersWithoutSubscriptions.length },
            'Successfully synced subscription records',
        );
    } catch (error) {
        console.error('❌ Error syncing subscription data:', error);
        log.error({ error }, 'Error syncing subscription data');
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run the sync
syncSubscriptionData();
