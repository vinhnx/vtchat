'use client';

/**
 * @deprecated VT Chat Legacy Subscription Provider
 *
 * ⚠️ DEPRECATED: This provider is deprecated and should not be used.
 * Use the global SubscriptionProvider from '@repo/common/providers/subscription-provider' instead.
 *
 * The new global provider offers:
 * - Better performance with deduplication
 * - Centralized state management
 * - Automatic cache invalidation
 * - Proper sync with Neon DB and webhooks
 * - Session-based caching
 *
 * Migration: Replace this provider with SubscriptionProvider from subscription-provider.tsx
 *
 * React context provider that integrates Better Auth's user authentication
 * with our subscription system. Automatically syncs subscription state
 * when user data changes.
 */

import { useSession } from '@repo/shared/lib/auth-client';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useIsClient } from '../../hooks';

interface SubscriptionProviderProps {
    children: ReactNode;
}

interface SubscriptionContextValue {
    isReady: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
    isReady: false,
});

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
    console.warn(
        'Legacy SubscriptionProvider is deprecated. Use SubscriptionProvider from @repo/common/providers/subscription-provider instead.'
    );

    const { data: session } = useSession();
    const user = session?.user;
    const isLoaded = !!session;
    const isClient = useIsClient();
    // Legacy subscription provider - functionality disabled
    // const { updateFromUser, reset, isInitialized } = useSubscriptionStore(); // REMOVED
    const isInitialized = true; // Always ready in legacy mode

    // Sync subscription state with Better Auth user data - DISABLED in legacy provider
    useEffect(() => {
        // Legacy provider functionality disabled - use SubscriptionProvider from providers/subscription-provider instead
        console.warn(
            'Legacy SubscriptionProvider functionality disabled. Migrate to SubscriptionProvider from @repo/common/providers/subscription-provider'
        );
    }, [user, isLoaded, isClient]);

    const isReady = isLoaded && isInitialized && isClient;

    return (
        <SubscriptionContext.Provider value={{ isReady }}>{children}</SubscriptionContext.Provider>
    );
}

/**
 * @deprecated Hook to get subscription provider state
 * Use useGlobalSubscriptionStatus from SubscriptionProvider instead
 */
export function useSubscriptionProvider() {
    console.warn(
        'useSubscriptionProvider is deprecated. Use useGlobalSubscriptionStatus from SubscriptionProvider instead.'
    );
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscriptionProvider must be used within a SubscriptionProvider');
    }
    return context;
}

/**
 * Higher-order component to wrap components with subscription provider
 */
export function withSubscriptionProvider<P extends object>(Component: React.ComponentType<P>) {
    return function WrappedComponent(props: P) {
        return (
            <SubscriptionProvider>
                <Component {...props} />
            </SubscriptionProvider>
        );
    };
}
