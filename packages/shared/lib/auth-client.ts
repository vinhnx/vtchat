import { createAuthClient } from 'better-auth/react';

// Create the auth client that will be used across all packages
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
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
