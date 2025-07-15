export default function NotFound() {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    maxWidth: "400px",
                }}
            >
                <h1
                    style={{
                        fontSize: "3rem",
                        fontWeight: "600",
                        margin: "0 0 1rem 0",
                        color: "#555",
                    }}
                >
                    404
                </h1>
                <h2
                    style={{
                        fontSize: "1.25rem",
                        fontWeight: "500",
                        margin: "0 0 0.75rem 0",
                        color: "#555",
                    }}
                >
                    Page Not Found
                </h2>
                <p
                    style={{
                        fontSize: "0.875rem",
                        marginBottom: "2rem",
                        color: "#888",
                        lineHeight: "1.5",
                    }}
                >
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <a
                    href="/"
                    style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#000",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                    }}
                >
                    Back to VT
                </a>
            </div>
        </div>
    );
}
