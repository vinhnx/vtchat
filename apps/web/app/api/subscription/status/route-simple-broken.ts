export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { auth } from '@/lib/auth-server';
import {
    getAnonymousSubscriptionStatus,
    getOrCreateSubscriptionRequest,
    getSessionSubscriptionStatus,
} from '@/lib/subscription-session-cache';
import { getSubscription } from '@/lib/subscription/subscription-access-simple';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const searchParams = request.nextUrl.searchParams;
        const forceRefresh = searchParams.get('refresh') === 'true';

        if (!session) {
            // Handle anonymous users
            const sessionId = request.headers.get('x-session-id');

            if (!sessionId) {
                return NextResponse.json({
                    plan: PlanSlug.FREE,
                    status: 'active',
                    isPlusSubscriber: false,
                    hasSubscription: false,
                    isAnonymous: true,
                });
            }

            // Check session-based cache for anonymous users
            const cachedStatus = await getAnonymousSubscriptionStatus(sessionId);
            if (cachedStatus && !forceRefresh) {
                return NextResponse.json({
                    ...cachedStatus,
                    isAnonymous: true,
                });
            }

            // Anonymous users get free tier
            return NextResponse.json({
                plan: PlanSlug.FREE,
                status: 'active',
                isPlusSubscriber: false,
                hasSubscription: false,
                isAnonymous: true,
            });
        }

        const userId = session.user.id;

        // Check session cache first (unless forcing refresh)
        if (!forceRefresh) {
            const sessionCached = await getSessionSubscriptionStatus(userId);
            if (sessionCached) {
                return NextResponse.json({
                    plan: sessionCached.plan,
                    status: sessionCached.status,
                    isPlusSubscriber: sessionCached.isPlusSubscriber,
                    hasSubscription: sessionCached.hasSubscription,
                    currentPeriodEnd: sessionCached.currentPeriodEnd,
                    subscriptionId: sessionCached.subscriptionId,
                    isAnonymous: false,
                });
            }
        }

        // Fetch from simplified subscription service
        const subscription = await getSubscription(userId);

        if (!subscription) {
            // User not found or no subscription - default to free
            const defaultStatus = {
                plan: PlanSlug.FREE,
                status: 'active' as const,
                isPlusSubscriber: false,
                hasSubscription: false,
                isAnonymous: false,
            };

            // Cache the result
            await getOrCreateSubscriptionRequest(userId, defaultStatus);

            return NextResponse.json(defaultStatus);
        }

        // Convert to API response format
        const response = {
            plan: subscription.planSlug || PlanSlug.FREE,
            status: subscription.status || 'active',
            isPlusSubscriber: subscription.isVtPlus,
            hasSubscription: subscription.status !== null,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
            subscriptionId: subscription.creemSubscriptionId,
            isAnonymous: false,
        };

        // Cache the result in session cache
        await getOrCreateSubscriptionRequest(userId, {
            plan: response.plan as PlanSlug,
            status: response.status,
            isPlusSubscriber: response.isPlusSubscriber,
            hasSubscription: response.hasSubscription,
            currentPeriodEnd: subscription.currentPeriodEnd,
            subscriptionId: response.subscriptionId,
            userId,
        });

        return NextResponse.json(response);
    } catch (error) {
        log.error('[Subscription Status API] Error:', { error });

        // Return safe fallback
        return NextResponse.json(
            {
                plan: PlanSlug.FREE,
                status: 'active',
                isPlusSubscriber: false,
                hasSubscription: false,
                isAnonymous: true,
                error: 'Internal server error',
            },
            { status: 500 },
        );
    }
}
