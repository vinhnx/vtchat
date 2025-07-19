"use client";

import type { ReactNode } from "react";
import { AuthErrorBoundary } from "./auth-error-boundary";

interface BetterAuthProviderProps {
    children: ReactNode;
    initialSession?: {
        user: any;
        session: any;
    } | null;
}

export function BetterAuthProvider({ children }: BetterAuthProviderProps) {
    // Better-Auth doesn't require a provider component - the auth client handles context automatically
    // Just wrap in error boundary for auth-related errors
    return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
