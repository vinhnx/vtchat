"use client";

import { log } from "@repo/shared/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface TableErrorBoundaryState {
    hasError: boolean;
    errorMessage?: string;
    errorCount: number;
}

interface TableErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Specialized error boundary for table rendering that prevents infinite loops
 * and provides safe fallback rendering for malformed tables
 */
export class TableErrorBoundary extends Component<
    TableErrorBoundaryProps,
    TableErrorBoundaryState
> {
    private static errorCounts = new Map<string, number>();
    private static readonly MAX_ERRORS = 3;
    private static readonly RESET_INTERVAL = 10000; // 10 seconds
    private static lastErrorTime = new Map<string, number>();

    constructor(props: TableErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<TableErrorBoundaryState> {
        return {
            hasError: true,
            errorMessage: error.message,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const errorKey = `${error.message}-${errorInfo.componentStack?.substring(0, 50)}`;
        const now = Date.now();
        const lastTime = TableErrorBoundary.lastErrorTime.get(errorKey) || 0;

        // Reset error count if enough time has passed
        if (now - lastTime > TableErrorBoundary.RESET_INTERVAL) {
            TableErrorBoundary.errorCounts.set(errorKey, 0);
        }

        const currentCount = TableErrorBoundary.errorCounts.get(errorKey) || 0;
        const newCount = currentCount + 1;

        TableErrorBoundary.errorCounts.set(errorKey, newCount);
        TableErrorBoundary.lastErrorTime.set(errorKey, now);

        this.setState({ errorCount: newCount });

        // Log error with context
        log.error(
            {
                error: error.message,
                errorCount: newCount,
                componentStack: errorInfo.componentStack,
                errorBoundary: "TableErrorBoundary",
            },
            "Table rendering error caught by error boundary",
        );

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // If too many errors, prevent further rendering attempts
        if (newCount >= TableErrorBoundary.MAX_ERRORS) {
            log.warn(
                { errorKey, errorCount: newCount },
                "Maximum table rendering errors reached, blocking further attempts",
            );
        }
    }

    componentDidUpdate(prevProps: TableErrorBoundaryProps) {
        // Reset error state when children change (new content)
        if (prevProps.children !== this.props.children && this.state.hasError) {
            this.setState({
                hasError: false,
                errorMessage: undefined,
            });
        }
    }

    render() {
        if (this.state.hasError) {
            // If we've hit the error limit, show a permanent fallback
            if (this.state.errorCount >= TableErrorBoundary.MAX_ERRORS) {
                return (
                    <div className="border-destructive bg-destructive/10 text-destructive my-4 rounded-md border p-4">
                        <div className="text-sm font-medium">Table Rendering Blocked</div>
                        <div className="text-xs opacity-80 mt-1">
                            Multiple rendering errors detected. Content has been converted to plain
                            text for safety.
                        </div>
                        <pre className="bg-muted text-muted-foreground mt-2 overflow-x-auto rounded p-2 text-xs">
                            {typeof this.props.children === "string"
                                ? this.props.children
                                : "Table content unavailable"}
                        </pre>
                    </div>
                );
            }

            // Show custom fallback or default error message
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="border-warning bg-warning/10 text-warning my-4 rounded-md border p-4">
                    <div className="text-sm font-medium">Table Rendering Error</div>
                    <div className="text-xs opacity-80 mt-1">
                        There was an issue rendering this table. Showing as code block instead.
                    </div>
                    <pre className="bg-muted text-muted-foreground mt-2 overflow-x-auto rounded p-2 text-xs">
                        {typeof this.props.children === "string"
                            ? this.props.children
                            : "Table content unavailable"}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }

    /**
     * Reset error counts for testing or manual recovery
     */
    static resetErrorCounts(): void {
        TableErrorBoundary.errorCounts.clear();
        TableErrorBoundary.lastErrorTime.clear();
    }
}

/**
 * Hook to wrap table content with error boundary
 */
export function useTableErrorBoundary() {
    return {
        wrapTable: (content: ReactNode, fallback?: ReactNode) => (
            <TableErrorBoundary fallback={fallback}>{content}</TableErrorBoundary>
        ),
        resetErrors: TableErrorBoundary.resetErrorCounts,
    };
}
