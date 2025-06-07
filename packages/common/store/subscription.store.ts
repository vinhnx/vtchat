'use client';

/**
 * VT Chat Subscription Store
 *
 * Zustand store for managing subscription state on the client-side.
 * Integrates with Better Auth's user data and provides reactive subscription access.
 */

import {
    DEFAULT_PLAN,
    FeatureSlug,
    PLANS,
    PlanSlug,
    UserSubscription,
} from '@repo/shared/types/subscription';
import { getUserSubscription } from '@repo/shared/utils/subscription';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface SubscriptionState {
    // Current subscription data
    subscription: UserSubscription | null;

    // Loading states
    isLoading: boolean;
    isInitialized: boolean;

    // Subscription actions
    setSubscription: (subscription: UserSubscription) => void;
    updateFromUser: (user: any) => void;
    reset: () => void;

    // Convenience getters
    getCurrentPlan: () => PlanSlug;
    getFeatures: () => FeatureSlug[];
    isPremium: () => boolean;
    isActive: () => boolean;

    // Upgrade helpers
    canUpgrade: () => boolean;
    getRequiredPlanFor: (feature: FeatureSlug) => PlanSlug | null;
}

export const useSubscriptionStore = create<SubscriptionState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        subscription: null,
        isLoading: true,
        isInitialized: false,

        // Actions
        setSubscription: (subscription: UserSubscription) => {
            set({
                subscription,
                isLoading: false,
                isInitialized: true,
            });
        },

        updateFromUser: (user: any) => {
            const subscription = getUserSubscription(user);
            set({
                subscription,
                isLoading: false,
                isInitialized: true,
            });
        },

        reset: () => {
            set({
                subscription: null,
                isLoading: false,
                isInitialized: false,
            });
        },

        // Convenience getters
        getCurrentPlan: () => {
            const { subscription } = get();
            return subscription?.planSlug || DEFAULT_PLAN;
        },

        getFeatures: () => {
            const { subscription } = get();
            return subscription?.features || PLANS[DEFAULT_PLAN].features;
        },

        isPremium: () => {
            const { subscription } = get();
            return subscription?.planSlug !== DEFAULT_PLAN;
        },

        isActive: () => {
            const { subscription } = get();
            if (!subscription) return true; // Default plan is always active

            return (
                subscription.isActive &&
                (!subscription.expiresAt || subscription.expiresAt > new Date())
            );
        },

        // Upgrade helpers
        canUpgrade: () => {
            const { subscription } = get();
            return subscription?.planSlug === PlanSlug.VT_BASE;
        },

        getRequiredPlanFor: (feature: FeatureSlug) => {
            // Find the minimum plan that includes this feature
            for (const [planSlug, plan] of Object.entries(PLANS)) {
                if (plan.features.includes(feature)) {
                    return planSlug as PlanSlug;
                }
            }
            return null;
        },
    }))
);

/**
 * Hook for convenient subscription access
 */
export function useSubscription() {
    return useSubscriptionStore();
}

/**
 * Hook for getting current subscription info
 */
export function useCurrentSubscription() {
    const subscription = useSubscriptionStore(state => state.subscription);
    const getCurrentPlan = useSubscriptionStore(state => state.getCurrentPlan);
    const getFeatures = useSubscriptionStore(state => state.getFeatures);
    const isPremium = useSubscriptionStore(state => state.isPremium);
    const isActive = useSubscriptionStore(state => state.isActive);
    const isLoading = useSubscriptionStore(state => state.isLoading);

    return {
        subscription,
        currentPlan: getCurrentPlan(),
        features: getFeatures(),
        isPremium: isPremium(),
        isActive: isActive(),
        isLoading,
    };
}

/**
 * Hook for subscription upgrade helpers
 */
export function useSubscriptionUpgrade() {
    const canUpgrade = useSubscriptionStore(state => state.canUpgrade);
    const getRequiredPlanFor = useSubscriptionStore(state => state.getRequiredPlanFor);

    return {
        canUpgrade: canUpgrade(),
        getRequiredPlanFor,
    };
}

/**
 * Subscription store selectors for optimal re-renders
 */
export const subscriptionSelectors = {
    subscription: (state: SubscriptionState) => state.subscription,
    isLoading: (state: SubscriptionState) => state.isLoading,
    currentPlan: (state: SubscriptionState) => state.getCurrentPlan(),
    features: (state: SubscriptionState) => state.getFeatures(),
    isPremium: (state: SubscriptionState) => state.isPremium(),
    isActive: (state: SubscriptionState) => state.isActive(),
};
