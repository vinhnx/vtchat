import { createAuthClient } from 'better-auth/react';

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
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Server-side fallback
    return 'http://localhost:3000';
};

// Create the auth client that will be used across all packages
export const authClient = createAuthClient({
    baseURL: getBaseURL(),
});

// Export the auth client methods directly
export const { useSession, signIn, signOut, signUp } = authClient;

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
