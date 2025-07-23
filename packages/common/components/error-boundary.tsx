"use client";

import { log } from "@repo/shared/logger";
import React from "react";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Filter out development-mode Turbopack errors
        if (
            process.env.NODE_ENV === "development" &&
            (error.message.includes("__turbopack_context__") ||
                error.message.includes("register is not a function"))
        ) {
            // Log but don't crash the app for known development issues
            log.debug({ error: error.message }, "Development mode error (ignored)");
            return;
        }

        // Log actual errors
        log.error(
            { error: error.message, stack: error.stack },
            "React Error Boundary caught error",
        );

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Don't show error UI for development Turbopack issues
            if (
                process.env.NODE_ENV === "development" &&
                this.state.error &&
                (this.state.error.message.includes("__turbopack_context__") ||
                    this.state.error.message.includes("register is not a function"))
            ) {
                return this.props.children;
            }

            // Use custom fallback or default error UI
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            return (
                <div className="flex min-h-[120px] flex-col items-center justify-center p-4">
                    <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                        Something went wrong
                    </h2>
                    <p className="mb-3 text-xs text-muted-foreground">
                        An error occurred while rendering this component.
                    </p>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details className="mb-3 max-w-lg">
                            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                                Error Details (Development)
                            </summary>
                            <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs text-foreground">
                                {this.state.error.message}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <button
                        className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                        onClick={this.resetError}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
