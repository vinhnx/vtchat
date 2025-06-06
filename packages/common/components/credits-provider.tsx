'use client';

/**
 * Credits Provider Component
 *
 * Integrates credits system with Better Auth user authentication.
 * Automatically syncs credit balance from the database
 * where the webhook stores purchased credits.
 */

import { useSession } from '@repo/shared/lib/auth-client';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useCreditsStore } from '../store/credits.store';

interface CreditsProviderProps {
    children: ReactNode;
}

interface CreditsContextValue {
    isReady: boolean;
    balance: number;
    isLoading: boolean;
}

const CreditsContext = createContext<CreditsContextValue>({
    isReady: false,
    balance: 0,
    isLoading: true,
});

export function CreditsProvider({ children }: CreditsProviderProps) {
    const { data: session } = useSession();
    const user = session?.user;
    const isLoaded = !!session;
    const { updateFromUser, reset, isInitialized, balance, isLoading } = useCreditsStore();

    // Sync credits state with Better Auth user data
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            updateFromUser(user);
        } else {
            // User is not signed in, reset to default state
            reset();
        }
    }, [user, isLoaded, updateFromUser, reset]);

    // Watch for changes in user credits from database
    useEffect(() => {
        if (!user) return;

        // For Better Auth, we'll need to fetch credits from our API
        // This will be handled by the credits store
        if (isInitialized) {
            updateFromUser(user);
        }
    }, [user, isInitialized, updateFromUser]);

    const isReady = isLoaded && isInitialized;

    return (
        <CreditsContext.Provider
            value={{
                isReady,
                balance,
                isLoading,
            }}
        >
            {children}
        </CreditsContext.Provider>
    );
}

/**
 * Hook to get credits provider state
 */
export function useCreditsProvider() {
    const context = useContext(CreditsContext);
    if (!context) {
        throw new Error('useCreditsProvider must be used within a CreditsProvider');
    }
    return context;
}

/**
 * Higher-order component to wrap components with credits provider
 */
export function withCreditsProvider<P extends object>(Component: React.ComponentType<P>) {
    return function WrappedComponent(props: P) {
        return (
            <CreditsProvider>
                <Component {...props} />
            </CreditsProvider>
        );
    };
}
