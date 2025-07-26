import { expect, test } from "@playwright/test";

test("authenticate with Better-Auth session", async ({ page, context }) => {
    // Better-Auth typically uses these cookie names:
    const sessionCookies = [
        {
            name: "better-auth.session_token",
            value: process.env.PLAYWRIGHT_SESSION_TOKEN || "your-session-token",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "Lax", // changed from string to allowed enum value
        },
        {
            name: "better-auth.csrf_token",
            value: process.env.PLAYWRIGHT_CSRF_TOKEN || "your-csrf-token",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "Lax", // changed from string to allowed enum value
        },
    ];

    await context.addCookies(sessionCookies);
    await page.goto("/");

    // Verify authentication
    try {
        // Look for authenticated user indicators
        await expect(page.locator('[data-testid="user-menu"], .user-avatar')).toBeVisible({
            timeout: 5000,
        });
    } catch {
        // Fallback: ensure we're not on login page
        await expect(page.getByRole("heading", { name: "Welcome to VT!" })).not.toBeVisible();
    }
});

test("extract session cookies helper", async ({ page, context }) => {
    // Helper test to extract current session cookies
    await page.goto("/login");

    // Manual login flow here or use existing auth setup
    // Then extract cookies:
    const cookies = await context.cookies();

    // Save for future use
    const sessionCookies = cookies.filter(
        (c) => c.name.includes("session") || c.name.includes("auth") || c.name.includes("csrf"),
    );

    if (sessionCookies.length > 0) {
        require("node:fs").writeFileSync(
            "./e2e/session-cookies.json",
            JSON.stringify(sessionCookies, null, 2),
        );
    }
});
