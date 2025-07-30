"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnhancedAuth } from "../hooks/use-enhanced-auth";
import { log } from "@repo/shared/logger";
import { Button } from "@repo/ui";

interface AuthRecoveryHandlerProps {
    children: React.ReactNode;
    preserveRoute?: boolean; // Whether to preserve current route during auth recovery
}

/**
 * Component that handles authentication recovery and prevents unexpected redirects
 * during active chat sessions. It provides graceful error handling and session recovery.
 */
export function AuthRecoveryHandler({ children, preserveRoute = true }: AuthRecoveryHandlerProps) {
    const router = useRouter();
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
    const [recoveryAttempts, setRecoveryAttempts] = useState(0);
    const [currentPath, setCurrentPath] = useState<string>("");
    
    const maxRecoveryAttempts = 3;

    const {
        isAuthenticated,
        isLoading,
        error,
        refreshSession,
        isSessionExpiringSoon,
        timeUntilExpiry,
    } = useEnhancedAuth({
        autoRefresh: true,
        refreshInterval: 5 * 60 * 1000, // 5 minutes
        onSessionExpired: () => {
            log.warn("[AuthRecovery] Session expired, attempting recovery");
            handleSessionExpired();
        },
        onAuthError: (error) => {
            log.error({ error }, "[AuthRecovery] Authentication error occurred");
            handleAuthError(error);
        },
    });

    // Track current path for recovery
    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    const handleSessionExpired = () => {
        if (recoveryAttempts < maxRecoveryAttempts) {
            log.info(
                { attempt: recoveryAttempts + 1, maxAttempts: maxRecoveryAttempts },
                "[AuthRecovery] Attempting session recovery"
            );
            
            setRecoveryAttempts(prev => prev + 1);
            
            // Try to refresh session
            refreshSession().catch(() => {
                // If refresh fails, show recovery dialog
                setShowRecoveryDialog(true);
            });
        } else {
            log.warn("[AuthRecovery] Max recovery attempts reached, showing dialog");
            setShowRecoveryDialog(true);
        }
    };

    const handleAuthError = (errorMessage: string) => {
        // Only show recovery dialog for certain types of errors
        const recoverableErrors = [
            "session expired",
            "authentication required",
            "unauthorized",
            "auth timeout",
        ];

        const isRecoverable = recoverableErrors.some(err => 
            errorMessage.toLowerCase().includes(err)
        );

        if (isRecoverable && recoveryAttempts < maxRecoveryAttempts) {
            handleSessionExpired();
        } else if (isRecoverable) {
            setShowRecoveryDialog(true);
        }
    };

    const handleManualRecovery = async () => {
        try {
            log.info("[AuthRecovery] Manual recovery initiated");
            setRecoveryAttempts(0);
            await refreshSession();
            setShowRecoveryDialog(false);
        } catch (error) {
            log.error({ error }, "[AuthRecovery] Manual recovery failed");
            // If manual recovery fails, redirect to login with current path
            redirectToLogin();
        }
    };

    const redirectToLogin = () => {
        const loginUrl = preserveRoute && currentPath 
            ? `/login?redirect_url=${encodeURIComponent(currentPath)}`
            : "/login";
        
        log.info({ redirectUrl: loginUrl }, "[AuthRecovery] Redirecting to login");
        router.push(loginUrl);
    };

    const handleDismissRecovery = () => {
        setShowRecoveryDialog(false);
        redirectToLogin();
    };

    // Show session expiry warning
    const showExpiryWarning = isSessionExpiringSoon && timeUntilExpiry && timeUntilExpiry > 0;

    if (showRecoveryDialog) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-lg font-semibold mb-4">Session Recovery</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Your session has expired or encountered an error. Would you like to try recovering 
                        your session or sign in again?
                    </p>
                    
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Error: {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            onClick={handleManualRecovery}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? "Recovering..." : "Try Recovery"}
                        </Button>
                        <Button
                            onClick={handleDismissRecovery}
                            variant="outline"
                            className="flex-1"
                        >
                            Sign In Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Show expiry warning banner
    if (showExpiryWarning) {
        const minutesUntilExpiry = Math.floor(timeUntilExpiry! / (60 * 1000));
        
        return (
            <div className="relative">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Your session will expire in {minutesUntilExpiry} minutes.
                        </p>
                        <Button
                            onClick={refreshSession}
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                        >
                            {isLoading ? "Refreshing..." : "Extend Session"}
                        </Button>
                    </div>
                </div>
                {children}
            </div>
        );
    }

    return <>{children}</>;
}

// Hook for components that need to check auth recovery status
export function useAuthRecovery() {
    const {
        isAuthenticated,
        isLoading,
        error,
        refreshSession,
        isSessionExpiringSoon,
        timeUntilExpiry,
    } = useEnhancedAuth();

    return {
        isAuthenticated,
        isLoading,
        hasAuthError: !!error,
        error,
        refreshSession,
        isSessionExpiringSoon,
        timeUntilExpiry,
    };
}
