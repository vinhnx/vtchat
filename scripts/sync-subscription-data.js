#!/usr/bin/env node

/**
 * Sync Subscription Data Script
 *
 * This script ensures that users with vt_plus in their plan_slug
 * have corresponding records in the user_subscriptions table.
 *
 * Usage: node scripts/sync-subscription-data.js
 */

import { and, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, userSubscriptions } from '../apps/web/lib/database/schema.js';
import { PlanSlug } from '../packages/shared/types/subscription.ts';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function syncSubscriptionData() {
    console.log('🔄 Starting subscription data sync...');

    try {
        // Find users with vt_plus plan_slug but no subscription record
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
            console.log('✅ All users with vt_plus plan_slug already have subscription records');
            return;
        }

        console.log(
            `📋 Found ${usersWithoutSubscriptions.length} users that need subscription records:`
        );
        usersWithoutSubscriptions.forEach(user => {
            console.log(`   - ${user.email} (${user.id})`);
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
            console.log(`✅ Created subscription record for ${user.email}`);
        }

        console.log(
            `🎉 Successfully synced ${usersWithoutSubscriptions.length} subscription records`
        );
    } catch (error) {
        console.error('❌ Error syncing subscription data:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run the sync
syncSubscriptionData();
