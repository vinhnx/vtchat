'use client';

/**
 * Global Subscription Provider
 *
 * Provides centralized subscription state management to prevent multiple API calls.
 * Uses the optimized session-cached API endpoint and shares state across all components.
 */

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status'; // Corrected import
import { requestDeduplicator } from '@repo/shared/utils/request-deduplication';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { VT_BASE_PRODUCT_INFO } from '../../shared/config/payment';
import { PortalReturnIndicator } from '../components/portal-return-indicator';

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

// Global state to prevent multiple simultaneous requests
let globalFetchPromise: Promise<SubscriptionStatus> | null = null;
let globalSubscriptionStatus: SubscriptionStatus | null = null;
let globalIsLoading = true;
let globalError: string | null = null;

interface SubscriptionProviderProps {
    children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
    const { data: session } = useSession();
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(
        globalSubscriptionStatus
    );
    const [isLoading, setIsLoading] = useState(globalIsLoading);
    const [error, setError] = useState<string | null>(globalError);
    const [isPortalReturn, setIsPortalReturn] = useState(false);
    const [isPortalLoading, setIsPortalLoading] = useState(false);

    const fetchSubscriptionStatus = useCallback(
        async (trigger: RefreshTrigger = 'initial', forceRefresh = false) => {
            const userId = session?.user?.id || null;
            const userDescription = userId ? `user ${userId}` : 'anonymous user';

            // For anonymous users, immediately return basic anonymous tier without API calls
            if (!userId) {
                log.info(
                    '[Subscription Provider] Returning basic anonymous tier for anonymous user'
                );
                const anonymousStatus: SubscriptionStatus = {
                    plan: PlanSlug.ANONYMOUS,
                    status: SubscriptionStatusEnum.ACTIVE,
                    isPlusSubscriber: false,
                    hasSubscription: false,
                    productInfo: VT_BASE_PRODUCT_INFO,
                    isAnonymous: true,
                    fromCache: false,
                    cachedAt: new Date(),
                    fetchCount: 1,
                    lastRefreshTrigger: trigger,
                };

                globalSubscriptionStatus = anonymousStatus;
                globalIsLoading = false;
                globalError = null;
                setSubscriptionStatus(anonymousStatus);
                setIsLoading(false);
                setError(null);
                return anonymousStatus;
            }

            // If there's already a global fetch in progress and not forcing refresh, wait for it
            if (globalFetchPromise && !forceRefresh) {
                log.info(
                    { userDescription },
                    '[Subscription Provider] Using existing global fetch'
                );
                const result = await globalFetchPromise;
                setSubscriptionStatus(result);
                setIsLoading(false);
                setError(null);
                return result;
            }

            try {
                setIsLoading(true);
                setError(null);
                globalIsLoading = true;
                globalError = null;

                log.info(
                    { userDescription, trigger },
                    '[Subscription Provider] Starting global fetch'
                );

                // Create the global fetch promise with deduplication
                const requestKey = `subscription-${userId}-${trigger}`;
                globalFetchPromise = requestDeduplicator.deduplicate(requestKey, async () => {
                    // Build API URL with trigger and force refresh parameters
                    const params = new URLSearchParams({
                        trigger,
                        ...(forceRefresh && { force: 'true' }),
                    });

                    // Create AbortController for timeout (increased to 10s for dev environments)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                    }, 10_000); // 10 second timeout

                    try {
                        const response = await fetch(`/api/subscription/status?${params}`, {
                            signal: controller.signal,
                            headers: {
                                'Cache-Control': 'no-cache',
                            },
                        });

                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            throw new Error(
                                `Failed to fetch subscription status: ${response.statusText}`
                            );
                        }

                        const status = await response.json();

                        // Convert date strings back to Date objects
                        if (status.currentPeriodEnd) {
                            status.currentPeriodEnd = new Date(status.currentPeriodEnd);
                        }
                        if (status.cachedAt) {
                            status.cachedAt = new Date(status.cachedAt);
                        }

                        // Add product info for display purposes
                        if (status.plan === PlanSlug.VT_BASE) {
                            status.productInfo = VT_BASE_PRODUCT_INFO;
                        }

                        return status;
                    } catch (error) {
                        clearTimeout(timeoutId);

                        if (error instanceof Error && error.name === 'AbortError') {
                            throw new Error('Subscription fetch timeout (10s)');
                        }
                        throw error;
                    }
                });

                // Wait for the result
                const result = await globalFetchPromise;

                // Update global and local state
                globalSubscriptionStatus = result;
                globalIsLoading = false;
                setSubscriptionStatus(result);
                setIsLoading(false);

                log.info(
                    result
                        ? {
                              plan: result.plan,
                              isPlusSubscriber: result.isPlusSubscriber,
                              fromCache: result.fromCache,
                              fetchCount: result.fetchCount,
                              trigger: result.lastRefreshTrigger,
                          }
                        : {},
                    `Global fetch completed for ${userDescription}`
                );

                // Clear the global promise after a short delay to allow other components to use it
                setTimeout(() => {
                    globalFetchPromise = null;
                }, 1000); // Keep for 1 second

                return result;
            } catch (err) {
                log.error(
                    { error: err instanceof Error ? err.message : 'Unknown error' },
                    'Error fetching subscription status'
                );
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';

                // Update global and local error state
                globalError = errorMessage;
                globalIsLoading = false;
                setError(errorMessage);
                setIsLoading(false);

                // Clear the failed promise
                globalFetchPromise = null;

                // Fallback to default free plan on error
                const fallbackFreeTier: SubscriptionStatus = {
                    plan: PlanSlug.VT_BASE,
                    status: SubscriptionStatusEnum.ACTIVE,
                    isPlusSubscriber: false,
                    hasSubscription: false,
                    productInfo: VT_BASE_PRODUCT_INFO,
                    isAnonymous: !session?.user,
                };

                globalSubscriptionStatus = fallbackFreeTier;
                setSubscriptionStatus(fallbackFreeTier);

                throw err;
            }
        },
        [session?.user]
    );

    // Initial fetch when provider mounts or session changes
    useEffect(() => {
        // If we already have global data and no session change, don't refetch
        if (globalSubscriptionStatus && !globalIsLoading) {
            setSubscriptionStatus(globalSubscriptionStatus);
            setIsLoading(false);
            setError(globalError);
            return;
        }

        fetchSubscriptionStatus('initial');
    }, [fetchSubscriptionStatus]);

    // Trigger subscription status check when session becomes available or changes
    useEffect(() => {
        if (session?.user) {
            log.info({}, 'Session detected, refreshing subscription status');
            fetchSubscriptionStatus('initial', false);
        }
    }, [session?.user, fetchSubscriptionStatus]);

    // Refresh subscription status - useful after purchases or manual refresh
    const refreshSubscriptionStatus = useCallback(
        async (forceRefresh = false, trigger: RefreshTrigger = 'manual') => {
            await fetchSubscriptionStatus(trigger, forceRefresh);
        },
        [fetchSubscriptionStatus]
    );

    // Auto-refresh when returning from payment (detect URL changes)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Check if we're returning from a payment flow
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('checkout_success') || urlParams.has('payment_success')) {
                    log.info({}, 'Detected return from payment, refreshing subscription');
                    setIsPortalReturn(true);
                    refreshSubscriptionStatus(true, 'payment');

                    // Clean up URL parameters after handling
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

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [refreshSubscriptionStatus]);

    // Check subscription expiration periodically
    useEffect(() => {
        if (!subscriptionStatus?.currentPeriodEnd) return;

        const checkExpiration = () => {
            const now = new Date();
            const expiryDate = new Date(subscriptionStatus.currentPeriodEnd!);
            const timeDiff = expiryDate.getTime() - now.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);

            // Refresh when close to expiration (within 1 day) or already expired
            if (daysDiff <= 1) {
                log.info({}, 'Subscription near expiration, refreshing');
                refreshSubscriptionStatus(true, 'expiration');
            }
        };

        // Check expiration on mount and every hour
        checkExpiration();
        const interval = setInterval(checkExpiration, 60 * 60 * 1000); // 1 hour

        return () => clearInterval(interval);
    }, [subscriptionStatus?.currentPeriodEnd, refreshSubscriptionStatus]);

    const contextValue: SubscriptionContextType = {
        subscriptionStatus,
        isLoading,
        error,
        refreshSubscriptionStatus,

        // Portal return state
        isPortalReturn,
        setIsPortalReturn,

        // Portal loading state
        isPortalLoading,
        setIsPortalLoading,

        // Convenience properties
        isPlusSubscriber: subscriptionStatus?.isPlusSubscriber ?? false,
        plan: subscriptionStatus?.plan ?? PlanSlug.VT_BASE,
        hasActiveSubscription:
            (subscriptionStatus?.hasSubscription &&
                subscriptionStatus?.status === SubscriptionStatusEnum.ACTIVE) ??
            false,
        isAnonymous: subscriptionStatus?.isAnonymous ?? !session?.user,
        fromCache: subscriptionStatus?.fromCache ?? false,
        fetchCount: subscriptionStatus?.fetchCount ?? 0,
        lastRefreshTrigger: subscriptionStatus?.lastRefreshTrigger,
        cachedAt: subscriptionStatus?.cachedAt,
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
