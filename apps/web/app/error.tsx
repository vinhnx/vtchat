"use client";

import { Button } from "@repo/ui";

// Disable static generation to prevent React context issues during build
export const dynamic = "force-dynamic";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
    const handleHomeNavigation = () => {
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
                <h1 className="mb-4 text-4xl font-bold">Something went wrong</h1>
                <p className="mb-6 text-muted-foreground">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="flex justify-center space-x-4">
                    <Button onClick={reset} variant="default">
                        Try again
                    </Button>
                    <Button onClick={handleHomeNavigation} variant="outline">
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
