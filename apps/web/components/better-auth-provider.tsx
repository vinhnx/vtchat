'use client';

import { ReactNode } from 'react';
import { AuthErrorBoundary } from './auth-error-boundary';

interface BetterAuthProviderProps {
    children: ReactNode;
    initialSession?: {
        user: any;
        session: any;
    } | null;
}

export function BetterAuthProvider({ children }: BetterAuthProviderProps) {
    // Simply wrap in error boundary for auth-related errors
    // No hydration-sensitive logic here
    return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
