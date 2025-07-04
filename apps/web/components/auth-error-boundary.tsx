'use client';

import { log } from '@repo/shared/logger';
import { TypographyH2 } from '@repo/ui';
import { Component, type ReactNode } from 'react';

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
        log.error({ error, errorInfo }, '[Auth Error Boundary] Caught error');
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
                                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2 text-sm"
                                onClick={() => window.location.reload()}
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
