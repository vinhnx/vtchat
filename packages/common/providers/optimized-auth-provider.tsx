'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { sessionCache } from '@repo/shared/utils/session-cache';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface OptimizedAuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    user: any;
    isLoading: boolean;
    error: string | null;
    refreshSession: () => Promise<void>;
}

const OptimizedAuthContext = createContext<OptimizedAuthContextType | undefined>(undefined);

interface OptimizedAuthProviderProps {
    children: ReactNode;
    initialSession?: {
        user: any;
        session: any;
    } | null;
}

export function OptimizedAuthProvider({ children, initialSession }: OptimizedAuthProviderProps) {
    const { data: session, isLoading: sessionLoading, error: sessionError, refetch } = useSession();
    const [isHydrated, setIsHydrated] = useState(false);
    const [cachedAuth, setCachedAuth] = useState<OptimizedAuthContextType | null>(null);

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const refreshSessionStable = useCallback(async () => {
        try {
            await refetch();
        } catch (error) {
            log.warn({ data: error }, '[OptimizedAuth] Failed to refresh session');
        }
    }, [refetch]);

    useEffect(() => {
        if (!isHydrated) return;

        // If we have initial session data from SSR, use it immediately
        if (initialSession && !session && !sessionLoading) {
            const authState: OptimizedAuthContextType = {
                isAuthenticated: !!initialSession.user,
                userId: initialSession.user?.id || null,
                user: initialSession.user,
                isLoading: false,
                error: null,
                refreshSession: refreshSessionStable,
            };

            sessionCache.set('auth-state', authState, 30_000); // Cache for 30 seconds
            setCachedAuth(authState);
            return;
        }

        // Check cache first for subsequent renders
        const cacheKey = 'auth-state';
        const cached = sessionCache.get<OptimizedAuthContextType>(cacheKey);

        if (cached && !sessionLoading && !session) {
            setCachedAuth({ ...cached, refreshSession: refreshSessionStable });
            return;
        }

        // Update cache with new session data
        if (!sessionLoading && session) {
            const authState: OptimizedAuthContextType = {
                isAuthenticated: !!session.user,
                userId: session.user?.id || null,
                user: session.user,
                isLoading: false,
                error: sessionError?.message || null,
                refreshSession: refreshSessionStable,
            };

            sessionCache.set(cacheKey, authState, 60_000); // Cache for 1 minute
            setCachedAuth(authState);
        }
    }, [session, sessionLoading, sessionError, initialSession, isHydrated, refreshSessionStable]);

    // During hydration or when loading, show consistent loading state
    if (!isHydrated || sessionLoading) {
        const contextValue: OptimizedAuthContextType = {
            isAuthenticated: false,
            userId: null,
            user: null,
            isLoading: true,
            error: null,
            refreshSession: refreshSessionStable,
        };

        return (
            <OptimizedAuthContext.Provider value={contextValue}>
                {children}
            </OptimizedAuthContext.Provider>
        );
    }

    const contextValue: OptimizedAuthContextType = cachedAuth || {
        isAuthenticated: false,
        userId: null,
        user: null,
        isLoading: false,
        error: sessionError?.message || null,
        refreshSession: refreshSessionStable,
    };

    return (
        <OptimizedAuthContext.Provider value={contextValue}>
            {children}
        </OptimizedAuthContext.Provider>
    );
}

export function useOptimizedAuth() {
    const context = useContext(OptimizedAuthContext);
    if (context === undefined) {
        throw new Error('useOptimizedAuth must be used within an OptimizedAuthProvider');
    }
    return context;
}
