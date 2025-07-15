// Simple 404 page without React context dependencies for Next.js 15.4 + React 19 compatibility
export const dynamic = "force-dynamic";

export const metadata = {
    title: "404 - Page Not Found | VT",
    description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
                        fontSize: "4rem",
                        fontWeight: "600",
                        margin: "0 0 1rem 0",
                        color: "#374151",
                    }}
                >
                    404
                </h1>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "500",
                        margin: "0 0 1rem 0",
                        color: "#6b7280",
                    }}
                >
                    Page Not Found
                </h2>
                <p
                    style={{
                        fontSize: "1rem",
                        marginBottom: "2rem",
                        color: "#9ca3af",
                        lineHeight: "1.6",
                    }}
                >
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <a
                    href="/"
                    style={{
                        display: "inline-block",
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#111827",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                    }}
                >
                    Back to VT
                </a>
            </div>
        </div>
    );
}
