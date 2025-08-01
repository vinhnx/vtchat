import { checkVTPlusAccess } from "@/app/api/subscription/access-control";
import { auth } from "@/lib/auth-server";
import { getAllUsage } from "@/lib/services/vtplus-quota.service";
import { VtPlusFeature } from "@repo/common/config/vtPlusLimits";
import { log } from "@repo/shared/lib/logger";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = session.user.id;

        // Check VT+ access before returning usage data
        const ip =
            request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? undefined;
        const vtPlusCheck = await checkVTPlusAccess({ userId, ip });
        if (!vtPlusCheck.hasAccess) {
            return NextResponse.json(
                {
                    error: "VT+ subscription required",
                    message: "VT+ usage tracking is only available for VT+ subscribers.",
                    reason: vtPlusCheck.reason,
                    subscriptionStatus: vtPlusCheck.subscriptionStatus,
                },
                { status: 403 },
            );
        }

        // Get user's subscription plan
        const userWithSubscription = await getUserWithSubscription(userId);
        const userPlan =
            (userWithSubscription?.userSubscription?.plan as PlanSlug) || PlanSlug.VT_BASE;

        // Get usage for all VT+ features
        const usage = await getAllUsage(userId, userPlan);

        // Calculate next reset dates based on window type
        const now = new Date();

        // For daily features: next day at 00:00 UTC
        const nextDayReset = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
        );

        // For monthly features: first day of next month
        const nextMonthReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

        const response = {
            deepResearch: {
                used: usage[VtPlusFeature.DEEP_RESEARCH].used,
                limit: usage[VtPlusFeature.DEEP_RESEARCH].limit,
                feature: VtPlusFeature.DEEP_RESEARCH,
                window: "daily", // From database configuration
                percentage: Math.round(
                    (usage[VtPlusFeature.DEEP_RESEARCH].used /
                        usage[VtPlusFeature.DEEP_RESEARCH].limit) *
                        100,
                ),
                resetAt: nextDayReset.toISOString(),
                periodStart: usage[VtPlusFeature.DEEP_RESEARCH].periodStart.toISOString(),
                periodEnd: nextDayReset.toISOString(),
            },
            proSearch: {
                used: usage[VtPlusFeature.PRO_SEARCH].used,
                limit: usage[VtPlusFeature.PRO_SEARCH].limit,
                feature: VtPlusFeature.PRO_SEARCH,
                window: "daily", // From database configuration
                percentage: Math.round(
                    (usage[VtPlusFeature.PRO_SEARCH].used / usage[VtPlusFeature.PRO_SEARCH].limit) *
                        100,
                ),
                resetAt: nextDayReset.toISOString(),
                periodStart: usage[VtPlusFeature.PRO_SEARCH].periodStart.toISOString(),
                periodEnd: nextDayReset.toISOString(),
            },
            // Legacy resetAt for backward compatibility
            resetAt: nextMonthReset.toISOString(),
            currentPeriod: usage[VtPlusFeature.DEEP_RESEARCH].periodStart
                .toISOString()
                .split("T")[0],
        };

        log.info({ userId, usage: response }, "VT+ usage retrieved");

        return NextResponse.json(response);
    } catch (error) {
        log.error({ error }, "Failed to get VT+ usage");

        return NextResponse.json({ error: "Failed to retrieve usage data" }, { status: 500 });
    }
}
