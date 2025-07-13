"use client";

import { log } from "@repo/shared/lib/logger";

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";

export default function GlobalError({ error }: { error: Error }) {
    log.error({ error }, "Global error encountered");
    return (
        <html>
            <body>
                <div
                    style={{
                        display: "flex",
                        minHeight: "100vh",
                        flexDirection: "column",
                        backgroundColor: "#ffffff",
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                >
                    <main
                        style={{
                            display: "flex",
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "448px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ marginBottom: "2rem" }}>
                                <h1
                                    style={{
                                        margin: "0 0 0.5rem 0",
                                        fontSize: "2.25rem",
                                        fontWeight: "700",
                                        color: "#0f172a",
                                    }}
                                >
                                    500
                                </h1>
                                <h2
                                    style={{
                                        margin: "0 0 0.75rem 0",
                                        fontSize: "1.25rem",
                                        fontWeight: "500",
                                        color: "#0f172a",
                                    }}
                                >
                                    Something went wrong
                                </h2>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        color: "#64748b",
                                    }}
                                >
                                    It seems we encountered an unexpected error. Please try
                                    refreshing the page or check back later.
                                </p>
                            </div>
                            <a
                                href="/"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    height: "2.25rem",
                                    paddingLeft: "1rem",
                                    paddingRight: "1rem",
                                    borderRadius: "0.375rem",
                                    backgroundColor: "#0f172a",
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#1e293b";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#0f172a";
                                }}
                            >
                                Go back home
                            </a>
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
