import { useToast } from "@repo/ui";
import { useEffect } from "react";

interface ErrorToastOptions {
    error: string | object | null;
    status: string | null;
    onError?: (error: string) => void;
}

/**
 * Custom hook to show error toasts for API call failures
 * This extracts the error handling logic from components into a reusable hook
 */
export function useErrorToast({ error, status, onError }: ErrorToastOptions) {
    const { toast } = useToast();

    useEffect(() => {
        const showErrorToast = async () => {
            if (error && (status === "ERROR" || status === "ABORTED")) {
                const errorMessage =
                    typeof error === "string" ? error : getErrorDiagnosticMessage(error);

                // Determine toast variant and title based on error type
                let variant: "destructive" | "default" = "destructive";
                let title = "API Call Failed";

                const errorLower = errorMessage.toLowerCase();

                // Use centralized error message service for consistent error categorization
                try {
                    const { generateErrorMessage } = await import(
                        "@repo/ai/services/error-messages"
                    );
                    const structuredError = generateErrorMessage(errorMessage, {
                        originalError: errorMessage,
                    });
                    title = structuredError.title;
                } catch {
                    // Fallback to existing logic if service fails
                    if (
                        errorLower.includes("credit balance") ||
                        errorLower.includes("too low") ||
                        errorLower.includes("plans & billing")
                    ) {
                        title = "Credit Balance Too Low";
                    } else if (
                        errorLower.includes("x.ai credits required") ||
                        errorLower.includes("doesn't have any credits yet") ||
                        errorLower.includes("console.x.ai")
                    ) {
                        title = "X.AI Credits Required";
                    } else if (errorLower.includes("rate limit") || errorLower.includes("quota")) {
                        title = "Rate Limit Exceeded";
                    } else if (
                        errorLower.includes("network") ||
                        errorLower.includes("connection") ||
                        errorLower.includes("networkerror")
                    ) {
                        title = "Network Error";
                    } else if (
                        errorLower.includes("unauthorized") ||
                        errorLower.includes("invalid api key") ||
                        errorLower.includes("authentication")
                    ) {
                        title = "Authentication Error";
                    } else if (
                        errorLower.includes("billing") ||
                        errorLower.includes("payment") ||
                        errorLower.includes("plans & billing")
                    ) {
                        title = "Billing Issue";
                    } else if (
                        errorLower.includes("503") ||
                        errorLower.includes("service unavailable") ||
                        errorLower.includes("502")
                    ) {
                        title = "Service Unavailable";
                    } else if (
                        errorLower.includes("aborted") ||
                        errorLower.includes("stopped") ||
                        errorLower.includes("cancelled")
                    ) {
                        title = "Request Cancelled";
                        variant = "default";
                    }
                }

                toast({
                    title,
                    description: errorMessage,
                    variant,
                    duration: 6000, // Show for 6 seconds for better readability
                });

                // Call optional error callback
                onError?.(errorMessage);
            }
        };

        showErrorToast();
    }, [error, status, toast, onError]);
}
