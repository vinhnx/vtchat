'use client';

import React, { Component, ReactNode } from 'react';

interface SSRErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface SSRErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export class SSRErrorBoundary extends Component<SSRErrorBoundaryProps, SSRErrorBoundaryState> {
    constructor(props: SSRErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): SSRErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error for debugging, but don't crash during SSR
        console.warn('SSR Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI during SSR
            return (
                this.props.fallback || (
                    <div className="bg-background flex h-[100dvh] w-full items-center justify-center">
                        <div className="text-muted-foreground text-sm">Loading application...</div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
