export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { auth } from '@/lib/auth-server';
import { invalidateAllCaches } from '@/lib/cache/cache-invalidation';
import { db } from '@/lib/database';
import { sessions, users, userSubscriptions } from '@/lib/database/schema';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for processing payment success
const PaymentSuccessSchema = z.object({
    customer_id: z.string(),
    order_id: z.string().optional(),
    checkout_id: z.string().optional(),
    subscription_id: z.string().optional(),
    product_id: z.string().optional(),
    plan: z.string().optional(),
    package: z.string().optional(),
    quantity: z.number().optional().default(1),
    status: z.string().default('completed'),
    amount: z.number().optional(),
    currency: z.string().optional(),
    session_id: z.string().optional(),
});

// Map Creem product/plan info to VT Chat plan slugs
function mapCreemProductToPlan(
    planParam?: string,
    packageParam?: string,
): {
    planSlug: string;
    isSubscription: boolean;
} {
    // Check for VT+ subscription
    if (planParam === PlanSlug.VT_PLUS || packageParam === PlanSlug.VT_PLUS) {
        return {
            planSlug: PlanSlug.VT_PLUS,
            isSubscription: true,
        };
    }

    // Default fallback
    return { planSlug: PlanSlug.VT_BASE, isSubscription: false };
}

export async function POST(request: NextRequest) {
    log.info({}, '[Payment Success API] Processing payment success callback...');

    try {
        // Get authenticated user
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            log.info({}, '[Payment Success API] No authenticated user found');
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const userId = session.user.id;
        const userEmail = session.user.email;

        // Parse request body
        const body = await request.json();
        log.info({ body }, '[Payment Success API] Request body');

        // Validate request
        const validatedData = PaymentSuccessSchema.parse(body);
        log.info('[Payment Success API] Validated data:', { data: validatedData });

        // Map plan
        const { planSlug, isSubscription } = mapCreemProductToPlan(
            validatedData.plan,
            validatedData.package,
        );

        log.info('[Payment Success API] Mapped values:', {
            planSlug,
            isSubscription,
        });

        // Note: neon-http driver doesn't support transactions, so we'll execute operations sequentially
        // Get current user to determine current plan
        const currentUser = await db
            .select({ planSlug: users.planSlug })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const currentPlan = currentUser[0]?.planSlug || PlanSlug.VT_BASE;

        log.info('[Payment Success API] Plan update:', {
            currentPlan,
            newPlan: planSlug,
            isSubscription,
        });

        // Update user record with customer ID and plan
        await db
            .update(users)
            .set({
                creemCustomerId: validatedData.customer_id,
                planSlug,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        log.info('[Payment Success API] Updated user record:', {
            userId,
            customerId: validatedData.customer_id,
            planSlug,
            currentPlan,
            isSubscription,
        });

        // If it's a subscription, update or create subscription record
        if (isSubscription && validatedData.subscription_id) {
            // Check if subscription record exists
            const existingSubscription = await db
                .select()
                .from(userSubscriptions)
                .where(eq(userSubscriptions.userId, userId))
                .limit(1);

            const subscriptionData = {
                userId,
                plan: planSlug,
                status: SubscriptionStatusEnum.ACTIVE,
                creemCustomerId: validatedData.customer_id, // Using Creem customer ID
                creemSubscriptionId: validatedData.subscription_id,
                updatedAt: new Date(),
            };

            if (existingSubscription.length > 0) {
                // Update existing subscription
                await db
                    .update(userSubscriptions)
                    .set(subscriptionData)
                    .where(eq(userSubscriptions.userId, userId));

                log.info('[Payment Success API] Updated existing subscription');
            } else {
                // Create new subscription
                await db.insert(userSubscriptions).values({
                    id: `sub_${Date.now()}_${userId}`,
                    ...subscriptionData,
                    createdAt: new Date(),
                });

                log.info('[Payment Success API] Created new subscription');
            }
        }

        log.info('[Payment Success API] Database operations completed successfully');

        // Invalidate all caches for the user after successful payment
        await invalidateAllCaches(userId);

        log.info('[Payment Success API] Invalidated all caches for user', { userId });

        // Touch sessions to force refresh
        try {
            const userSessions = await db.select().from(sessions).where(
                eq(sessions.userId, userId),
            );
            if (userSessions.length > 0) {
                await db
                    .update(sessions)
                    .set({
                        updatedAt: new Date(),
                    })
                    .where(eq(sessions.userId, userId));
                log.info('[Payment Success API] Updated sessions after payment', {
                    count: userSessions.length,
                });
            }
        } catch (sessionError) {
            log.warn(
                { sessionError },
                '[Payment Success API] Unable to update sessions after payment',
            );
        }

        // Post-check: confirm VT+ persisted
        try {
            const subRow = await db
                .select({
                    plan: userSubscriptions.plan,
                    status: userSubscriptions.status,
                    creemSubscriptionId: userSubscriptions.creemSubscriptionId,
                })
                .from(userSubscriptions)
                .where(eq(userSubscriptions.userId, userId))
                .limit(1);

            const userRow = await db
                .select({ planSlug: users.planSlug })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            const isVtPlus = (subRow.length > 0 && subRow[0].plan === PlanSlug.VT_PLUS)
                || (userRow.length > 0 && userRow[0].planSlug === PlanSlug.VT_PLUS);

            if (!isVtPlus) {
                log.warn(
                    {
                        subRow,
                        userRow,
                        customerId: validatedData.customer_id,
                        subscriptionId: validatedData.subscription_id,
                    },
                    '[Payment Success API] Post-check: VT+ not reflected after payment update',
                );
            } else {
                log.info('[Payment Success API] Post-check: VT+ confirmed after payment update', {
                    subscriptionId: subRow[0]?.creemSubscriptionId,
                    status: subRow[0]?.status,
                });
            }
        } catch (postCheckError) {
            log.warn({ postCheckError }, '[Payment Success API] Post-check failed');
        }

        return NextResponse.json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                userId,
                userEmail,
                customerId: validatedData.customer_id,
                planSlug,
                isSubscription,
            },
        });
    } catch (error) {
        log.error('[Payment Success API] Error processing payment success:', {
            error,
        });

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    details: error.errors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}
