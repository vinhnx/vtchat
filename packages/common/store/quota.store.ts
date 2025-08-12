import { type QuotaWindow, VtPlusFeature } from '@repo/common/config/vtPlusLimits';
import { log } from '@repo/shared/lib/logger';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Quota usage data structure
export interface QuotaUsage {
    used: number;
    limit: number;
    window: QuotaWindow;
    periodStart: Date;
    periodEnd: Date;
    percentage: number;
}

// Quota store state
interface QuotaState {
    // Current usage data for each feature
    usage: Record<VtPlusFeature, QuotaUsage | null>;

    // Loading states
    isLoading: boolean;
    lastUpdated: Date | null;

    // Error state
    error: string | null;
}

// Quota store actions
interface QuotaActions {
    // Fetch usage data from API
    fetchUsage: (userId?: string) => Promise<void>;

    // Update usage for a specific feature
    updateFeatureUsage: (feature: VtPlusFeature, usage: QuotaUsage) => void;

    // Check if feature usage would exceed limit
    wouldExceedLimit: (feature: VtPlusFeature, amount?: number) => boolean;

    // Get remaining quota for a feature
    getRemainingQuota: (feature: VtPlusFeature) => number;

    // Reset usage data
    reset: () => void;

    // Clear error state
    clearError: () => void;
}

type QuotaStore = QuotaState & QuotaActions;

const initialState: QuotaState = {
    usage: {
        [VtPlusFeature.DEEP_RESEARCH]: null,
        [VtPlusFeature.PRO_SEARCH]: null,
    },
    isLoading: false,
    lastUpdated: null,
    error: null,
};

export const useQuotaStore = create<QuotaStore>()(
    persist(
        immer((set, get) => ({
            ...initialState,

            fetchUsage: async (userId?: string) => {
                set((state) => {
                    state.isLoading = true;
                    state.error = null;
                });

                try {
                    const response = await fetch('/api/vtplus/usage', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch usage: ${response.statusText}`);
                    }

                    const data = await response.json();

                    set((state) => {
                        // Update usage data for each feature
                        if (data.deepResearch) {
                            state.usage[VtPlusFeature.DEEP_RESEARCH] = {
                                used: data.deepResearch.used,
                                limit: data.deepResearch.limit,
                                window: data.deepResearch.window,
                                periodStart: new Date(data.deepResearch.periodStart),
                                periodEnd: new Date(data.deepResearch.periodEnd),
                                percentage: data.deepResearch.percentage,
                            };
                        }

                        if (data.proSearch) {
                            state.usage[VtPlusFeature.PRO_SEARCH] = {
                                used: data.proSearch.used,
                                limit: data.proSearch.limit,
                                window: data.proSearch.window,
                                periodStart: new Date(data.proSearch.periodStart),
                                periodEnd: new Date(data.proSearch.periodEnd),
                                percentage: data.proSearch.percentage,
                            };
                        }

                        state.isLoading = false;
                        state.lastUpdated = new Date();
                    });

                    log.info('[QuotaStore] Usage data fetched successfully');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                    set((state) => {
                        state.isLoading = false;
                        state.error = errorMessage;
                    });

                    log.error({ error }, '[QuotaStore] Failed to fetch usage data');
                }
            },

            updateFeatureUsage: (feature: VtPlusFeature, usage: QuotaUsage) => {
                set((state) => {
                    state.usage[feature] = usage;
                    state.lastUpdated = new Date();
                });
            },

            wouldExceedLimit: (feature: VtPlusFeature, amount = 1) => {
                const usage = get().usage[feature];
                if (!usage) return false;

                return usage.used + amount > usage.limit;
            },

            getRemainingQuota: (feature: VtPlusFeature) => {
                const usage = get().usage[feature];
                if (!usage) return 0;

                return Math.max(0, usage.limit - usage.used);
            },

            reset: () => {
                set((state) => {
                    Object.assign(state, initialState);
                });
            },

            clearError: () => {
                set((state) => {
                    state.error = null;
                });
            },
        })),
        {
            name: 'quota-storage',
            partialize: (state) => ({
                usage: state.usage,
                lastUpdated: state.lastUpdated,
            }),
        },
    ),
);
