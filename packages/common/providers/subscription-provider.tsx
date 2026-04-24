'use client';

/**
 * Global Subscription Provider
 *
 * Provides centralized subscription state management to prevent multiple API calls.
 * Uses the optimized session-cached API endpoint and shares state across all components.
 */

import { useSession } from '@repo/shared/lib/auth-client';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PortalReturnIndicator } from '../components/portal-return-indicator';

const VT_BASE_PRODUCT_INFO = {
    id: 'free_tier',
    name: 'Free',
    description: 'Included access for all signed-in users',
    features: [],
};

export interface SubscriptionStatus {
    plan: string;
    status: string;
    isPlusSubscriber: boolean;
    currentPeriodEnd?: Date;
    hasSubscription: boolean;
    subscriptionId?: string;
    productInfo?: any;
    fromCache?: boolean;
    cachedAt?: Date;
    fetchCount?: number;
    lastRefreshTrigger?: 'initial' | 'payment' | 'expiration' | 'page_refresh' | 'manual';
    isAnonymous?: boolean;
}

type RefreshTrigger = 'initial' | 'payment' | 'expiration' | 'page_refresh' | 'manual';

interface SubscriptionContextType {
    subscriptionStatus: SubscriptionStatus | null;
    isLoading: boolean;
    error: string | null;
    refreshSubscriptionStatus: (forceRefresh?: boolean, trigger?: RefreshTrigger) => Promise<void>;

    // Portal return state
    isPortalReturn: boolean;
    setIsPortalReturn: (value: boolean) => void;

    // Portal loading state
    isPortalLoading: boolean;
    setIsPortalLoading: (value: boolean) => void;

    // Convenience properties
    isPlusSubscriber: boolean;
    plan: string;
    hasActiveSubscription: boolean;
    isAnonymous: boolean;
    fromCache: boolean;
    fetchCount: number;
    lastRefreshTrigger?: string;
    cachedAt?: Date;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

let globalSubscriptionStatus: SubscriptionStatus | null = null;

// Export function to access global subscription status synchronously
export function getGlobalSubscriptionStatus(): SubscriptionStatus | null {
    return globalSubscriptionStatus;
}

// Export function to reset global state (for sign-out cleanup)
export function resetGlobalSubscriptionState(): void {
    globalSubscriptionStatus = null;
}

// Clean up global state on hot module reload in development
if (typeof module !== 'undefined' && module.hot) {
    module.hot.dispose(() => {
        resetGlobalSubscriptionState();
    });
}

interface SubscriptionProviderProps {
    children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
    const { data: session } = useSession();
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(
        globalSubscriptionStatus,
    );
    const [isPortalReturn, setIsPortalReturn] = useState(false);
    const [isPortalLoading, setIsPortalLoading] = useState(false);

    // Track previous user ID to detect sign-out
    const [previousUserId, setPreviousUserId] = useState<string | null>(session?.user?.id || null);

    const createFreeStatus = useCallback((trigger: RefreshTrigger): SubscriptionStatus => {
        const status: SubscriptionStatus = {
            plan: PlanSlug.VT_BASE,
            status: SubscriptionStatusEnum.ACTIVE,
            isPlusSubscriber: false,
            hasSubscription: false,
            productInfo: VT_BASE_PRODUCT_INFO,
            isAnonymous: !session?.user,
            fromCache: true,
            cachedAt: new Date(),
            fetchCount: 1,
            lastRefreshTrigger: trigger,
        };

        globalSubscriptionStatus = status;
        return status;
    }, [session?.user]);

    const fetchSubscriptionStatus = useCallback(
        async (trigger: RefreshTrigger = 'initial', forceRefresh = false) => {
            void forceRefresh;
            const status = createFreeStatus(trigger);
            setSubscriptionStatus(status);
            return status;
        },
        [createFreeStatus],
    );

    // Initial fetch when provider mounts - this handles page refresh
    useEffect(() => {
        const trigger = globalSubscriptionStatus ? 'page_refresh' : 'initial';
        void fetchSubscriptionStatus(trigger);
    }, [fetchSubscriptionStatus]);

    // Trigger subscription status check when session becomes available or changes
    useEffect(() => {
        if (session?.user) {
            void fetchSubscriptionStatus('initial', false);
        }
    }, [session?.user, fetchSubscriptionStatus]);

    // Clean up global state when user signs out to prevent memory leaks
    useEffect(() => {
        const currentUserId = session?.user?.id || null;

        // If we had a user before but don't now (sign-out) or user changed, reset global state
        if (previousUserId && !currentUserId) {
            resetGlobalSubscriptionState();
            setSubscriptionStatus(createFreeStatus('manual'));
        } else if (previousUserId && currentUserId && previousUserId !== currentUserId) {
            resetGlobalSubscriptionState();
            setSubscriptionStatus(createFreeStatus('manual'));
        }

        // Update tracked user ID
        setPreviousUserId(currentUserId);
    }, [session?.user?.id, previousUserId, createFreeStatus]);

    // Refresh subscription status - useful after purchases or manual refresh
    const refreshSubscriptionStatus = useCallback(
        async (forceRefresh = false, trigger: RefreshTrigger = 'manual') => {
            await fetchSubscriptionStatus(trigger, forceRefresh);
        },
        [fetchSubscriptionStatus],
    );

    // Auto-refresh when returning from payment (detect URL changes)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('checkout_success') || urlParams.has('payment_success')) {
                    setIsPortalReturn(true);
                    void refreshSubscriptionStatus(true, 'payment');
                    if (window.history.replaceState) {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('checkout_success');
                        url.searchParams.delete('payment_success');
                        window.history.replaceState({}, document.title, url.toString());
                    }
                }
            }
        };

        const handlePopState = () => {
            // Handle browser back/forward navigation
            refreshSubscriptionStatus(false, 'page_refresh');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('popstate', handlePopState);

        const handleBeforeUnload = () => {
            // Clear any pending requests before page unload
            resetGlobalSubscriptionState();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [refreshSubscriptionStatus]); // Include dependency but it's stable due to useCallback

    // Check subscription expiration periodically
    useEffect(() => {
        return undefined;
    }, [subscriptionStatus]);

    const contextValue: SubscriptionContextType = {
        subscriptionStatus: subscriptionStatus ?? createFreeStatus('initial'),
        isLoading: false,
        error: null,
        refreshSubscriptionStatus: async () => undefined,
        isPortalReturn,
        setIsPortalReturn,
        isPortalLoading,
        setIsPortalLoading,
        isPlusSubscriber: false,
        plan: PlanSlug.VT_BASE,
        hasActiveSubscription: false,
        isAnonymous: !session?.user,
        fromCache: true,
        fetchCount: 1,
        lastRefreshTrigger: 'initial',
        cachedAt: new Date(),
    };

    return (
        <SubscriptionContext.Provider value={contextValue}>
            {children}
            <PortalReturnIndicator
                isVisible={isPortalReturn}
                onComplete={() => setIsPortalReturn(false)}
            />
        </SubscriptionContext.Provider>
    );
}

/**
 * Hook to access subscription context
 * This replaces the individual useSubscriptionStatus calls
 */
export function useGlobalSubscriptionStatus(): SubscriptionContextType {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useGlobalSubscriptionStatus must be used within a SubscriptionProvider');
    }
    return context;
}

/**
 * Legacy hook for backward compatibility
 * Wraps the global subscription context
 */
export function useSubscriptionStatus() {
    log.warn({}, 'useSubscriptionStatus is deprecated. Use useGlobalSubscriptionStatus instead.');
    return useGlobalSubscriptionStatus();
}
