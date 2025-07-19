import { useSession } from '@repo/shared/lib/auth-client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Simple in-memory cache for admin status to avoid duplicate requests
const adminStatusCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
// Per-user request deduplication
const pendingRequests = new Map<string, Promise<boolean>>();
const CACHE_DURATION = 60 * 1000; // 60 seconds - reduce API calls

interface UseAdminResult {
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
    invalidateAdminCache: () => void;
}

export function useAdmin(): UseAdminResult {
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    const checkAdminStatus = useCallback(
        async (userId: string, signal: AbortSignal): Promise<boolean> => {
            // Check cache first
            const cached = adminStatusCache.get(userId);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.isAdmin;
            }

            // Per-user request deduplication
            const existingRequest = pendingRequests.get(userId);
            if (existingRequest) {
                return existingRequest;
            }

            const requestPromise = (async () => {
                try {
                    const response = await fetch('/api/admin/check-status', { signal });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const data = await response.json();
                    const adminStatus = Boolean(data.isAdmin);

                    // Cache the result
                    adminStatusCache.set(userId, {
                        isAdmin: adminStatus,
                        timestamp: Date.now(),
                    });

                    return adminStatus;
                } catch (err) {
                    if (err instanceof Error && err.name === 'AbortError') {
                        throw err; // Re-throw abort errors
                    }
                    throw new Error('Failed to check admin status');
                } finally {
                    pendingRequests.delete(userId);
                }
            })();

            pendingRequests.set(userId, requestPromise);
            return requestPromise;
        },
        []
    );

    useEffect(() => {
        isMountedRef.current = true;

        async function updateAdminStatus() {
            if (!session?.user?.id) {
                if (isMountedRef.current) {
                    setIsAdmin(false);
                    setLoading(false);
                    setError(null);
                }
                return;
            }

            // Create new AbortController for this request
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            setLoading(true);
            setError(null);

            try {
                const adminStatus = await checkAdminStatus(session.user.id, signal);
                if (isMountedRef.current && !signal.aborted) {
                    setIsAdmin(adminStatus);
                    setError(null);
                }
            } catch (err) {
                if (isMountedRef.current && !signal.aborted) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    setError(errorMessage);
                    setIsAdmin(false);
                }
            } finally {
                if (isMountedRef.current && !signal.aborted) {
                    setLoading(false);
                }
            }
        }

        updateAdminStatus();

        // Cleanup function
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [session?.user?.id, checkAdminStatus]);

    // Function to manually invalidate cache (useful after role changes)
    const invalidateAdminCache = useCallback(() => {
        if (session?.user?.id) {
            adminStatusCache.delete(session.user.id);
        }
    }, [session?.user?.id]);

    return { isAdmin, loading, error, invalidateAdminCache };
}
