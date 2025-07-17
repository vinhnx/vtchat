"use client";

import { log } from "@repo/shared/logger";
import { Button } from "@repo/ui";
import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log the error with proper context
        log.error(
            {
                error: error.message,
                digest: error.digest,
                stack: error.stack,
            },
            "Global error encountered",
        );
    }, [error]);

    const handleHomeNavigation = () => {
        window.location.href = "/";
    };

    return (
        <html lang="en">
            <body className="bg-background text-foreground">
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
                        <h1 className="mb-2 text-6xl font-bold">500</h1>
                        <h2 className="mb-4 text-2xl font-semibold">Something went wrong</h2>
                        <p className="mb-6 text-muted-foreground">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button onClick={reset} variant="default">
                                Try again
                            </Button>
                            <Button onClick={handleHomeNavigation} variant="outline">
                                Back to VT
                            </Button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
