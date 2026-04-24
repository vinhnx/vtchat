'use client';

import { PlanSlug } from '@repo/shared/types/subscription';
import { useCallback } from 'react';

/**
 * Hook for interacting with Creem subscriptions
 * Provides methods for managing subscription portals and checkout flows
 */
export function useCreemSubscription() {
    const openCustomerPortal = useCallback(async () => {
        void 0;
    }, []);

    const startVtPlusSubscription = useCallback(async () => {
        void 0;
    }, []);

    return {
        isPlusSubscriber: false,
        subscriptionStatus: null,
        isLoading: false,
        isPortalLoading: false,
        error: null,
        openCustomerPortal,
        startVtPlusSubscription,
        refreshSubscriptionStatus: async () => undefined,
        isReady: true,
        plan: PlanSlug.VT_BASE,
        hasActiveSubscription: false,
    };
}

export default useCreemSubscription;
