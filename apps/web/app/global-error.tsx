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
                    <div className="w-full max-w-md p-6 text-center">
                        <h1 className="mb-2 text-2xl font-medium">500</h1>
                        <h2 className="mb-3 text-lg font-medium">Something went wrong</h2>
                        <p className="text-muted-foreground mb-4 text-sm">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <Button onClick={reset} variant="default" size="sm">
                                Try again
                            </Button>
                            <Button onClick={handleHomeNavigation} variant="outline" size="sm">
                                Back to VT
                            </Button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
