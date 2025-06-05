'use client';

import { useUser } from '@clerk/nextjs';
import { CreemService } from '@repo/shared/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useVtPlusAccess } from './use-subscription-access';

/**
 * Hook for interacting with Creem subscriptions
 * Provides methods for managing subscription portals and checkout flows
 */
export function useCreemSubscription() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use the existing hook to check VT+ access
    const isPlusSubscriber = useVtPlusAccess();

    /**
     * Open the Creem customer portal for managing subscription
     */
    const openCustomerPortal = useCallback(async () => {
        if (!user) {
            router.push('/sign-in');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await CreemService.getPortalUrl();

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
            router.push('/sign-in');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await CreemService.subscribeToVtPlus();

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
        isLoading,
        error,
        openCustomerPortal,
        startVtPlusSubscription,
        isReady: isUserLoaded,
    };
}

export default useCreemSubscription;
