"use client";

import { log } from "@repo/shared/logger";
import { Alert, AlertDescription, AlertTitle, Button, cn } from "@repo/ui";
import { AlertCircle, DollarSign, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BudgetStatus {
    global: {
        status: "ok" | "warning" | "exceeded";
        totalCostUSD: number;
        budgetLimitUSD: number;
        percentageUsed: number;
        shouldDisable: boolean;
        requestCount: number;
    };
    user: {
        totalCostUSD: number;
        requestCount: number;
        modelBreakdown: Record<string, { cost: number; count: number }>;
    };
    month: string;
}

interface BudgetWarningBannerProps {
    className?: string;
}

export function BudgetWarningBanner({ className }: BudgetWarningBannerProps) {
    const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudgetStatus = async () => {
            try {
                const response = await fetch("/api/budget/status");
                if (response.ok) {
                    const data = await response.json();
                    setBudgetStatus(data);
                }
            } catch (error) {
                // Silently fail - budget warning is not critical
                log.warn({ error }, "Failed to fetch budget status");
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetStatus();

        // Refresh every 10 minutes
        const interval = setInterval(fetchBudgetStatus, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Don't show anything if loading, dismissed, or no issues
    if (loading || dismissed || !budgetStatus || budgetStatus.global.status === "ok") {
        return null;
    }

    const { global } = budgetStatus;
    const isExceeded = global.status === "exceeded";

    return (
        <div className={cn("sticky top-0 z-50", className)}>
            <Alert className="border-border bg-muted/50 rounded-none border-x-0 border-t-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isExceeded ? (
                            <DollarSign className="text-foreground h-5 w-5" />
                        ) : (
                            <AlertCircle className="text-muted-foreground h-5 w-5" />
                        )}
                        <div>
                            <AlertTitle className="text-foreground text-sm font-semibold">
                                {isExceeded ? "Budget Limit Reached" : "Budget Warning"}
                            </AlertTitle>
                            <AlertDescription className="text-muted-foreground text-xs">
                                {isExceeded
                                    ? `Monthly budget of $${global.budgetLimitUSD} exceeded. Gemini models are temporarily unavailable. Use your own API key for unlimited access.`
                                    : `${global.percentageUsed.toFixed(1)}% of monthly budget used ($${global.totalCostUSD.toFixed(2)} of $${global.budgetLimitUSD}). Approaching limit.`}
                            </AlertDescription>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDismissed(true)}
                        className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </Alert>
        </div>
    );
}

export default BudgetWarningBanner;
