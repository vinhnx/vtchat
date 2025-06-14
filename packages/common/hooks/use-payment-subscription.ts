'use client';

import { ApiRoutes } from '@repo/shared/constants/routes';
import { useSession } from '@repo/shared/lib/auth-client';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { useToast } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider';

/**
 * Hook for interacting with Creem subscriptions
 * Provides methods for managing subscription portals and checkout flows
 */
export function useCreemSubscription() {
    const { toast } = useToast();
    const { data: session } = useSession();
    const user = session?.user;
    const isUserLoaded = !!session;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use the global subscription provider
    const {
        isPlusSubscriber,
        subscriptionStatus,
        refreshSubscriptionStatus,
        isLoading: subscriptionLoading,
    } = useGlobalSubscriptionStatus();

    /**
     * Open the Creem customer portal for managing subscription
     * Opens in new tab due to X-Frame-Options restrictions
     */
    const openCustomerPortal = useCallback(async () => {
        console.log('[useCreemSubscription] openCustomerPortal called');

        if (!user) {
            console.log('[useCreemSubscription] User not authenticated, redirecting to login');
            router.push('/login');
            return;
        }

        setIsPortalLoading(true);
        setError(null);

        try {
            console.log('[useCreemSubscription] Requesting customer portal for user:', user.id);

            // Call the portal API endpoint
            const response = await fetch('/api/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    returnUrl: `${window.location.origin}/chat`, // Return to chat page
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    '[useCreemSubscription] Portal API error:',
                    response.status,
                    errorText
                );
                throw new Error(
                    `Failed to get portal URL: ${response.status} ${response.statusText}`
                );
            }

            const result = await response.json();
            console.log('[useCreemSubscription] Portal API response:', result);

            if (result.success && result.url) {
                console.log('[useCreemSubscription] Opening portal in new tab:', result.url);

                // Open portal in new tab
                const portalWindow = window.open(result.url, '_blank');

                if (portalWindow) {
                    // Set up window messaging to detect when user returns
                    const handleMessage = (event: MessageEvent) => {
                        // Verify origin for security
                        if (
                            event.origin !== 'https://creem.io' &&
                            event.origin !== 'https://test-creem.io'
                        ) {
                            return;
                        }

                        if (
                            event.data.type === 'PORTAL_CLOSED' ||
                            event.data.type === 'PORTAL_COMPLETE'
                        ) {
                            console.log(
                                '[useCreemSubscription] Portal tab closed, refreshing subscription'
                            );
                            refreshSubscriptionStatus(false, 'manual');
                            window.removeEventListener('message', handleMessage);
                        }
                    };

                    // Listen for messages from portal
                    window.addEventListener('message', handleMessage);

                    // Also listen for window close (fallback)
                    const checkClosed = setInterval(() => {
                        if (portalWindow.closed) {
                            console.log(
                                '[useCreemSubscription] Portal tab closed, refreshing subscription'
                            );
                            refreshSubscriptionStatus(false, 'manual');
                            clearInterval(checkClosed);
                            window.removeEventListener('message', handleMessage);
                        }
                    }, 1000);

                    // Clean up after 10 minutes
                    setTimeout(
                        () => {
                            clearInterval(checkClosed);
                            window.removeEventListener('message', handleMessage);
                        },
                        10 * 60 * 1000
                    );

                    // Show success message
                    toast({
                        title: 'Portal Opened',
                        description:
                            "Manage your subscription in the new tab. We'll refresh your status when you return.",
                        variant: 'default',
                    });
                } else {
                    throw new Error(
                        'Failed to open portal tab. Please allow popups for this site.'
                    );
                }
            } else {
                throw new Error(result.error || 'Failed to get portal URL');
            }
        } catch (err: any) {
            console.error('[useCreemSubscription] Error opening customer portal:', err);
            setError(err.message || 'Failed to open customer portal');
            toast({
                title: 'Portal Error',
                description: err.message || 'Failed to open customer portal. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsPortalLoading(false);
        }
    }, [user, router, toast, refreshSubscriptionStatus]);

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
            // Call the checkout API endpoint instead of direct service call
            const response = await fetch(ApiRoutes.CHECKOUT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: PlanSlug.VT_PLUS, // Using the PlanSlug.VT_PLUS value
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage =
                    errorData.message || `Failed to start checkout: ${response.statusText}`;
                console.error('Error starting subscription checkout (!response.ok):', errorMessage);
                setError(errorMessage);
                toast({
                    title: 'Subscription Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
                return; // Exit after handling
            }

            const result = await response.json(); // This could also throw if response.ok but body is not JSON

            if (result.success && result.url) {
                // Refresh subscription status with payment trigger before redirecting
                refreshSubscriptionStatus(false, 'payment');

                // Redirect to checkout
                window.location.href = result.url;
            } else {
                // Handle cases where response was OK, but the operation wasn't successful according to the payload
                const errorMessage =
                    result.message || 'Failed to start checkout: Invalid server response.';
                console.error(
                    'Error starting subscription checkout (result not success):',
                    errorMessage
                );
                setError(errorMessage);
                toast({
                    title: 'Subscription Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
                return; // Exit after handling
            }
        } catch (err: any) {
            // This catch block handles:
            // 1. Network errors before/during fetch.
            // 2. Errors if `response.json()` fails (e.g., if `response.ok` was true but body wasn't valid JSON).
            // 3. Any other unexpected errors in the try block.
            console.error('Unexpected error during subscription checkout (catch block):', err);
            // Check if err.message exists, otherwise provide a generic message
            const errorMessage =
                err instanceof Error && err.message
                    ? err.message
                    : 'An unexpected error occurred during the checkout process.';
            setError(errorMessage);
            toast({
                title: 'Subscription Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, router, toast]);

    return {
        isPlusSubscriber,
        subscriptionStatus,
        isLoading: isLoading || subscriptionLoading,
        isPortalLoading,
        error,
        openCustomerPortal,
        startVtPlusSubscription,
        refreshSubscriptionStatus,
        isReady: isUserLoaded,
        // Convenience properties from subscription status
        plan: subscriptionStatus?.plan ?? PlanSlug.VT_BASE,
        hasActiveSubscription:
            subscriptionStatus?.hasSubscription &&
            subscriptionStatus?.status === SubscriptionStatusEnum.ACTIVE,
    };
}

export default useCreemSubscription;
