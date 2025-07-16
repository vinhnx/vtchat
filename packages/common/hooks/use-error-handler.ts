import { useToast } from "@repo/ui";
import { useCallback } from "react";
import type { ErrorContext, ErrorMessage } from "@repo/ai/services/error-messages";

/**
 * Custom hook for consistent error handling across React components
 * Integrates with the centralized error message service
 */
export function useErrorHandler() {
    const { toast } = useToast();

    const showError = useCallback(
        async (
            error: Error | string,
            context: ErrorContext = {},
            options: {
                duration?: number;
                showToast?: boolean;
                onError?: (structuredError: ErrorMessage) => void;
            } = {},
        ) => {
            const { duration = 6000, showToast = true, onError } = options;

            try {
                // Dynamically import the error message service to avoid bundling issues
                const { generateErrorMessage } = await import("@repo/ai/services/error-messages");

                const structuredError = generateErrorMessage(error, context);

                // Call custom error handler if provided
                if (onError) {
                    onError(structuredError);
                }

                // Show toast notification if enabled
                if (showToast) {
                    toast({
                        title: structuredError.title,
                        description: structuredError.message,
                        variant: "destructive",
                        duration,
                    });
                }

                return structuredError;
            } catch (serviceError) {
                // Fallback error handling if the service fails
                const fallbackMessage = typeof error === "string" ? error : error.message;

                if (showToast) {
                    toast({
                        title: "Error",
                        description: fallbackMessage || "An unexpected error occurred",
                        variant: "destructive",
                        duration,
                    });
                }

                return {
                    title: "Error",
                    message: fallbackMessage || "An unexpected error occurred",
                };
            }
        },
        [toast],
    );

    const showApiError = useCallback(
        async (
            error: Error | string,
            provider?: string,
            model?: string,
            hasApiKey?: boolean,
            isVtPlus?: boolean,
            options?: {
                duration?: number;
                showToast?: boolean;
                onError?: (structuredError: ErrorMessage) => void;
            },
        ) => {
            const context: ErrorContext = {
                provider: provider as any,
                model,
                hasApiKey,
                isVtPlus,
                originalError: typeof error === "string" ? error : error.message,
            };

            return showError(error, context, options);
        },
        [showError],
    );

    const showNetworkError = useCallback(
        async (
            error: Error | string,
            provider?: string,
            options?: {
                duration?: number;
                showToast?: boolean;
                onError?: (structuredError: ErrorMessage) => void;
            },
        ) => {
            const context: ErrorContext = {
                provider: provider as any,
                originalError: typeof error === "string" ? error : error.message,
            };

            return showError(error, context, options);
        },
        [showError],
    );

    return {
        showError,
        showApiError,
        showNetworkError,
    };
}

/**
 * Utility function to extract provider context from common error scenarios
 */
export function extractErrorContext(
    error: Error | string,
    additionalContext: Partial<ErrorContext> = {},
): ErrorContext {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorLower = errorMessage.toLowerCase();

    // Try to extract provider from error message
    let provider: string | undefined;
    if (errorLower.includes("openai")) provider = "openai";
    else if (errorLower.includes("anthropic") || errorLower.includes("claude"))
        provider = "anthropic";
    else if (errorLower.includes("google") || errorLower.includes("gemini")) provider = "google";
    else if (errorLower.includes("together")) provider = "together";
    else if (errorLower.includes("fireworks")) provider = "fireworks";
    else if (errorLower.includes("xai") || errorLower.includes("grok")) provider = "xai";
    else if (errorLower.includes("openrouter")) provider = "openrouter";
    else if (errorLower.includes("lmstudio") || errorLower.includes("lm studio"))
        provider = "lmstudio";
    else if (errorLower.includes("ollama")) provider = "ollama";

    return {
        provider: provider as any,
        originalError: errorMessage,
        ...additionalContext,
    };
}
