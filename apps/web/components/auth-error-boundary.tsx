'use client';

import { Component, ReactNode } from 'react';
import { TypographyH2 } from '@repo/ui';
import { logger } from '@repo/shared/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        logger.error('[Auth Error Boundary] Caught error:', { data: error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="bg-background flex min-h-screen items-center justify-center">
                        <div className="text-center">
                            <TypographyH2 className="text-foreground text-lg font-semibold">
                                Authentication Error
                            </TypographyH2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Please refresh the page or try again later
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2 text-sm"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
