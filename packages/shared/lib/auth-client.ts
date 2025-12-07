import { adminClient, multiSessionClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { useEffect, useMemo, useState } from 'react';

// Import performance utilities
const requestDeduplicator = typeof window !== 'undefined'
    ? import('@repo/shared/utils/request-deduplication').then((m) => m.requestDeduplicator)
    : null;

// Ensure proper URL formatting for Better Auth
const getBaseURL = () => {
    const envBaseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
        || process.env.NEXT_PUBLIC_BASE_URL
        || process.env.NEXT_PUBLIC_APP_URL;

    if (envBaseUrl) {
        return envBaseUrl;
    }

    // Use current origin when available to avoid CORS issues on previews
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    const defaultBaseUrl = process.env.NODE_ENV === 'production'
        ? 'https://vtchat.io.vn'
        : 'http://localhost:3000';

    return defaultBaseUrl;
};

// Create the auth client that will be used across all packages
export const authClient = createAuthClient({
    baseURL: getBaseURL(),
    plugins: [multiSessionClient(), adminClient()],
});

// Export optimized methods
export const {
    signIn,
    signOut,
    signUp,
    linkSocial,
    unlinkAccount,
    listAccounts,
    multiSession,
    admin,
} = authClient;

type SessionType = typeof authClient.$Infer.Session | null;

const SESSION_PROXY_URL = '/api/auth/session-proxy';

async function fetchSessionViaProxy(): Promise<SessionType> {
    try {
        const response = await fetch(SESSION_PROXY_URL, {
            credentials: 'include',
            method: 'GET',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data?.session ?? null;
    } catch {
        return null;
    }
}

// Unified getSession: server uses Better-Auth directly; client uses proxy to avoid ky bug
export const getSession = async (
    options?: { query?: { disableCookieCache?: boolean; }; },
): Promise<SessionType> => {
    if (typeof window === 'undefined') {
        return authClient.getSession(options);
    }

    // Optionally deduplicate client calls
    if (requestDeduplicator) {
        const deduplicator = await requestDeduplicator;
        const cacheKey = `session:proxy:${JSON.stringify(options || {})}`;
        return deduplicator.deduplicate(cacheKey, fetchSessionViaProxy);
    }

    return fetchSessionViaProxy();
};

// Client-safe session hook that bypasses Better-Auth ky usage
export const useSession = () => {
    const [session, setSession] = useState<SessionType>(null);
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
        'loading',
    );

    useEffect(() => {
        let cancelled = false;

        const loadSession = async () => {
            setStatus('loading');

            const proxySession = await getSession();
            if (cancelled) return;
            setSession(proxySession);
            setStatus(proxySession ? 'authenticated' : 'unauthenticated');
        };

        void loadSession();

        return () => {
            cancelled = true;
        };
    }, []);

    return useMemo(
        () => ({
            data: session,
            status,
        }),
        [session, status],
    );
};

// Create compatibility aliases for Better Auth
export const useSignOut = () => {
    return {
        signOut: () => signOut(),
    };
};

// Export useUser for compatibility with old Stack Auth usage
export const useUser = () => {
    const session = useSession();
    return session.data?.user || null;
};

// Helper to disable cookie cache for fresh data
export const getSessionFresh = async () => {
    return getSession({ query: { disableCookieCache: true } });
};
