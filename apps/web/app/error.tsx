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
        <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md p-6 text-center">
                <h1 className="mb-3 text-lg font-medium">Something went wrong</h1>
                <p className="text-muted-foreground mb-4 text-sm">
                    An unexpected error occurred. Please try again.
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
    );
}
