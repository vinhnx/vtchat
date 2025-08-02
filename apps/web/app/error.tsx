"use client";

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
                    <button
                        onClick={reset}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Try again
                    </button>
                    <button
                        onClick={handleHomeNavigation}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Back to VT
                    </button>
                </div>
            </div>
        </div>
    );
}
