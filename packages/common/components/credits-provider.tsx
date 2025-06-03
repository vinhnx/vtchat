'use client';

/**
 * Credits Provider Component
 *
 * Integrates Polar.sh credits system with Clerk user authentication.
 * Automatically syncs credit balance from Clerk user privateMetadata
 * where the webhook stores purchased credits.
 */

import { useUser } from '@clerk/nextjs';
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
    const { user, isLoaded } = useUser();
    const { updateFromUser, reset, isInitialized, balance, isLoading } = useCreditsStore();

    // Sync credits state with Clerk user data
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            updateFromUser(user);
        } else {
            // User is not signed in, reset to default state
            reset();
        }
    }, [user, isLoaded, updateFromUser, reset]);

    // Watch for changes in user privateMetadata.credits
    useEffect(() => {
        if (!user) return;

        // Access the private metadata more safely using getField / publicMetadata
        // This depends on Clerk API version, but using a type cast to avoid a breaking change
        const userCredits = (user as any).privateMetadata?.credits || 0;

        // Only update if the credits changed (to avoid unnecessary re-renders)
        if (userCredits !== balance && isInitialized) {
            updateFromUser(user);
        }
    }, [user, balance, isInitialized, updateFromUser]);

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
