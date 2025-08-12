'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { useCallback, useEffect, useRef, useState } from 'react';

interface EnhancedAuthState {
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    sessionExpiry: Date | null;
}

interface UseEnhancedAuthOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
    onSessionExpired?: () => void;
    onAuthError?: (error: string) => void;
}

/**
 * Enhanced authentication hook that provides:
 * - Automatic session refresh
 * - Better error handling
 * - Session expiry tracking
 * - Network error recovery
 */
export function useEnhancedAuth(options: UseEnhancedAuthOptions = {}) {
    const {
        autoRefresh = true,
        refreshInterval = 5 * 60 * 1000, // 5 minutes
        onSessionExpired,
        onAuthError,
    } = options;

    const { data: session, isLoading, error, refetch } = useSession();
    const [authState, setAuthState] = useState<EnhancedAuthState>({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        error: null,
        lastRefresh: null,
        sessionExpiry: null,
    });

    const refreshTimeoutRef = useRef<NodeJS.Timeout>();
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    // Calculate session expiry (7 days from last refresh)
    const calculateSessionExpiry = useCallback((lastRefresh: Date) => {
        return new Date(lastRefresh.getTime() + 7 * 24 * 60 * 60 * 1000);
    }, []);

    // Refresh session with retry logic
    const refreshSession = useCallback(async () => {
        const userId = session?.user?.id;

        try {
            log.debug('[EnhancedAuth] Refreshing session');
            await refetch();
            retryCountRef.current = 0;

            const now = new Date();
            setAuthState((prev) => ({
                ...prev,
                lastRefresh: now,
                sessionExpiry: calculateSessionExpiry(now),
                error: null,
            }));

            logSessionRefresh(true, undefined, userId);
            log.debug('[EnhancedAuth] Session refreshed successfully');
        } catch (error) {
            retryCountRef.current++;
            const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';

            logSessionRefresh(false, errorMessage, userId);

            log.warn(
                {
                    error: errorMessage,
                    retryCount: retryCountRef.current,
                    maxRetries,
                },
                '[EnhancedAuth] Session refresh failed',
            );

            if (retryCountRef.current >= maxRetries) {
                setAuthState((prev) => ({
                    ...prev,
                    error: 'Authentication session expired. Please sign in again.',
                }));

                logAuthError(errorMessage, undefined, userId);
                onAuthError?.(errorMessage);
                onSessionExpired?.();
            } else {
                // Retry with exponential backoff
                const retryDelay = 2 ** retryCountRef.current * 1000;
                setTimeout(refreshSession, retryDelay);
            }
        }
    }, [refetch, calculateSessionExpiry, onAuthError, onSessionExpired, session?.user?.id]);

    // Setup automatic refresh
    useEffect(() => {
        if (!autoRefresh || !session?.user) {
            return;
        }

        const setupRefreshTimer = () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = setTimeout(() => {
                refreshSession();
                setupRefreshTimer(); // Setup next refresh
            }, refreshInterval);
        };

        setupRefreshTimer();

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [autoRefresh, session?.user, refreshInterval, refreshSession]);

    // Update auth state when session changes
    useEffect(() => {
        const now = new Date();

        setAuthState((prev) => ({
            isAuthenticated: !!session?.user,
            user: session?.user || null,
            isLoading,
            error: error?.message || prev.error,
            lastRefresh: session?.user ? prev.lastRefresh || now : null,
            sessionExpiry: session?.user ? prev.sessionExpiry || calculateSessionExpiry(now) : null,
        }));
    }, [session, isLoading, error, calculateSessionExpiry]);

    // Check for session expiry
    useEffect(() => {
        if (!authState.sessionExpiry || !authState.isAuthenticated) {
            return;
        }

        const checkExpiry = () => {
            const now = new Date();
            const timeUntilExpiry = authState.sessionExpiry!.getTime() - now.getTime();

            // If session expires in less than 1 hour, refresh it
            if (timeUntilExpiry < 60 * 60 * 1000 && timeUntilExpiry > 0) {
                log.info('[EnhancedAuth] Session expiring soon, refreshing');
                refreshSession();
            } else if (timeUntilExpiry <= 0) {
                log.warn('[EnhancedAuth] Session expired');
                setAuthState((prev) => ({
                    ...prev,
                    isAuthenticated: false,
                    user: null,
                    error: 'Session expired',
                }));
                onSessionExpired?.();
            }
        };

        const expiryCheckInterval = setInterval(checkExpiry, 60 * 1000); // Check every minute

        return () => clearInterval(expiryCheckInterval);
    }, [authState.sessionExpiry, authState.isAuthenticated, refreshSession, onSessionExpired]);

    // Manual refresh function
    const manualRefresh = useCallback(async () => {
        retryCountRef.current = 0; // Reset retry count for manual refresh
        await refreshSession();
    }, [refreshSession]);

    // Check if session is about to expire
    const isSessionExpiringSoon = useCallback(() => {
        if (!authState.sessionExpiry) return false;

        const now = new Date();
        const timeUntilExpiry = authState.sessionExpiry.getTime() - now.getTime();
        return timeUntilExpiry < 60 * 60 * 1000; // Less than 1 hour
    }, [authState.sessionExpiry]);

    return {
        ...authState,
        refreshSession: manualRefresh,
        isSessionExpiringSoon: isSessionExpiringSoon(),
        timeUntilExpiry: authState.sessionExpiry
            ? Math.max(0, authState.sessionExpiry.getTime() - Date.now())
            : null,
    };
}
