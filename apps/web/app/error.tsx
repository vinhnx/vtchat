"use client";

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
        <html lang="en">
            <head>
                <title>Error - Something went wrong</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body
                style={{
                    margin: 0,
                    padding: 0,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    display: "flex",
                    minHeight: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        maxWidth: "400px",
                        padding: "2rem",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "600",
                            margin: "0 0 1rem 0",
                            color: "#1f2937",
                        }}
                    >
                        Oops!
                    </h1>
                    <h2
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "500",
                            margin: "0 0 1rem 0",
                            color: "#374151",
                        }}
                    >
                        Something went wrong
                    </h2>
                    <p
                        style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            margin: "0 0 2rem 0",
                            lineHeight: "1.5",
                        }}
                    >
                        We encountered an unexpected error. This has been logged and we'll look into
                        it.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                textDecoration: "none",
                                display: "inline-block",
                            }}
                        >
                            Try again
                        </button>
                        <button
                            type="button"
                            onClick={handleHomeNavigation}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#6b7280",
                                color: "white",
                                border: "none",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                textDecoration: "none",
                                display: "inline-block",
                            }}
                        >
                            Go home
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
