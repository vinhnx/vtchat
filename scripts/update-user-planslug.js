#!/usr/bin/env node

/**
 * Script to update user planSlug in database to match VT+ access
 * This ensures consistency between subscription records and user.planSlug field
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from apps/web/.env.local
config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

async function updateUserPlanSlug() {
    console.log('Starting user planSlug update...');

    try {
        // Dynamic imports to ensure env vars are loaded first
        const { db } = await import('../apps/web/lib/database/index.js');
        const { users, userSubscriptions } = await import('../apps/web/lib/database/schema.js');
        const { PlanSlug } = await import('../packages/shared/types/subscription.js');
        const { eq, and, isNull, or } = await import('drizzle-orm');
        // Find users with active VT+ subscriptions but undefined/null planSlug
        const usersWithVTPlusAccess = await db
            .select({
                userId: users.id,
                userEmail: users.email,
                currentPlanSlug: users.planSlug,
                subscriptionStatus: userSubscriptions.status,
                subscriptionPlan: userSubscriptions.plan,
            })
            .from(users)
            .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
            .where(
                and(
                    // User has active VT+ subscription
                    eq(userSubscriptions.status, 'active'),
                    eq(userSubscriptions.plan, PlanSlug.VT_PLUS),
                    // But user.planSlug is undefined/null or not VT_PLUS
                    or(
                        isNull(users.planSlug),
                        eq(users.planSlug, ''),
                        eq(users.planSlug, 'undefined')
                    )
                )
            );

        console.log(
            `Found ${usersWithVTPlusAccess.length} users with VT+ access but incorrect planSlug`
        );

        if (usersWithVTPlusAccess.length === 0) {
            console.log('No users need updating');
            return;
        }

        // Display users to be updated
        console.log('\nUsers to update:');
        usersWithVTPlusAccess.forEach((user, index) => {
            console.log(`${index + 1}. ${user.userEmail} (ID: ${user.userId})`);
            console.log(`   Current planSlug: ${user.currentPlanSlug}`);
            console.log(`   Subscription status: ${user.subscriptionStatus}`);
            console.log(`   Subscription plan: ${user.subscriptionPlan}`);
            console.log('');
        });

        // Update users' planSlug to VT_PLUS
        let updatedCount = 0;
        for (const user of usersWithVTPlusAccess) {
            const result = await db
                .update(users)
                .set({ planSlug: PlanSlug.VT_PLUS })
                .where(eq(users.id, user.userId));

            if (result.rowCount > 0) {
                console.log(`✓ Updated user ${user.userEmail} (ID: ${user.userId})`);
                updatedCount++;
            } else {
                console.log(`✗ Failed to update user ${user.userEmail} (ID: ${user.userId})`);
            }
        }

        console.log(
            `\nUpdate complete: ${updatedCount}/${usersWithVTPlusAccess.length} users updated`
        );

        // Verify the updates
        console.log('\nVerifying updates...');
        const verificationResults = await db
            .select({
                userId: users.id,
                userEmail: users.email,
                planSlug: users.planSlug,
            })
            .from(users)
            .where(and(eq(users.planSlug, PlanSlug.VT_PLUS)));

        console.log(
            `Verification: ${verificationResults.length} users now have planSlug set to VT_PLUS`
        );
    } catch (error) {
        console.error('Error updating user planSlug:', error);
        throw error;
    }
}

// Run the script
updateUserPlanSlug()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
