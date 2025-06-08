'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { useCallback, useEffect, useState } from 'react';
import { VT_BASE_PRODUCT_INFO } from '../../shared/config/payment';
import { PlanSlug } from '../../shared/types/subscription';

export interface SubscriptionStatus {
    plan: string;
    status: string;
    isPlusSubscriber: boolean;
    currentPeriodEnd?: Date;
    hasSubscription: boolean;
    subscriptionId?: string;
    productInfo?: any;
}

/**
 * Hook to get subscription status from the database
 * This replaces the metadata-based subscription checking
 */
export function useSubscriptionStatus() {
    const { data: session } = useSession();
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptionStatus = useCallback(async () => {
        if (!session?.user) {
            setSubscriptionStatus(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/subscription/status');

            if (!response.ok) {
                throw new Error(`Failed to fetch subscription status: ${response.statusText}`);
            }

            const status = await response.json();

            // Convert date strings back to Date objects
            if (status.currentPeriodEnd) {
                status.currentPeriodEnd = new Date(status.currentPeriodEnd);
            }

            setSubscriptionStatus(status);
        } catch (err) {
            console.error('Error fetching subscription status:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');

            // Fallback to default free plan on error
            const fallbackFreeTier: SubscriptionStatus = {
                plan: PlanSlug.VT_BASE,
                status: 'active',
                isPlusSubscriber: false,
                hasSubscription: false,
                productInfo: VT_BASE_PRODUCT_INFO,
            };
            setSubscriptionStatus(fallbackFreeTier);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user]);

    // Fetch subscription status when session changes
    useEffect(() => {
        fetchSubscriptionStatus();
    }, [fetchSubscriptionStatus]);

    // Refresh subscription status - useful after purchases
    const refreshSubscriptionStatus = useCallback(() => {
        fetchSubscriptionStatus();
    }, [fetchSubscriptionStatus]);

    return {
        subscriptionStatus,
        isLoading,
        error,
        refreshSubscriptionStatus, // Ensure this is returned
        // Convenience properties
        isPlusSubscriber: subscriptionStatus?.isPlusSubscriber ?? false,
        plan: subscriptionStatus?.plan ?? 'free',
        hasActiveSubscription:
            subscriptionStatus?.hasSubscription && subscriptionStatus?.status === 'active',
    };
}
