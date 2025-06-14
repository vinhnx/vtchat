'use client';

/**
 * VT Chat Subscription Provider
 *
 * React context provider that integrates Better Auth's user authentication
 * with our subscription system. Automatically syncs subscription state
 * when user data changes.
 */

import { useSession } from '@repo/shared/lib/auth-client';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useIsClient } from '../../hooks';
import { useSubscriptionStore } from '../../store/subscription.store';

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
    const { data: session } = useSession();
    const user = session?.user;
    const isLoaded = !!session;
    const isClient = useIsClient();
    const { updateFromUser, reset, isInitialized } = useSubscriptionStore();

    // Sync subscription state with Better Auth user data
    useEffect(() => {
        if (!isLoaded || !isClient) return;

        if (user) {
            updateFromUser(user);
        } else {
            // User is not signed in, reset to default state
            reset();
        }
    }, [user, isLoaded, isClient, updateFromUser, reset]);

    const isReady = isLoaded && isInitialized && isClient;

    return (
        <SubscriptionContext.Provider value={{ isReady }}>{children}</SubscriptionContext.Provider>
    );
}

/**
 * Hook to get subscription provider state
 */
export function useSubscriptionProvider() {
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
