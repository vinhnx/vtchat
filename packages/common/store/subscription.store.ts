import { log } from "@repo/shared/lib/logger";
import { PLANS, PlanSlug, type FeatureSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Subscription data structure
export interface SubscriptionData {
    id: string;
    userId: string;
    plan: PlanSlug;
    status: SubscriptionStatusEnum;
    creemCustomerId?: string;
    creemSubscriptionId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Subscription store state
interface SubscriptionState {
    // Current subscription data
    subscription: SubscriptionData | null;

    // Available features based on current plan
    availableFeatures: FeatureSlug[];

    // Loading states
    isLoading: boolean;
    lastUpdated: Date | null;

    // Error state
    error: string | null;
}

// Subscription store actions
interface SubscriptionActions {
    // Fetch subscription data from API
    fetchSubscription: (userId?: string) => Promise<void>;

    // Update subscription data
    updateSubscription: (subscription: SubscriptionData) => void;

    // Check if user has access to a specific feature
    hasFeature: (feature: FeatureSlug) => boolean;

    // Check if user has a specific plan
    hasPlan: (plan: PlanSlug) => boolean;

    // Check if subscription is active
    isActive: () => boolean;

    // Get current plan details
    getCurrentPlan: () => (typeof PLANS)[PlanSlug] | null;

    // Reset subscription data
    reset: () => void;

    // Clear error state
    clearError: () => void;
}

type SubscriptionStore = SubscriptionState & SubscriptionActions;

const initialState: SubscriptionState = {
    subscription: null,
    availableFeatures: [],
    isLoading: false,
    lastUpdated: null,
    error: null,
};

export const useSubscriptionStore = create<SubscriptionStore>()(
    persist(
        immer((set, get) => ({
            ...initialState,

            fetchSubscription: async (userId?: string) => {
                set((state) => {
                    state.isLoading = true;
                    state.error = null;
                });

                try {
                    const response = await fetch("/api/subscription", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
                    }

                    const data = await response.json();

                    set((state) => {
                        if (data.subscription) {
                            state.subscription = {
                                ...data.subscription,
                                currentPeriodStart: data.subscription.currentPeriodStart
                                    ? new Date(data.subscription.currentPeriodStart)
                                    : undefined,
                                currentPeriodEnd: data.subscription.currentPeriodEnd
                                    ? new Date(data.subscription.currentPeriodEnd)
                                    : undefined,
                                createdAt: new Date(data.subscription.createdAt),
                                updatedAt: new Date(data.subscription.updatedAt),
                            };

                            // Update available features based on plan
                            const planConfig = PLANS[data.subscription.plan as PlanSlug];
                            state.availableFeatures = planConfig ? planConfig.features : [];
                        } else {
                            // Default to base plan if no subscription found
                            state.subscription = null;
                            state.availableFeatures = PLANS[PlanSlug.VT_BASE].features;
                        }

                        state.isLoading = false;
                        state.lastUpdated = new Date();
                    });

                    log.info("[SubscriptionStore] Subscription data fetched successfully");
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";

                    set((state) => {
                        state.isLoading = false;
                        state.error = errorMessage;
                        // Fallback to base plan on error
                        state.availableFeatures = PLANS[PlanSlug.VT_BASE].features;
                    });

                    log.error({ error }, "[SubscriptionStore] Failed to fetch subscription data");
                }
            },

            updateSubscription: (subscription: SubscriptionData) => {
                set((state) => {
                    state.subscription = subscription;

                    // Update available features based on plan
                    const planConfig = PLANS[subscription.plan];
                    state.availableFeatures = planConfig ? planConfig.features : [];

                    state.lastUpdated = new Date();
                });
            },

            hasFeature: (feature: FeatureSlug) => {
                const { availableFeatures } = get();
                return availableFeatures.includes(feature);
            },

            hasPlan: (plan: PlanSlug) => {
                const { subscription } = get();
                return subscription?.plan === plan;
            },

            isActive: () => {
                const { subscription } = get();
                if (!subscription) return false;

                const activeStatuses = [
                    SubscriptionStatusEnum.ACTIVE,
                    SubscriptionStatusEnum.TRIALING,
                    SubscriptionStatusEnum.PAST_DUE,
                ];

                return activeStatuses.includes(subscription.status as SubscriptionStatusEnum);
            },

            getCurrentPlan: () => {
                const { subscription } = get();
                if (!subscription) return PLANS[PlanSlug.VT_BASE];

                return PLANS[subscription.plan] || PLANS[PlanSlug.VT_BASE];
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
            name: "subscription-storage",
            partialize: (state) => ({
                subscription: state.subscription,
                availableFeatures: state.availableFeatures,
                lastUpdated: state.lastUpdated,
            }),
        },
    ),
);
