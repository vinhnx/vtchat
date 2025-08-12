import { auth } from '@/lib/auth-server';
import { getMonthlyUsage } from '@/lib/services/budget-tracking';
import { log } from '@repo/shared/logger';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get global monthly usage (no cost tracking)
        const globalUsage = await getMonthlyUsage('gemini');

        // Since cost tracking is removed, return usage-based response
        return NextResponse.json({
            monthlyUsed: 0, // No cost tracking
            monthlyLimit: 0, // No cost tracking
            remainingBudget: 0, // No cost tracking
            usagePercent: 0, // No cost tracking
            warningLevel: 'normal', // Always normal since no cost limits
            isEnabled: true, // Always enabled - rate limits handle usage control
            global: {
                status: 'ok',
                totalCostUSD: 0, // Cost tracking removed
                budgetLimitUSD: 0, // Cost tracking removed
                percentageUsed: 0, // Cost tracking removed
                shouldDisable: false, // Never disable via budget
                requestCount: globalUsage.requestCount,
            },
            user: {
                totalCostUSD: 0, // Cost tracking removed
                requestCount: 0, // Would need user-specific query
                modelBreakdown: {}, // Would need user-specific query
            },
            month: new Date().toISOString().slice(0, 7), // YYYY-MM format
            note: 'Cost tracking disabled - using rate limits for usage control',
        });
    } catch (error) {
        log.error({ error }, 'Failed to get budget status');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
