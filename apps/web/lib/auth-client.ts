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

    // In development, use localhost
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Server-side fallback
    return 'http://localhost:3000';
};

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
