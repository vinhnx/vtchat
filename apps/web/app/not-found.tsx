"use client";

// Simple 404 page without React context dependencies for Next.js 15.4 + React 19 compatibility
export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                flexDirection: "column",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <main
                style={{
                    display: "flex",
                    flex: "1",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 1rem",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "28rem",
                        textAlign: "center",
                    }}
                >
                    <div style={{ marginBottom: "2rem" }}>
                        <h1
                            style={{
                                fontSize: "2.25rem",
                                fontWeight: "700",
                                margin: "0 0 0.5rem 0",
                                color: "#111827",
                            }}
                        >
                            404
                        </h1>
                        <h2
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: "500",
                                margin: "0 0 0.75rem 0",
                                color: "#111827",
                            }}
                        >
                            Page Not Found
                        </h2>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                margin: "0",
                                color: "#6b7280",
                                lineHeight: "1.6",
                            }}
                        >
                            Sorry, we couldn't find the page you're looking for.
                        </p>
                    </div>
                    <a
                        href="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            whiteSpace: "nowrap",
                            borderRadius: "0.375rem",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            transition: "background-color 0.2s, outline 0.2s",
                            backgroundColor: "#111827",
                            color: "#fff",
                            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                            height: "2.25rem",
                            padding: "0 1rem",
                            textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#1f2937";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#111827";
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.backgroundColor = "#1f2937";
                            e.currentTarget.style.outline = "2px solid #3b82f6";
                            e.currentTarget.style.outlineOffset = "2px";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.backgroundColor = "#111827";
                            e.currentTarget.style.outline = "none";
                        }}
                    >
                        Back to VT
                    </a>
                </div>
            </main>
        </div>
    );
}
