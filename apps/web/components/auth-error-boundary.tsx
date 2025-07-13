"use client";

import { log } from "@repo/shared/logger";
import { Component, type ReactNode } from "react";
import { MinimalErrorPage } from "./minimal-error-page";

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
        log.error({ error, errorInfo }, "[Auth Error Boundary] Caught error");
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <MinimalErrorPage
                        code="401"
                        title="Authentication Error"
                        description="Please refresh the page or try again later."
                        actionButton={{
                            text: "Refresh Page",
                            onClick: () =>
                                typeof window !== "undefined" && window.location.reload(),
                        }}
                    />
                )
            );
        }

        return this.props.children;
    }
}
