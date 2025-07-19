"use client";

import { log } from "@repo/shared/logger";
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
                <div className="flex min-h-dvh flex-col">
                    <main className="flex flex-1 items-center justify-center px-4">
                        <div className="w-full max-w-md text-center">
                            <div className="mb-8">
                                <h1 className="text-foreground mb-2 text-4xl font-bold">500</h1>
                                <h2 className="text-foreground mb-3 text-xl font-medium">
                                    Something went wrong
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    An unexpected error occurred. Please try refreshing the page.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <button
                                    type="button"
                                    className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                    onClick={reset}
                                >
                                    Try again
                                </button>
                                <button
                                    type="button"
                                    className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                    onClick={handleHomeNavigation}
                                >
                                    Back to VT
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
