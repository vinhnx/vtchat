import { log } from '@repo/shared/logger';
import { useEffect, useState } from 'react';

export interface BudgetStatus {
    global: {
        status: 'ok' | 'warning' | 'exceeded';
        totalCostUSD: number;
        budgetLimitUSD: number;
        percentageUsed: number;
        shouldDisable: boolean;
        requestCount: number;
    };
    user: {
        totalCostUSD: number;
        requestCount: number;
        modelBreakdown: Record<string, { cost: number; count: number; }>;
    };
    month: string;
}

export function useBudgetStatus() {
    const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudgetStatus = async () => {
            try {
                const data = await http.get('/api/budget/status');
                setBudgetStatus(data);
            } catch (error) {
                // Silently fail - budget warning is not critical
                log.warn({ error }, 'Failed to fetch budget status');
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetStatus();

        // Refresh every 10 minutes
        const interval = setInterval(fetchBudgetStatus, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        budgetStatus,
        dismissed,
        setDismissed,
        loading,
    };
}
