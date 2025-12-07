'use client';

import { ApiRoutes } from '@repo/shared/constants/routes';
import { useSession } from '@repo/shared/lib/auth-client';
import { http } from '@repo/shared/lib/http-client';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import type { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { hasSubscriptionAccess } from '@repo/shared/utils/subscription-grace-period';
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
        setIsPortalReturn,
    } = useGlobalSubscriptionStatus();

    /**
     * Open the Creem customer portal for managing subscription
     * Opens in new tab due to X-Frame-Options restrictions
     */
    const openCustomerPortal = useCallback(async () => {
        log.info({}, '[useCreemSubscription] openCustomerPortal called');

        if (!user) {
            log.info({}, '[useCreemSubscription] User not authenticated, redirecting to login');
            router.push('/login');
            return;
        }

        setIsPortalLoading(true);
        setError(null);

        try {
            log.info({}, '[useCreemSubscription] Requesting customer portal for user');

            // Call the portal API endpoint using centralized HTTP client
            const result = await http.post<{ success: boolean; url?: string; error?: string; }>(
                '/api/portal',
                {
                    body: {
                        returnUrl: `${window.location.origin}/`, // Return to chat page
                    },
                },
            );

            if (result.success && result.url) {
                log.info({}, '[useCreemSubscription] Opening portal in new tab');

                // Open portal in new tab
                const portalWindow = window.open(result.url, '_blank');

                if (portalWindow) {
                    // Set up window messaging to detect when user returns
                    const handleMessage = (event: MessageEvent) => {
                        // Verify origin for security
                        if (
                            event.origin !== 'https://creem.io'
                            && event.origin !== 'https://test-creem.io'
                        ) {
                            return;
                        }

                        if (
                            event.data.type === 'PORTAL_CLOSED'
                            || event.data.type === 'PORTAL_COMPLETE'
                        ) {
                            log.info(
                                {},
                                '[useCreemSubscription] Portal tab closed, refreshing subscription',
                            );
                            setIsPortalReturn(true);
                            refreshSubscriptionStatus(false, 'manual');
                            window.removeEventListener('message', handleMessage);
                        }
                    };

                    // Listen for messages from portal
                    window.addEventListener('message', handleMessage);

                    // Also listen for window close (fallback)
                    const checkClosed = setInterval(() => {
                        if (portalWindow.closed) {
                            log.info(
                                {},
                                '[useCreemSubscription] Portal tab closed, refreshing subscription',
                            );
                            setIsPortalReturn(true);
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
                        10 * 60 * 1000,
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
                        'Failed to open portal tab. Please allow popups for this site.',
                    );
                }
            } else {
                throw new Error(result.error || 'Failed to get portal URL');
            }
        } catch (err: any) {
            log.error({ err }, '[useCreemSubscription] Error opening customer portal');
            setError(err.message || 'Failed to open customer portal');
            toast({
                title: 'Portal Error',
                description: err.message || 'Failed to open customer portal. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsPortalLoading(false);
        }
    }, [user, router, toast, refreshSubscriptionStatus, setIsPortalReturn]);

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
            // Call the checkout API endpoint using centralized HTTP client
            const result = await http.post<{ success: boolean; url?: string; message?: string; }>(
                ApiRoutes.CHECKOUT,
                {
                    body: {
                        priceId: PlanSlug.VT_PLUS, // Using the PlanSlug.VT_PLUS value
                    },
                },
            );

            if (result.success && result.url) {
                // Refresh subscription status with payment trigger before redirecting
                refreshSubscriptionStatus(false, 'payment');

                // Show loading state before redirect
                toast({
                    title: 'Redirecting to Payment...',
                    description: 'Please wait while we redirect you to complete your subscription.',
                });

                // Redirect to checkout
                window.location.href = result.url;
            } else {
                // Handle cases where response was OK, but the operation wasn't successful according to the payload
                const errorMessage = result.message
                    || 'Failed to start checkout: Invalid server response.';
                log.error(
                    { errorMessage },
                    'Error starting subscription checkout (result not success)',
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
            log.error({ err }, 'Unexpected error during subscription checkout (catch block)');
            // Check if err.message exists, otherwise provide a generic message
            const errorMessage = err instanceof Error && err.message
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
    }, [user, router, toast, refreshSubscriptionStatus]);

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
        hasActiveSubscription: (() => {
            if (!subscriptionStatus?.hasSubscription) return false;

            // Use centralized grace period logic to handle all statuses properly
            return hasSubscriptionAccess({
                status: subscriptionStatus.status as SubscriptionStatusEnum,
                currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
            });
        })(),
    };
}

export default useCreemSubscription;
