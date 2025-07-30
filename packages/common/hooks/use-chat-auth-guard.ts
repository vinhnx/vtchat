"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chat.store";
import { useEnhancedAuth } from "./use-enhanced-auth";
import { logAuthError, logAuthRecovery } from "../utils/auth-monitoring";
import { log } from "@repo/shared/logger";

interface ChatAuthGuardOptions {
    preserveChatState?: boolean;
    autoRecovery?: boolean;
    maxRecoveryAttempts?: number;
}

interface ChatAuthState {
    isProtected: boolean;
    isRecovering: boolean;
    recoveryAttempts: number;
    lastError: string | null;
    preservedThreadId: string | null;
    preservedMessages: any[];
}

/**
 * Hook that provides authentication protection specifically for chat sessions.
 * Preserves chat state during authentication issues and provides recovery mechanisms.
 */
export function useChatAuthGuard(options: ChatAuthGuardOptions = {}) {
    const {
        preserveChatState = true,
        autoRecovery = true,
        maxRecoveryAttempts = 3,
    } = options;

    const router = useRouter();
    const [authState, setAuthState] = useState<ChatAuthState>({
        isProtected: false,
        isRecovering: false,
        recoveryAttempts: 0,
        lastError: null,
        preservedThreadId: null,
        preservedMessages: [],
    });

    const recoveryTimeoutRef = useRef<NodeJS.Timeout>();
    const preservedStateRef = useRef<any>(null);

    // Chat store selectors
    const currentThreadId = useChatStore(state => state.currentThreadId);
    const threadItems = useChatStore(state => state.threadItems);
    const isGenerating = useChatStore(state => state.isGenerating);
    const switchThread = useChatStore(state => state.switchThread);

    const {
        isAuthenticated,
        isLoading,
        error,
        refreshSession,
        isSessionExpiringSoon,
    } = useEnhancedAuth({
        autoRefresh: true,
        onSessionExpired: () => handleSessionExpired(),
        onAuthError: (error) => handleAuthError(error),
    });

    // Preserve chat state when authentication issues occur
    const preserveChatStateData = useCallback(() => {
        if (!preserveChatState) return;

        const stateToPreserve = {
            threadId: currentThreadId,
            messages: threadItems,
            isGenerating,
            timestamp: new Date(),
        };

        preservedStateRef.current = stateToPreserve;
        
        setAuthState(prev => ({
            ...prev,
            preservedThreadId: currentThreadId,
            preservedMessages: [...threadItems],
        }));

        // Store in sessionStorage as backup
        try {
            sessionStorage.setItem('vtchat_preserved_state', JSON.stringify(stateToPreserve));
        } catch (error) {
            log.warn({ error }, "[ChatAuthGuard] Failed to preserve state in sessionStorage");
        }

        log.info(
            { 
                threadId: currentThreadId, 
                messageCount: threadItems.length,
                isGenerating 
            },
            "[ChatAuthGuard] Chat state preserved"
        );
    }, [preserveChatState, currentThreadId, threadItems, isGenerating]);

    // Restore preserved chat state
    const restoreChatState = useCallback(async () => {
        if (!preserveChatState) return;

        let stateToRestore = preservedStateRef.current;

        // Try to get from sessionStorage if no in-memory state
        if (!stateToRestore) {
            try {
                const stored = sessionStorage.getItem('vtchat_preserved_state');
                if (stored) {
                    stateToRestore = JSON.parse(stored);
                }
            } catch (error) {
                log.warn({ error }, "[ChatAuthGuard] Failed to restore state from sessionStorage");
            }
        }

        if (stateToRestore?.threadId) {
            log.info(
                { 
                    threadId: stateToRestore.threadId,
                    messageCount: stateToRestore.messages?.length || 0
                },
                "[ChatAuthGuard] Restoring chat state"
            );

            try {
                // Switch back to the preserved thread
                await switchThread(stateToRestore.threadId);
                
                // Clear preserved state
                preservedStateRef.current = null;
                sessionStorage.removeItem('vtchat_preserved_state');
                
                setAuthState(prev => ({
                    ...prev,
                    preservedThreadId: null,
                    preservedMessages: [],
                }));

                log.info("[ChatAuthGuard] Chat state restored successfully");
            } catch (error) {
                log.error({ error }, "[ChatAuthGuard] Failed to restore chat state");
            }
        }
    }, [preserveChatState, switchThread]);

    // Handle session expiration
    const handleSessionExpired = useCallback(() => {
        log.warn("[ChatAuthGuard] Session expired during chat");
        
        preserveChatStateData();
        
        setAuthState(prev => ({
            ...prev,
            isProtected: true,
            lastError: "Session expired",
        }));

        if (autoRecovery && authState.recoveryAttempts < maxRecoveryAttempts) {
            startRecovery();
        }
    }, [preserveChatStateData, autoRecovery, authState.recoveryAttempts, maxRecoveryAttempts]);

    // Handle authentication errors
    const handleAuthError = useCallback((errorMessage: string) => {
        log.error({ error: errorMessage }, "[ChatAuthGuard] Authentication error during chat");
        
        logAuthError(errorMessage, window.location.pathname, undefined);
        
        preserveChatStateData();
        
        setAuthState(prev => ({
            ...prev,
            isProtected: true,
            lastError: errorMessage,
        }));

        if (autoRecovery && authState.recoveryAttempts < maxRecoveryAttempts) {
            startRecovery();
        }
    }, [preserveChatStateData, autoRecovery, authState.recoveryAttempts, maxRecoveryAttempts]);

    // Start recovery process
    const startRecovery = useCallback(() => {
        if (authState.isRecovering) return;

        setAuthState(prev => ({
            ...prev,
            isRecovering: true,
            recoveryAttempts: prev.recoveryAttempts + 1,
        }));

        log.info(
            { attempt: authState.recoveryAttempts + 1, maxAttempts: maxRecoveryAttempts },
            "[ChatAuthGuard] Starting authentication recovery"
        );

        // Clear any existing timeout
        if (recoveryTimeoutRef.current) {
            clearTimeout(recoveryTimeoutRef.current);
        }

        // Attempt recovery with exponential backoff
        const delay = Math.pow(2, authState.recoveryAttempts) * 1000;
        recoveryTimeoutRef.current = setTimeout(async () => {
            try {
                await refreshSession();
                
                // If successful, restore chat state
                await restoreChatState();
                
                setAuthState(prev => ({
                    ...prev,
                    isProtected: false,
                    isRecovering: false,
                    lastError: null,
                }));

                logAuthRecovery(true, "automatic", undefined);
                log.info("[ChatAuthGuard] Authentication recovery successful");
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Recovery failed";
                
                logAuthRecovery(false, "automatic", undefined);
                log.error({ error: errorMessage }, "[ChatAuthGuard] Authentication recovery failed");
                
                setAuthState(prev => ({
                    ...prev,
                    isRecovering: false,
                    lastError: errorMessage,
                }));

                // If max attempts reached, redirect to login with preserved state
                if (authState.recoveryAttempts >= maxRecoveryAttempts) {
                    redirectToLoginWithState();
                }
            }
        }, delay);
    }, [
        authState.isRecovering,
        authState.recoveryAttempts,
        maxRecoveryAttempts,
        refreshSession,
        restoreChatState,
    ]);

    // Manual recovery function
    const manualRecovery = useCallback(async () => {
        setAuthState(prev => ({
            ...prev,
            isRecovering: true,
            recoveryAttempts: 0, // Reset for manual recovery
        }));

        try {
            await refreshSession();
            await restoreChatState();
            
            setAuthState(prev => ({
                ...prev,
                isProtected: false,
                isRecovering: false,
                lastError: null,
            }));

            logAuthRecovery(true, "manual", undefined);
            log.info("[ChatAuthGuard] Manual recovery successful");
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Manual recovery failed";
            
            logAuthRecovery(false, "manual", undefined);
            
            setAuthState(prev => ({
                ...prev,
                isRecovering: false,
                lastError: errorMessage,
            }));

            // If manual recovery fails, redirect to login
            redirectToLoginWithState();
        }
    }, [refreshSession, restoreChatState]);

    // Redirect to login while preserving state
    const redirectToLoginWithState = useCallback(() => {
        const currentPath = window.location.pathname;
        const loginUrl = `/login?redirect_url=${encodeURIComponent(currentPath)}`;
        
        log.info(
            { 
                redirectUrl: loginUrl,
                preservedThread: authState.preservedThreadId 
            },
            "[ChatAuthGuard] Redirecting to login with preserved state"
        );
        
        router.push(loginUrl);
    }, [router, authState.preservedThreadId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recoveryTimeoutRef.current) {
                clearTimeout(recoveryTimeoutRef.current);
            }
        };
    }, []);

    return {
        // Authentication state
        isAuthenticated,
        isLoading,
        error: error || authState.lastError,
        isSessionExpiringSoon,
        
        // Protection state
        isProtected: authState.isProtected,
        isRecovering: authState.isRecovering,
        recoveryAttempts: authState.recoveryAttempts,
        
        // Preserved state
        hasPreservedState: !!authState.preservedThreadId,
        preservedThreadId: authState.preservedThreadId,
        preservedMessageCount: authState.preservedMessages.length,
        
        // Actions
        manualRecovery,
        restoreChatState,
        redirectToLogin: redirectToLoginWithState,
    };
}
