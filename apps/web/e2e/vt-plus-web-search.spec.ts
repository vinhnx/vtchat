import { expect, test } from "@playwright/test";

test.describe("VT+ Web Search Functionality", () => {
    test("should work for authenticated VT+ users", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        // Check session and subscription status first
        const userStatus = await page.evaluate(async () => {
            try {
                const [sessionRes, subscriptionRes] = await Promise.all([
                    fetch("/api/auth/get-session"),
                    fetch("/api/subscription/status"),
                ]);

                return {
                    session: await sessionRes.json(),
                    subscription: await subscriptionRes.json(),
                    isAuthenticated: sessionRes.status === 200,
                    hasVTPlus:
                        subscriptionRes.status === 200 &&
                        (await subscriptionRes.json())?.isPlusSubscriber,
                };
            } catch (error) {
                return { error: (error as Error).message };
            }
        });

        // Skip test if user is not VT+ subscriber
        if (!userStatus.hasVTPlus) {
            test.skip();
            return;
        }

        // Test web search API with proper authentication
        const webSearchResponse = await page.evaluate(async () => {
            try {
                const res = await fetch("/api/completion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        threadId: `vt-plus-test-${Date.now()}`,
                        threadItemId: `vt-plus-item-${Date.now()}`,
                        parentThreadItemId: `vt-plus-parent-${Date.now()}`,
                        prompt: "test VT+ web search functionality",
                        messages: [{ role: "user", content: "test VT+ web search functionality" }],
                        mode: "gemini-2.5-flash-lite-preview-06-17",
                        webSearch: true,
                        mathCalculator: false,
                        charts: false,
                        userTier: "PLUS",
                    }),
                });

                return {
                    status: res.status,
                    headers: Object.fromEntries(res.headers.entries()),
                    isEventStream: res.headers.get("content-type")?.includes("text/event-stream"),
                };
            } catch (error) {
                return { error: (error as Error).message };
            }
        });

        // VT+ users should get successful streaming response for web search
        expect(webSearchResponse.status).toBe(200);
        expect(webSearchResponse.isEventStream).toBe(true);
    });

    test("should check rate limit status for VT+ users", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        // Check if user is VT+ subscriber
        const subscriptionStatus = await page.evaluate(async () => {
            try {
                const res = await fetch("/api/subscription/status");
                const data = await res.json();
                return { status: res.status, isPlusSubscriber: data?.isPlusSubscriber };
            } catch (error) {
                return { error: (error as Error).message };
            }
        });

        // Skip if not VT+ user
        if (!subscriptionStatus.isPlusSubscriber) {
            test.skip();
            return;
        }

        // Test rate limit status API
        const rateLimitResponse = await page.evaluate(async () => {
            try {
                const res = await fetch(
                    "/api/rate-limit/status?model=gemini-2.5-flash-lite-preview-06-17",
                    {
                        method: "POST",
                    },
                );

                return {
                    status: res.status,
                    data: await res.json().catch(() => ({})),
                };
            } catch (error) {
                return { error: (error as Error).message };
            }
        });

        // Should not return 500 error anymore
        expect([200, 401, 403]).toContain(rateLimitResponse.status);
        expect(rateLimitResponse.status).not.toBe(500);

        if (rateLimitResponse.status === 200) {
            // VT+ users should have positive or infinite limits
            expect(rateLimitResponse.data).toHaveProperty("dailyLimit");
            expect(rateLimitResponse.data).toHaveProperty("minuteLimit");
        }
    });

    test("should handle web search UI interactions for VT+ users", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        // Check VT+ status
        const hasVTPlus = await page.evaluate(async () => {
            try {
                const res = await fetch("/api/subscription/status");
                const data = await res.json();
                return data?.isPlusSubscriber === true;
            } catch {
                return false;
            }
        });

        if (!hasVTPlus) {
            test.skip();
            return;
        }

        // Wait for chat interface
        await page.waitForSelector('textarea, [contenteditable="true"]', { timeout: 10000 });

        // Look for web search toggle button
        const webSearchButton = page.locator("button").filter({ hasText: "Web Search" }).first();

        if (await webSearchButton.isVisible()) {
            // Should be able to toggle web search without login prompt
            await webSearchButton.click();

            // Should not show login dialog for VT+ users
            await expect(page.locator("text=Login Required")).not.toBeVisible({ timeout: 2000 });

            // Try a simple query
            const chatInput = page.locator('textarea, [contenteditable="true"]');
            await chatInput.fill("What is the current date?");

            const submitButton = page.locator('button[type="submit"], button:has(svg)').last();
            if (await submitButton.isVisible()) {
                await submitButton.click();

                // Should not get authentication error
                await expect(page.locator("text=Authentication required")).not.toBeVisible({
                    timeout: 5000,
                });

                // Should see some response (could be error due to other issues, but not auth)
                await expect(
                    page.locator(
                        '[data-testid="message"], .message, text=Error, text=AI is thinking',
                    ),
                ).toBeVisible({ timeout: 10000 });
            }
        }
    });
});
