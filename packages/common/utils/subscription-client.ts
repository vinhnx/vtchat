/**
 * Client-side subscription utilities
 * Utilities for managing subscription state and cache on the client
 */

/**
 * Invalidate subscription cache after payment completion
 * Call this after successful payment flows
 */
export async function invalidateSubscriptionCacheAfterPayment(): Promise<void> {
    try {
        const response = await fetch('/api/subscription/invalidate-cache', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Will invalidate current user's cache
        });

        if (response.ok) {
            console.log(
                '[Subscription Utils] Successfully invalidated server-side cache after payment'
            );
        } else {
            console.warn(
                '[Subscription Utils] Failed to invalidate server-side cache:',
                response.statusText
            );
        }
    } catch (error) {
        console.error('[Subscription Utils] Error invalidating server-side cache:', error);
    }

    // Also clear localStorage cache
    if (typeof window !== 'undefined') {
        const cacheKeys = Object.keys(localStorage).filter(key =>
            key.startsWith('subscription_status_')
        );
        cacheKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`[Subscription Utils] Cleared client cache: ${key}`);
        });
    }
}

/**
 * Clear all subscription-related cache and data on logout
 * Used by logout process to ensure clean state for next user
 */
export async function clearSubscriptionDataOnLogout(): Promise<void> {
    try {
        console.log('[Subscription Utils] Clearing subscription data on logout...');

        // Clear client-side localStorage cache
        if (typeof window !== 'undefined') {
            const subscriptionKeys = Object.keys(localStorage).filter(
                key =>
                    key.startsWith('subscription_status_') ||
                    key.startsWith('creem_') ||
                    key.startsWith('vt_plus_') ||
                    key.includes('subscription')
            );

            subscriptionKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log(
                `[Subscription Utils] Cleared ${subscriptionKeys.length} subscription cache entries`
            );
        }

        // Invalidate server-side cache (best effort)
        try {
            await fetch('/api/subscription/invalidate-cache', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            console.log('[Subscription Utils] Successfully invalidated server-side cache');
        } catch (serverError) {
            console.warn(
                '[Subscription Utils] Failed to invalidate server-side cache:',
                serverError
            );
            // Non-critical for logout flow
        }
    } catch (error) {
        console.error('[Subscription Utils] Error clearing subscription data:', error);
        throw error; // Re-throw so logout can handle gracefully
    }
}

/**
 * Check if user just returned from payment
 * Useful for triggering subscription refreshes
 */
export function isReturningFromPayment(): boolean {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    return (
        urlParams.has('checkout_success') ||
        urlParams.has('payment_success') ||
        urlParams.has('subscription_success') ||
        document.referrer.includes('creem.io') ||
        document.referrer.includes('checkout')
    );
}

/**
 * Set up payment return detection
 * Automatically refreshes subscription when returning from payment
 */
export function setupPaymentReturnDetection(onPaymentReturn: () => void): () => void {
    if (typeof window === 'undefined') return () => {};

    // Check immediately if already returning from payment
    if (isReturningFromPayment()) {
        console.log('[Subscription Utils] Detected return from payment on page load');
        onPaymentReturn();
    }

    // Listen for page visibility changes (user switching back to tab)
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isReturningFromPayment()) {
            console.log('[Subscription Utils] Detected return from payment on tab focus');
            onPaymentReturn();
        }
    };

    // Listen for popstate events (back button)
    const handlePopState = () => {
        if (isReturningFromPayment()) {
            console.log('[Subscription Utils] Detected return from payment on navigation');
            onPaymentReturn();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    // Return cleanup function
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', handlePopState);
    };
}

export default {
    invalidateSubscriptionCacheAfterPayment,
    isReturningFromPayment,
    setupPaymentReturnDetection,
    clearSubscriptionDataOnLogout,
};
