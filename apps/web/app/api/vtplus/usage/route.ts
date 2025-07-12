import { VtPlusFeature } from '@repo/common/config/vtPlusLimits';
import { getAllUsage } from '@repo/common/lib/vtplusRateLimiter';
import { log } from '@repo/shared/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get usage for all VT+ features
        const usage = await getAllUsage(userId);

        // Calculate next reset date (first day of next month)
        const now = new Date();
        const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

        const response = {
            deepResearch: {
                used: usage[VtPlusFeature.DEEP_RESEARCH].used,
                limit: usage[VtPlusFeature.DEEP_RESEARCH].limit,
                feature: VtPlusFeature.DEEP_RESEARCH,
                percentage: Math.round(
                    (usage[VtPlusFeature.DEEP_RESEARCH].used /
                        usage[VtPlusFeature.DEEP_RESEARCH].limit) *
                        100
                ),
            },
            proSearch: {
                used: usage[VtPlusFeature.PRO_SEARCH].used,
                limit: usage[VtPlusFeature.PRO_SEARCH].limit,
                feature: VtPlusFeature.PRO_SEARCH,
                percentage: Math.round(
                    (usage[VtPlusFeature.PRO_SEARCH].used / usage[VtPlusFeature.PRO_SEARCH].limit) *
                        100
                ),
            },
            rag: {
                used: usage[VtPlusFeature.RAG].used,
                limit: usage[VtPlusFeature.RAG].limit,
                feature: VtPlusFeature.RAG,
                percentage: Math.round(
                    (usage[VtPlusFeature.RAG].used / usage[VtPlusFeature.RAG].limit) * 100
                ),
            },
            resetAt: nextReset.toISOString(),
            currentPeriod: usage[VtPlusFeature.DEEP_RESEARCH].periodStart
                .toISOString()
                .split('T')[0],
        };

        log.info({ userId, usage: response }, 'VT+ usage retrieved');

        return NextResponse.json(response);
    } catch (error) {
        log.error({ error }, 'Failed to get VT+ usage');

        return NextResponse.json({ error: 'Failed to retrieve usage data' }, { status: 500 });
    }
}
