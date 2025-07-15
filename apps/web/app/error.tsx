"use client";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
    const handleHomeNavigation = () => {
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-dvh flex-col">
            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        <h1 className="mb-2 text-4xl font-semibold text-foreground">Oops!</h1>
                        <h2 className="mb-3 text-xl font-medium text-foreground">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            We encountered an unexpected error. This has been logged and we'll look
                            into it.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Try again
                        </button>
                        <button
                            type="button"
                            onClick={handleHomeNavigation}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
