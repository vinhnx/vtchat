"use client";

import { useChat } from "@ai-sdk/react";
import { models } from "@repo/ai/models";
// Import mobile enhancements
import {
    MobileChatHeader,
    MobileOptimizedInput,
    MobilePullToRefresh,
    SwipeableMessage,
} from "@repo/common/components";
import { useErrorHandler, useSubscriptionAccess } from "@repo/common/hooks";
import { useApiKeysStore, useAppStore } from "@repo/common/store";
import { EMBEDDING_MODEL_CONFIG } from "@repo/shared/config/embedding-models";
import { API_KEY_NAMES } from "@repo/shared/constants/api-keys";
import { useSession } from "@repo/shared/lib/auth-client";
import { log } from "@repo/shared/lib/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import { Avatar, Button, Input, ScrollArea, useToast } from "@repo/ui";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";

export function RAGChatbot() {
    const { data: session } = useSession();
    const getAllKeys = useApiKeysStore((state) => state.getAllKeys);
    const { hasAccess } = useSubscriptionAccess();
    const hasVTPlusAccess = hasAccess({ plan: PlanSlug.VT_PLUS });
    const embeddingModel = useAppStore((state) => state.embeddingModel);
    const ragChatModel = useAppStore((state) => state.ragChatModel);
    const profile = useAppStore((state) => state.profile);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const isMobile = useIsMobile();
    const { toast } = useToast();

    // Stable toast reference to prevent fetchKnowledgeBase from recreating
    const toastRef = useRef(toast);
    toastRef.current = toast;

    // Mobile specific states
    const [isMinimized, setIsMinimized] = useState(false);

    // Enhanced error handling using centralized error message service
    const { showError } = useErrorHandler();

    const showErrorToast = useCallback(
        async (error: any) => {
            // Check for specific quota_exceeded status from completion API
            if (error?.status === "quota_exceeded" || error?.data?.status === "quota_exceeded") {
                const quotaMessage = error?.error || error?.data?.error || "VT+ quota exceeded.";
                toast({
                    title: "Daily Limit Reached",
                    description: quotaMessage,
                    variant: "destructive",
                });
                return;
            }

            // Extract error message from various possible structures
            let errorMessage = "";
            if (typeof error === "string") {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error?.message) {
                errorMessage = error.error.message;
            } else if (error?.toString) {
                errorMessage = error.toString();
            } else {
                errorMessage = "Unknown error occurred";
            }

            // Only log the initial processing step without redundant details
            log.debug(
                {
                    processedMessage: errorMessage.toLowerCase(),
                    errorType: typeof error,
                },
                "Processing error for toast display",
            );

            try {
                // Use centralized error handling service
                await showError(errorMessage, {
                    // Try to extract context from the error or current state
                    userId: session?.user?.id,
                    // Add more context if available from the component state
                });

                log.debug({}, "Toast error shown successfully via centralized service");
            } catch (serviceError) {
                // Fallback to basic error handling if service fails
                log.warn(
                    {
                        serviceError:
                            serviceError instanceof Error
                                ? serviceError.message
                                : String(serviceError),
                        originalError: errorMessage,
                    },
                    "Failed to use centralized error service, falling back to basic toast",
                );

                toast({
                    title: "Chat Error",
                    description: errorMessage || "Something went wrong. Please try again.",
                    variant: "destructive",
                });
            }
        },
        [showError, toast, session?.user?.id],
    );

    const allApiKeys = getAllKeys();
    const hasGeminiKey = !!allApiKeys[API_KEY_NAMES.GOOGLE];

    // VT+ users can chat with or without BYOK (server API key used automatically)
    // Free users must have their own Gemini API key
    const canChat = hasVTPlusAccess || hasGeminiKey;

    // Ref for auto-scroll functionality
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
        api: "/api/agent/chat",
        maxSteps: 3,
        body: {
            apiKeys: allApiKeys,
            embeddingModel,
            ragChatModel,
            profile,
        },
        onError: (error) => {
            // Safely extract error information with fallbacks
            const errorInfo = {
                errorMessage: error?.message || "Unknown error",
                errorType: typeof error,
                errorName: error?.name || "UnknownError",
                errorStack: error?.stack || "No stack trace",
                errorString: error ? String(error) : "Empty error",
                hasError: !!error,
                errorKeys: error ? Object.keys(error) : [],
                errorProto: error ? Object.getPrototypeOf(error)?.constructor?.name : "undefined",
            };

            // Only log if we have meaningful error information
            if (error && (error.message || error.name || Object.keys(error || {}).length > 0)) {
                log.error(errorInfo, "RAG Chat Error in onError handler");
            } else {
                log.warn(errorInfo, "RAG Chat received empty or invalid error object");
            }

            // Show error toast with single call and simplified fallback
            showErrorToast(error);

            // Simplified fallback - only if the first call might have failed silently
            // (reduce logging noise from duplicate calls)
            setTimeout(() => {
                showErrorToast(error);
            }, 150);
        },
        onFinish: (message) => {
            // Check if the assistant message contains error indicators
            if (message.content) {
                const content = message.content.toLowerCase();
                if (
                    content.includes("error:") ||
                    content.includes("failed to") ||
                    content.includes("unable to")
                ) {
                    // Extract error from message content if it looks like an error
                    const errorMatch =
                        message.content.match(/error:\s*(.*)/i) ||
                        message.content.match(/failed to\s*(.*)/i) ||
                        message.content.match(/unable to\s*(.*)/i);

                    if (errorMatch) {
                        const errorMsg = errorMatch[1].trim();
                        log.info({ errorMsg }, "Extracted error from assistant message");
                        setTimeout(() => {
                            showErrorToast(new Error(errorMsg));
                        }, 100);
                    }
                }
            }
        },
    });

    // Track if we're currently processing to avoid duplicate indicators
    const isProcessing =
        isLoading || messages.some((msg) => msg.role === "assistant" && !msg.content.trim());

    const fetchKnowledgeBase = useCallback(async () => {
        try {
            const response = await fetch("/api/agent/knowledge");
            if (response.ok) {
                const data = await response.json();
                const resources = data.resources || data.knowledge || [];
                // Only log agent fetch details in development
                if (process.env.NODE_ENV === "development") {
                    log.info({ total: resources.length, data }, "📚 Agent fetched");
                }
                // Knowledge base fetched successfully - no need to store since sidebar was removed
            } else {
                const errorText = await response.text();
                const error = new Error(
                    errorText || `HTTP ${response.status}: ${response.statusText}`,
                );
                log.error(
                    { status: response.status, statusText: response.statusText, errorText },
                    "Failed to fetch knowledge base",
                );
                // Use stable toast ref to avoid dependency issues
                toastRef.current({
                    title: "Failed to fetch knowledge base",
                    description: error.message || "Please try again later.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            // Properly serialize error for logging
            const errorDetails = {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : "UnknownError",
            };
            log.error({ error: errorDetails }, "Error fetching knowledge base");

            // Use stable toast ref to avoid dependency issues
            const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
            toastRef.current({
                title: "Error fetching knowledge base",
                description: errorMsg,
                variant: "destructive",
            });
        }
    }, []); // No dependencies to prevent infinite loop

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        // Fetch knowledge base only once on mount
        fetchKnowledgeBase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Fetch knowledge base only once on mount
        fetchKnowledgeBase,
    ]); // Only run on mount, ignore fetchKnowledgeBase dependency to prevent infinite loop

    // Scroll to bottom when messages change or when processing state changes
    useEffect(() => {
        scrollToBottom();
    }, [scrollToBottom]);

    // Also scroll when messages are added
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length, scrollToBottom]);

    // Scroll when loading state changes (to show/hide loading indicator)
    useEffect(() => {
        if (isLoading) {
            // Small delay to ensure loading indicator is rendered
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [isLoading, scrollToBottom]);

    // Filter to only show Gemini models for RAG
    const geminiModels = models.filter((m) => m.id.startsWith("gemini-"));

    // Get model info for display
    const currentEmbeddingModel = EMBEDDING_MODEL_CONFIG[embeddingModel];
    const currentRagChatModel = geminiModels.find((m) => m.id === ragChatModel);

    // Mobile form submission handler
    const handleMobileSubmit = () => {
        if (input.trim() && canChat && !isLoading) {
            handleSubmit();
        }
    };

    // Pull to refresh handler
    const handleRefresh = async () => {
        await fetchKnowledgeBase();
        reload();
    };

    // Mobile optimized layout
    if (isMobile) {
        return (
            <div className="flex h-full w-full flex-col overflow-hidden">
                {/* Mobile Header */}
                <MobileChatHeader
                    title="AI Assistant"
                    subtitle="Personal Knowledge Chat"
                    isMinimized={isMinimized}
                    onMinimize={() => setIsMinimized(true)}
                    onMaximize={() => setIsMinimized(false)}
                />

                {/* Chat Container */}
                <div className="flex min-h-0 flex-1 flex-col">
                    {/* Chat Messages - Optimized for mobile */}
                    <MobilePullToRefresh onRefresh={handleRefresh}>
                        <div
                            className="flex-1 overflow-hidden"
                            style={{
                                height: "calc(100vh - 180px)", // Account for header + input + safe areas
                                minHeight: "300px",
                            }}
                        >
                            <ScrollArea className="h-full w-full">
                                <div className="space-y-3 p-3 pb-20">
                                    {messages.length === 0 && (
                                        <div className="text-muted-foreground py-12 text-center">
                                            <div className="bg-brand/10 text-brand border-brand/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold">
                                                VT
                                            </div>
                                            <h3 className="text-foreground mb-2 text-lg font-medium">
                                                VT Personal AI Assistant
                                            </h3>
                                            <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                                                Start chatting to build your personal knowledge base
                                            </p>
                                        </div>
                                    )}

                                    {messages
                                        .filter((message) => message.content?.trim())
                                        .map((message, index) => (
                                            <SwipeableMessage
                                                key={index}
                                                onSwipeLeft={() => {
                                                    // Could implement message actions like copy/share
                                                }}
                                                onSwipeRight={() => {
                                                    // Could implement message actions like save/bookmark
                                                }}
                                            >
                                                <div
                                                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                                                >
                                                    {message.role === "user" ? (
                                                        <Avatar
                                                            className="h-8 w-8 shrink-0"
                                                            name={session?.user?.name || "User"}
                                                            size="md"
                                                            src={session?.user?.image ?? undefined}
                                                        />
                                                    ) : (
                                                        <div className="bg-brand/10 text-brand border-brand/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-semibold">
                                                            VT
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`flex-1 space-y-2 ${message.role === "user" ? "flex flex-col items-end" : ""}`}
                                                    >
                                                        <div
                                                            className={`max-w-[85%] rounded-2xl p-3 ${
                                                                message.role === "user"
                                                                    ? "bg-primary text-primary-foreground ml-auto"
                                                                    : "bg-muted"
                                                            }`}
                                                        >
                                                            <div className="text-sm leading-relaxed">
                                                                {message.content}
                                                            </div>
                                                            {message.role === "assistant" && (
                                                                <div className="border-border text-muted-foreground mt-2 border-t pt-2 text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>
                                                                            {currentRagChatModel?.name ||
                                                                                "Unknown"}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>
                                                                            {currentEmbeddingModel?.name ||
                                                                                "Unknown"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwipeableMessage>
                                        ))}

                                    {/* Mobile loading indicator */}
                                    {isProcessing && (
                                        <div className="flex gap-3" key="loading-indicator">
                                            <div className="flex-1 space-y-2">
                                                <div className="bg-muted max-w-[85%] rounded-2xl p-3">
                                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                                                            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                                                            <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                                                        </div>
                                                        <span className="ml-2">
                                                            VT is thinking...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scroll target */}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                        </div>
                    </MobilePullToRefresh>

                    {/* Mobile Chat Input */}
                    <div className="bg-background border-t p-3">
                        {/* Show message when no API keys */}
                        {!canChat && (
                            <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm">
                                <div className="flex flex-col gap-2">
                                    <span className="text-amber-700">
                                        VT+ subscription or Gemini API key required
                                    </span>
                                    <Button
                                        className="w-full text-xs"
                                        onClick={() => setIsSettingsOpen(true)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        Upgrade or Add Key
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {/* Mobile Optimized Input */}
                            <div className="flex gap-2">
                                <MobileOptimizedInput
                                    value={input}
                                    onChange={(value: string) => {
                                        // Simulate the event object that handleInputChange expects
                                        const syntheticEvent = {
                                            target: { value },
                                        } as React.ChangeEvent<HTMLInputElement>;
                                        handleInputChange(syntheticEvent);
                                    }}
                                    onSubmit={handleMobileSubmit}
                                    placeholder={
                                        canChat
                                            ? "Message VT..."
                                            : "VT+ subscription or API key required..."
                                    }
                                    disabled={isLoading || !canChat}
                                    maxRows={4}
                                />
                                <Button
                                    disabled={isLoading || !input.trim() || !canChat}
                                    size="icon"
                                    onClick={handleMobileSubmit}
                                    className="shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar Sheet */}
            </div>
        );
    }

    // Desktop layout (unchanged)
    return (
        <div className="flex h-full flex-col gap-4 md:flex-row md:gap-6">
            <div className="flex min-h-0 flex-1 flex-col">
                {/* Chat Messages */}
                <ScrollArea className="w-full flex-1">
                    <div className="space-y-4 p-2 sm:p-4">
                        {messages.length === 0 && (
                            <div className="text-muted-foreground py-16 text-center">
                                <div className="bg-brand/10 text-brand border-brand/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold">
                                    VT
                                </div>
                                <h3 className="text-foreground mb-2 text-lg font-medium">
                                    VT Personal AI Assistant
                                </h3>
                                <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                                    Start chatting to build your personal knowledge base
                                </p>
                            </div>
                        )}

                        {messages
                            .filter((message) => message.content?.trim())
                            .map((message, index) => (
                                <div
                                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                                    key={index}
                                >
                                    {message.role === "user" ? (
                                        <Avatar
                                            className="h-8 w-8 shrink-0"
                                            name={session?.user?.name || "User"}
                                            size="md"
                                            src={session?.user?.image ?? undefined}
                                        />
                                    ) : (
                                        <div className="bg-brand/10 text-brand border-brand/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-semibold">
                                            VT
                                        </div>
                                    )}
                                    <div
                                        className={`flex-1 space-y-2 ${message.role === "user" ? "flex flex-col items-end" : ""}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${
                                                message.role === "user"
                                                    ? "bg-primary text-primary-foreground ml-auto"
                                                    : "bg-muted"
                                            }`}
                                        >
                                            <div className="text-sm">{message.content}</div>
                                            {message.role === "assistant" && (
                                                <div className="border-border text-muted-foreground mt-2 border-t pt-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {currentRagChatModel?.name || "Unknown"}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {currentEmbeddingModel?.name ||
                                                                "Unknown"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* Single consolidated loading indicator */}
                        {isProcessing && (
                            <div className="flex gap-3" key="loading-indicator">
                                <div className="flex-1 space-y-2">
                                    <div className="bg-muted max-w-[80%] rounded-lg p-3">
                                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                                            </div>
                                            <span className="ml-2">VT is thinking...</span>
                                        </div>
                                        <div className="text-muted-foreground/70 mt-1 text-xs">
                                            Searching knowledge base and generating response
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scroll target */}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="border-t p-4">
                    {/* Show message when no API keys */}
                    {!canChat && (
                        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-amber-700">
                                    VT+ subscription or Gemini API key required
                                </span>
                                <Button
                                    className="w-full text-xs sm:w-auto"
                                    onClick={() => setIsSettingsOpen(true)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Upgrade or Add Key
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <form className="flex gap-3" onSubmit={handleSubmit}>
                            <Input
                                className="flex-1"
                                disabled={isLoading || !canChat}
                                onChange={handleInputChange}
                                placeholder={
                                    canChat
                                        ? "Message VT..."
                                        : "VT+ subscription or API key required..."
                                }
                                value={input}
                            />
                            <Button
                                disabled={isLoading || !input.trim() || !canChat}
                                size="icon"
                                type="submit"
                                className="shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
