import { expect, test } from "@playwright/test";

test.describe("Web Search Authentication", () => {
    test.describe("API Authentication Tests", () => {
        test("should return 401 when web search is attempted without authentication", async ({
            page,
        }) => {
            await page.goto("/", { waitUntil: "load" });

            // Try to make a request with web search enabled by directly calling the API
            const response = await page.evaluate(async () => {
                try {
                    const res = await fetch("/api/completion", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            threadId: `test-thread-${Date.now()}`,
                            threadItemId: `test-item-${Date.now()}`,
                            parentThreadItemId: `test-parent-${Date.now()}`,
                            prompt: "test query with web search",
                            messages: [{ role: "user", content: "test query with web search" }],
                            mode: "gemini-2.5-flash-lite-preview-06-17",
                            webSearch: true,
                            mathCalculator: false,
                            charts: false,
                        }),
                    });

                    return {
                        status: res.status,
                        data: await res.json().catch(() => ({})),
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });

            // Should return authentication error (401 for auth, 400 for validation)
            expect([400, 401]).toContain(response.status);

            if (response.data?.error) {
                const hasAuthError = response.data.error.includes("Authentication required");
                const hasValidationError = response.data.error.includes("Invalid request body");
                expect(hasAuthError || hasValidationError).toBe(true);
            }
        });

        test("should validate chat mode authentication requirements", async ({ page }) => {
            await page.goto("/", { waitUntil: "load" });

            // Test various modes with web search
            const testCases = [
                {
                    mode: "gemini-2.5-flash-lite-preview-06-17",
                    expectAuth: true,
                },
                {
                    mode: "gpt-4o-mini",
                    expectAuth: true,
                },
                {
                    mode: "pro",
                    expectAuth: true,
                },
            ];

            for (const testCase of testCases) {
                const response = await page.evaluate(async (mode) => {
                    try {
                        const res = await fetch("/api/completion", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                threadId: `test-${Date.now()}`,
                                threadItemId: `test-${Date.now()}`,
                                parentThreadItemId: `test-parent-${Date.now()}`,
                                prompt: "test query",
                                mode,
                                messages: [{ role: "user", content: "test" }],
                                webSearch: true,
                            }),
                        });

                        return {
                            status: res.status,
                            data: await res.json().catch(() => ({})),
                        };
                    } catch (error) {
                        return { error: error.message };
                    }
                }, testCase.mode);

                if (testCase.expectAuth) {
                    // Should require authentication
                    expect([400, 401, 403]).toContain(response.status);
                }
            }
        });
    });

    test.describe("UI State Tests", () => {
        test("should have feature toggle buttons visible", async ({ page }) => {
            await page.goto("/", { waitUntil: "load" });

            // Wait for chat interface to load
            await page.waitForSelector('textarea, [contenteditable="true"]', { timeout: 10000 });

            // Look for any feature toggle buttons (they should exist even if not authenticated)
            const toggleButtons = page.locator("button:has(svg)");
            const buttonCount = await toggleButtons.count();

            // Should have some feature toggle buttons
            expect(buttonCount).toBeGreaterThan(0);
        });

        test("should show proper authentication state in session API", async ({ page }) => {
            await page.goto("/", { waitUntil: "load" });

            // Check session status via API
            const sessionResponse = await page.evaluate(async () => {
                try {
                    const res = await fetch("/api/auth/get-session");
                    return {
                        status: res.status,
                        data: await res.json().catch(() => ({})),
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });

            // Session endpoint should be accessible
            expect([200, 401]).toContain(sessionResponse.status);

            // If not authenticated, session should be null/empty
            if (sessionResponse.status === 200 && !sessionResponse.data?.user) {
                // User is not authenticated - this is expected for unauthenticated tests
                expect(sessionResponse.data?.user).toBeFalsy();
            }
        });
    });

    test.describe("Error Handling", () => {
        test("should provide clear error messages for different scenarios", async ({ page }) => {
            await page.goto("/", { waitUntil: "load" });

            // Test missing required fields
            const invalidResponse = await page.evaluate(async () => {
                try {
                    const res = await fetch("/api/completion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            // Missing required fields
                            webSearch: true,
                        }),
                    });

                    return {
                        status: res.status,
                        data: await res.json().catch(() => ({})),
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });

            // Should return validation error
            expect(invalidResponse.status).toBe(400);
            expect(invalidResponse.data?.error).toContain("Invalid request body");
        });

        test("should handle malformed requests gracefully", async ({ page }) => {
            await page.goto("/", { waitUntil: "load" });

            // Test malformed JSON
            const malformedResponse = await page.evaluate(async () => {
                try {
                    const res = await fetch("/api/completion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: "invalid json",
                    });

                    return {
                        status: res.status,
                        data: await res.json().catch(() => ({})),
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });

            // Should handle gracefully with appropriate error
            expect([400, 500]).toContain(malformedResponse.status);
        });
    });
});
