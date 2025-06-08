'use client';

import { PaymentService } from '@repo/shared/config/payment';
import { useSession } from '@repo/shared/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useSubscriptionStatus } from './use-subscription-status';

/**
 * Hook for interacting with Creem subscriptions
 * Provides methods for managing subscription portals and checkout flows
 */
export function useCreemSubscription() {
    const { data: session } = useSession();
    const user = session?.user;
    const isUserLoaded = !!session;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use the new database-backed subscription status
    const {
        isPlusSubscriber,
        subscriptionStatus,
        refreshSubscriptionStatus,
        isLoading: subscriptionLoading,
    } = useSubscriptionStatus();

    /**
     * Open the Creem customer portal for managing subscription
     */
    const openCustomerPortal = useCallback(async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call the portal API endpoint instead of direct service call
            const response = await fetch('/api/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get portal URL: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.url) {
                // Open the portal URL in the same window
                window.location.href = result.url;
            } else {
                throw new Error('Failed to get portal URL');
            }
        } catch (err: any) {
            console.error('Error opening customer portal:', err);
            setError(err.message || 'Failed to open customer portal');
        } finally {
            setIsLoading(false);
        }
    }, [user, router]);

    /**
     * Start a checkout flow to subscribe to VT+
     */
    const startVtPlusSubscription = useCallback(async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await PaymentService.subscribeToVtPlus(user.email);

            if (result.success && result.url) {
                // Redirect to checkout
                window.location.href = result.url;
            } else {
                throw new Error('Failed to start checkout');
            }
        } catch (err: any) {
            console.error('Error starting subscription checkout:', err);
            setError(err.message || 'Failed to start checkout process');
        } finally {
            setIsLoading(false);
        }
    }, [user, router]);

    return {
        isPlusSubscriber,
        subscriptionStatus,
        isLoading: isLoading || subscriptionLoading,
        error,
        openCustomerPortal,
        startVtPlusSubscription,
        refreshSubscriptionStatus,
        isReady: isUserLoaded,
        // Convenience properties from subscription status
        creditsRemaining: subscriptionStatus?.creditsRemaining ?? 0,
        monthlyCredits: subscriptionStatus?.monthlyCredits ?? 50,
        plan: subscriptionStatus?.plan ?? 'free',
        hasActiveSubscription:
            subscriptionStatus?.hasSubscription && subscriptionStatus?.status === 'active',
    };
}

export default useCreemSubscription;
