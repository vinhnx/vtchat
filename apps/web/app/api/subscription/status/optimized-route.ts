/**
 * Optimized subscription status endpoint with Redis caching and single query
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { log } from "@repo/shared/lib/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { redisCache } from "@/lib/cache/redis-cache";
import { getSubscriptionFast } from "@/lib/subscription/fast-subscription-access";

interface OptimizedSubscriptionResponse {
    plan: PlanSlug;
    status: SubscriptionStatusEnum;
    isPlusSubscriber: boolean;
    currentPeriodEnd?: Date;
    hasSubscription: boolean;
    subscriptionId?: string;
    fromCache: boolean;
    cachedAt?: number;
    isAnonymous?: boolean;
    responseTime: number;
}

// Anonymous user cache - can be served with HTTP caching
const ANONYMOUS_STATUS = {
    plan: PlanSlug.VT_BASE,
    status: SubscriptionStatusEnum.ACTIVE,
    isPlusSubscriber: false,
    hasSubscription: false,
    isAnonymous: true,
};

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Parse query parameters
        const url = new URL(request.url);
        const forceRefresh = url.searchParams.get("force") === "true";

        // Fast session check with timeout
        let session;
        try {
            const sessionPromise = auth.api.getSession({
                headers: request.headers,
            });

            const timeoutPromise = new Promise(
                (_, reject) => setTimeout(() => reject(new Error("Session timeout")), 2000), // Reduced timeout
            );

            session = await Promise.race([sessionPromise, timeoutPromise]);
        } catch {
            // Session check failed - treat as anonymous
            session = null;
        }

        const userId = (session as any)?.user?.id || null;
        const isLoggedIn = !!userId;

        // Anonymous users - serve with HTTP caching
        if (!isLoggedIn) {
            const responseTime = Date.now() - startTime;

            return NextResponse.json(
                {
                    ...ANONYMOUS_STATUS,
                    fromCache: true,
                    cachedAt: Date.now(),
                    responseTime,
                },
                {
                    headers: {
                        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
                        "X-Response-Time": `${responseTime}ms`,
                    },
                },
            );
        }

        // For authenticated users, use fast subscription access
        let subscriptionData;
        let fromCache = true;

        if (forceRefresh) {
            // Force refresh - invalidate cache first
            await redisCache.invalidateSubscription(userId);
        }

        subscriptionData = await getSubscriptionFast(userId);

        if (!subscriptionData) {
            // Fallback to free plan if no data found
            subscriptionData = {
                planSlug: PlanSlug.VT_BASE,
                subPlan: null,
                status: SubscriptionStatusEnum.ACTIVE.toString(),
                currentPeriodEnd: null,
                creemSubscriptionId: null,
                isActive: true,
                isPremium: false,
                isVtPlus: false,
            };
            fromCache = false;
        }

        // Convert to response format
        const response: OptimizedSubscriptionResponse = {
            plan: subscriptionData.isVtPlus ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE,
            status: subscriptionData.isActive
                ? SubscriptionStatusEnum.ACTIVE
                : SubscriptionStatusEnum.EXPIRED,
            isPlusSubscriber: subscriptionData.isVtPlus && subscriptionData.isActive,
            currentPeriodEnd: subscriptionData.currentPeriodEnd || undefined,
            hasSubscription:
                !!subscriptionData.subPlan || subscriptionData.planSlug === PlanSlug.VT_PLUS,
            subscriptionId: subscriptionData.creemSubscriptionId || undefined,
            fromCache,
            cachedAt: Date.now(),
            responseTime: Date.now() - startTime,
        };

        log.debug("Subscription status served", {
            userId,
            fromCache,
            responseTime: response.responseTime,
            plan: response.plan,
        });

        return NextResponse.json(response, {
            headers: {
                "X-Response-Time": `${response.responseTime}ms`,
                "X-Cache-Status": fromCache ? "HIT" : "MISS",
                // Short cache for browser to reduce duplicate requests
                "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        const responseTime = Date.now() - startTime;

        log.error("Subscription status error:", {
            error,
            responseTime,
            stack: error instanceof Error ? error.stack : undefined,
        });

        // Fallback to free plan on error
        return NextResponse.json(
            {
                ...ANONYMOUS_STATUS,
                fromCache: false,
                responseTime,
            },
            {
                status: 200, // Don't fail the request, just return free plan
                headers: {
                    "X-Response-Time": `${responseTime}ms`,
                    "X-Cache-Status": "ERROR",
                },
            },
        );
    }
}

// Health check endpoint for monitoring cache performance
export async function HEAD(_request: NextRequest) {
    const startTime = Date.now();

    try {
        // Quick Redis health check
        const isRedisHealthy = await redisCache.ping();
        const responseTime = Date.now() - startTime;

        return new Response(null, {
            status: isRedisHealthy ? 200 : 503,
            headers: {
                "X-Response-Time": `${responseTime}ms`,
                "X-Redis-Status": isRedisHealthy ? "OK" : "FAIL",
                "Cache-Control": "no-cache",
            },
        });
    } catch {
        return new Response(null, {
            status: 503,
            headers: {
                "X-Response-Time": `${Date.now() - startTime}ms`,
                "X-Redis-Status": "ERROR",
            },
        });
    }
}
