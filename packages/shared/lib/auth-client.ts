import { adminClient, multiSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Import performance utilities
const requestDeduplicator =
    typeof window !== "undefined"
        ? import("@repo/shared/utils/request-deduplication").then((m) => m.requestDeduplicator)
        : null;

// Ensure proper URL formatting for Better Auth
const getBaseURL = () => {
    // Use environment variables in order of preference
    if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
        return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // In development, use localhost
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    // Server-side fallback
    return process.env.NEXT_PUBLIC_BASE_URL;
};

// Create the auth client that will be used across all packages
export const authClient = createAuthClient({
    baseURL: getBaseURL(),
    plugins: [multiSessionClient(), adminClient()],
    // Remove fetchOptions from client config - this is server-side only
});

// Create optimized session getter with deduplication
const createOptimizedSessionGetter = () => {
    if (typeof window === "undefined") {
        return authClient.getSession.bind(authClient);
    }

    return async (options?: { query?: { disableCookieCache?: boolean } }) => {
        if (!requestDeduplicator) {
            return authClient.getSession(options);
        }

        const deduplicator = await requestDeduplicator;
        const cacheKey = `session:${JSON.stringify(options || {})}`;

        return deduplicator.deduplicate(cacheKey, () => authClient.getSession(options));
    };
};

// Export optimized methods
export const getSession = createOptimizedSessionGetter();
export const {
    useSession,
    signIn,
    signOut,
    signUp,
    linkSocial,
    unlinkAccount,
    listAccounts,
    multiSession,
    admin,
} = authClient;

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
