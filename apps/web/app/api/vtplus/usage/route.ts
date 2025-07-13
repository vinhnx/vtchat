import { VT_PLUS_LIMITS, VtPlusFeature } from "@repo/common/config/vtPlusLimits";
import { getAllUsage } from "@repo/common/lib/vtplusRateLimiter";
import { log } from "@repo/shared/lib/logger";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";

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

        // Get usage for all VT+ features
        const usage = await getAllUsage(userId);

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
                window: VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH].window,
                percentage: Math.round(
                    (usage[VtPlusFeature.DEEP_RESEARCH].used /
                        usage[VtPlusFeature.DEEP_RESEARCH].limit) *
                        100,
                ),
                resetAt: nextDayReset.toISOString(),
            },
            proSearch: {
                used: usage[VtPlusFeature.PRO_SEARCH].used,
                limit: usage[VtPlusFeature.PRO_SEARCH].limit,
                feature: VtPlusFeature.PRO_SEARCH,
                window: VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH].window,
                percentage: Math.round(
                    (usage[VtPlusFeature.PRO_SEARCH].used / usage[VtPlusFeature.PRO_SEARCH].limit) *
                        100,
                ),
                resetAt: nextDayReset.toISOString(),
            },
            rag: {
                used: usage[VtPlusFeature.RAG].used,
                limit: usage[VtPlusFeature.RAG].limit,
                feature: VtPlusFeature.RAG,
                window: VT_PLUS_LIMITS[VtPlusFeature.RAG].window,
                percentage: Math.round(
                    (usage[VtPlusFeature.RAG].used / usage[VtPlusFeature.RAG].limit) * 100,
                ),
                resetAt: nextMonthReset.toISOString(),
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
