import { log } from "@repo/shared/logger";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { checkBudgetStatus, getUserMonthlySpend } from "@/lib/services/budget-tracking";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get global budget status
        const globalBudgetStatus = await checkBudgetStatus("gemini");

        // Get user-specific spending
        const userSpending = await getUserMonthlySpend(userId, "gemini");

        return NextResponse.json({
            monthlyUsed: globalBudgetStatus.totalCostUSD,
            monthlyLimit: globalBudgetStatus.budgetLimitUSD,
            remainingBudget: globalBudgetStatus.budgetLimitUSD - globalBudgetStatus.totalCostUSD,
            usagePercent: globalBudgetStatus.percentageUsed,
            warningLevel: globalBudgetStatus.status === "ok" ? "normal" : globalBudgetStatus.status,
            isEnabled: !globalBudgetStatus.shouldDisable,
            global: {
                status: globalBudgetStatus.status,
                totalCostUSD: globalBudgetStatus.totalCostUSD,
                budgetLimitUSD: globalBudgetStatus.budgetLimitUSD,
                percentageUsed: globalBudgetStatus.percentageUsed,
                shouldDisable: globalBudgetStatus.shouldDisable,
                requestCount: globalBudgetStatus.requestCount,
            },
            user: {
                totalCostUSD: userSpending.totalCostUSD,
                requestCount: userSpending.requestCount,
                modelBreakdown: userSpending.modelBreakdown,
            },
            month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        });
    } catch (error) {
        log.error({ error }, "Failed to get budget status");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
