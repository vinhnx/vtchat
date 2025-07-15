export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { log } from "@repo/shared/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import {
    hasSubscriptionAccess,
    getEffectiveAccessStatus,
} from "@repo/shared/utils/subscription-grace-period";
import { desc, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/database";
import { userSubscriptions, users } from "@/lib/database/schema";
import {
    getAnonymousSubscriptionStatus,
    getOrCreateSubscriptionRequest,
    getSessionSubscriptionStatus,
    type SessionSubscriptionStatus,
} from "@/lib/subscription-session-cache";

async function fetchSubscriptionFromDB(
    userId: string,
): Promise<
    Omit<
        SessionSubscriptionStatus,
        "cachedAt" | "expiresAt" | "sessionId" | "fetchCount" | "lastRefreshTrigger"
    >
> {
    // Get user plan_slug from users table first
    const userResults = await db
        .select({
            planSlug: users.planSlug,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    const userPlanSlug = userResults.length > 0 ? userResults[0].planSlug : null;

    // Get user subscription from database - prioritize active subscriptions
    const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .orderBy(
            // Prioritize active/valid subscriptions first
            sql`CASE 
                WHEN status IN ('active','trialing','past_due') THEN 0
                WHEN status IN ('canceled','cancelled') THEN 1
                ELSE 2
            END`,
            desc(userSubscriptions.currentPeriodEnd),
            desc(userSubscriptions.updatedAt),
        )
        .limit(1);

    // Determine plan: prioritize user_subscriptions.plan, fallback to users.plan_slug, default to VT_BASE
    let finalPlan: PlanSlug;
    let hasDbSubscription = false;
    let subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
    let currentPeriodEnd: Date | null = null;
    let subscriptionId: string | null = null;

    if (subscription.length > 0) {
        // User has a subscription record
        const sub = subscription[0];
        finalPlan = sub.plan === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
        subscriptionStatus = sub.status as SubscriptionStatusEnum;
        currentPeriodEnd = sub.currentPeriodEnd;
        subscriptionId = sub.creemSubscriptionId;
        hasDbSubscription = true;

        // Use centralized grace period logic to get effective status
        subscriptionStatus = getEffectiveAccessStatus({
            status: sub.status as SubscriptionStatusEnum,
            currentPeriodEnd: sub.currentPeriodEnd,
        });
    } else if (userPlanSlug === PlanSlug.VT_PLUS) {
        // User has vt_plus in users.plan_slug but no subscription record
        // This indicates they should have VT+ access (possibly from admin grant or legacy data)
        finalPlan = PlanSlug.VT_PLUS;
        subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
        hasDbSubscription = false; // No formal subscription, but has access
    } else {
        // No subscription found and no vt_plus plan_slug, return default free plan
        finalPlan = PlanSlug.VT_BASE;
        subscriptionStatus = SubscriptionStatusEnum.ACTIVE; // Free tier is always 'active'
        hasDbSubscription = false;
    }

    // Use centralized grace period logic to determine access
    const isPlusSubscriber =
        finalPlan === PlanSlug.VT_PLUS &&
        hasSubscriptionAccess({
            status: subscriptionStatus,
            currentPeriodEnd: currentPeriodEnd,
        });

    return {
        plan: finalPlan,
        status: subscriptionStatus,
        isPlusSubscriber,
        currentPeriodEnd: currentPeriodEnd || undefined,
        hasSubscription: hasDbSubscription || userPlanSlug === PlanSlug.VT_PLUS,
        subscriptionId: subscriptionId || undefined,
        userId,
    };
}

export async function GET(request: NextRequest) {
    try {
        // Get refresh trigger from query params
        const url = new URL(request.url);
        const refreshTrigger =
            (url.searchParams.get("trigger") as SessionSubscriptionStatus["lastRefreshTrigger"]) ||
            "page_refresh";
        const forceRefresh = url.searchParams.get("force") === "true";

        // Try to get session with timeout - handle both logged-in and non-logged-in users
        let session;
        try {
            const sessionPromise = auth.api.getSession({
                headers: request.headers,
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Session check timeout")), 3000),
            );

            session = await Promise.race([sessionPromise, timeoutPromise]);
        } catch (error) {
            log.warn({ error }, "[Subscription Status API] Session check failed or timed out");
            // For session failures, treat as anonymous user
            session = null;
        }

        const userId = (session as any)?.user?.id || null;
        const isLoggedIn = !!userId;

        log.info(
            {
                trigger: refreshTrigger,
            },
            `[Subscription Status API] Request for ${isLoggedIn ? `user ${userId}` : "anonymous"}`,
        );

        // For non-logged-in users, return cached anonymous status or create it
        if (!isLoggedIn) {
            const cached = getSessionSubscriptionStatus(null, refreshTrigger, request);
            if (cached && !forceRefresh) {
                log.info({}, "[Subscription Status API] Cache hit for anonymous user");
                return NextResponse.json({
                    plan: cached.plan,
                    status: cached.status,
                    isPlusSubscriber: cached.isPlusSubscriber,
                    hasSubscription: cached.hasSubscription,
                    fromCache: true,
                    cachedAt: cached.cachedAt,
                    isAnonymous: true,
                    fetchCount: cached.fetchCount,
                });
            }

            // Use deduplication for anonymous users as well
            log.info(
                {},
                "[Subscription Status API] Cache miss for anonymous user, using deduplication",
            );
            const cachedResult = await getOrCreateSubscriptionRequest(
                null,
                refreshTrigger,
                request,
                async () => getAnonymousSubscriptionStatus(),
            );

            log.info({}, "[Subscription Status API] Created anonymous subscription status");
            return NextResponse.json({
                plan: cachedResult.plan,
                status: cachedResult.status,
                isPlusSubscriber: cachedResult.isPlusSubscriber,
                hasSubscription: cachedResult.hasSubscription,
                fromCache: false,
                cachedAt: cachedResult.cachedAt,
                isAnonymous: true,
                fetchCount: cachedResult.fetchCount,
            });
        }

        // For logged-in users, check session cache first
        const cached = getSessionSubscriptionStatus(userId, refreshTrigger, request);
        if (cached && !forceRefresh) {
            log.info(
                {
                    fetchCount: cached.fetchCount,
                },
                `[Subscription Status API] Session cache hit for user ${userId}`,
            );
            return NextResponse.json({
                plan: cached.plan,
                status: cached.status,
                isPlusSubscriber: cached.isPlusSubscriber,
                currentPeriodEnd: cached.currentPeriodEnd,
                hasSubscription: cached.hasSubscription,
                subscriptionId: cached.subscriptionId,
                fromCache: true,
                cachedAt: cached.cachedAt,
                fetchCount: cached.fetchCount,
                lastRefreshTrigger: cached.lastRefreshTrigger,
            });
        }

        log.info(
            `[Subscription Status API] Session cache miss for user ${userId}, using deduplication for DB fetch`,
            {
                trigger: refreshTrigger,
            },
        );

        // Use deduplication to prevent multiple simultaneous DB calls for the same user
        const cachedResult = await getOrCreateSubscriptionRequest(
            userId,
            refreshTrigger,
            request,
            () => fetchSubscriptionFromDB(userId),
        );

        return NextResponse.json({
            plan: cachedResult.plan,
            status: cachedResult.status,
            isPlusSubscriber: cachedResult.isPlusSubscriber,
            currentPeriodEnd: cachedResult.currentPeriodEnd,
            hasSubscription: cachedResult.hasSubscription,
            subscriptionId: cachedResult.subscriptionId,
            fromCache: false,
            cachedAt: cachedResult.cachedAt,
            fetchCount: cachedResult.fetchCount,
            lastRefreshTrigger: cachedResult.lastRefreshTrigger,
        });
    } catch (error) {
        log.error("[Subscription Status API] Error:", { error });
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
