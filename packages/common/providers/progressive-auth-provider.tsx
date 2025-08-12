'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface ProgressiveAuthState {
    // Stage 1: Basic login status (200ms)
    isLoading: boolean;
    isLoggedIn: boolean;

    // Stage 2: User identity (300ms)
    userId?: string;
    displayName?: string;

    // Stage 3: Full profile (500ms)
    user?: Record<string, unknown>;

    // Stage 4: Advanced features (800ms)
    isAdmin?: boolean;
    subscription?: Record<string, unknown>;

    // Current loading stage
    currentStage: AuthLoadingStage;
}

enum AuthLoadingStage {
    INITIAL = 'initial',
    BASIC_STATUS = 'basic-status', // 200ms: logged in/out
    USER_IDENTITY = 'user-identity', // 300ms: user ID, name
    FULL_PROFILE = 'full-profile', // 500ms: complete user data
    ADVANCED_FEATURES = 'advanced', // 800ms: admin, subscription
}

const ProgressiveAuthContext = createContext<ProgressiveAuthState | null>(null);

interface ProgressiveAuthProviderProps {
    children: ReactNode;
}

/**
 * Progressive authentication provider that loads auth data in stages
 * Stage 1 (200ms): Basic login status
 * Stage 2 (300ms): User identity (ID, name)
 * Stage 3 (500ms): Full user profile
 * Stage 4 (800ms): Advanced features (admin, subscription)
 */
export function ProgressiveAuthProvider({ children }: ProgressiveAuthProviderProps) {
    const [authState, setAuthState] = useState<ProgressiveAuthState>({
        isLoading: true,
        isLoggedIn: false,
        currentStage: AuthLoadingStage.INITIAL,
    });

    const { data: session } = useSession();

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        // Stage 1: Basic login status (200ms)
        timeouts.push(
            setTimeout(() => {
                setAuthState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isLoggedIn: !!session,
                    currentStage: AuthLoadingStage.BASIC_STATUS,
                }));

                if (typeof console !== 'undefined') {
                    // Auth Stage 1 complete - basic status
                }
            }, 200),
        );

        // Stage 2: User identity (300ms)
        timeouts.push(
            setTimeout(() => {
                if (session?.user) {
                    setAuthState((prev) => ({
                        ...prev,
                        userId: session.user.id,
                        displayName: session.user.name || session.user.email,
                        currentStage: AuthLoadingStage.USER_IDENTITY,
                    }));

                    if (typeof console !== 'undefined') {
                        // Auth Stage 2 complete - user identity
                    }
                }
            }, 300),
        );

        // Stage 3: Full profile (500ms)
        timeouts.push(
            setTimeout(() => {
                if (session?.user) {
                    setAuthState((prev) => ({
                        ...prev,
                        user: session.user,
                        currentStage: AuthLoadingStage.FULL_PROFILE,
                    }));

                    if (typeof console !== 'undefined') {
                        // Auth Stage 3 complete - full profile
                    }
                }
            }, 500),
        );

        // Stage 4: Advanced features (800ms)
        timeouts.push(
            setTimeout(() => {
                // This would normally load admin status and subscription data
                // For now, we'll defer this to background loading
                setAuthState((prev) => ({
                    ...prev,
                    currentStage: AuthLoadingStage.ADVANCED_FEATURES,
                }));

                if (typeof console !== 'undefined') {
                    // Auth Stage 4 complete - advanced features
                }
            }, 800),
        );

        // Cleanup timeouts on unmount
        return () => {
            timeouts.forEach((timeout) => clearTimeout(timeout));
        };
    }, [session]);

    return (
        <ProgressiveAuthContext.Provider value={authState}>
            {children}
        </ProgressiveAuthContext.Provider>
    );
}

/**
 * Hook to access progressive auth state
 */
export function useProgressiveAuth(): ProgressiveAuthState {
    const context = useContext(ProgressiveAuthContext);
    if (!context) {
        throw new Error('useProgressiveAuth must be used within ProgressiveAuthProvider');
    }
    return context;
}

/**
 * Hook for minimal auth state (Stage 1 - basic login status)
 */
export function useMinimalAuth() {
    const auth = useProgressiveAuth();
    return {
        isLoading: auth.isLoading,
        isLoggedIn: auth.isLoggedIn,
        isReady: auth.currentStage !== AuthLoadingStage.INITIAL,
    };
}
