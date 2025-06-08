import { auth } from '@/lib/auth';
import { db } from '@/lib/database';
import { userSubscriptions } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get user subscription from database
        const subscription = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        if (subscription.length === 0) {
            // No subscription found, return default free plan
            return NextResponse.json({
                plan: PlanSlug.VT_BASE,
                status: SubscriptionStatusEnum.ACTIVE, // Free tier is always 'active' in terms of status
                isPlusSubscriber: false,
                hasSubscription: false,
            });
        }

        const sub = subscription[0];
        // Ensure sub.plan is compared against PlanSlug enum
        const currentPlanSlug = sub.plan === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
        // Ensure sub.status is one of the SubscriptionStatusEnum values or can be mapped to one
        let currentStatus = sub.status as SubscriptionStatusEnum; // Assuming db stores compatible values

        const isPlusSubscriber = currentPlanSlug === PlanSlug.VT_PLUS && currentStatus === SubscriptionStatusEnum.ACTIVE;

        // Check if subscription is expired
        let isExpired = false;
        if (sub.currentPeriodEnd) {
            isExpired = new Date() > sub.currentPeriodEnd;
        }

        // Determine final status
        let finalStatus = currentStatus;
        if (isExpired) {
            finalStatus = SubscriptionStatusEnum.EXPIRED;
        } else if (currentStatus !== SubscriptionStatusEnum.ACTIVE && currentStatus !== SubscriptionStatusEnum.INACTIVE && currentStatus !== SubscriptionStatusEnum.NONE) {
            // Fallback for unknown status from DB, map to inactive or none
            finalStatus = SubscriptionStatusEnum.INACTIVE;
        }


        return NextResponse.json({
            plan: currentPlanSlug,
            status: finalStatus,
            isPlusSubscriber: isPlusSubscriber && !isExpired,
            currentPeriodEnd: sub.currentPeriodEnd,
            hasSubscription: true,
            subscriptionId: sub.stripeSubscriptionId, // This field is reused for Creem subscription ID
        });
    } catch (error) {
        console.error('[Subscription Status API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
