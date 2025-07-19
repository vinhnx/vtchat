import { expect, test } from "@playwright/test";

test("login with preset cookies", async ({ page, context }) => {
    // Method A: Set cookies before navigation
    await context.addCookies([
        {
            name: "better-auth.session_token", // Better-Auth session cookie
            value: "your-actual-session-token-here",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
        },
        {
            name: "better-auth.csrf_token", // CSRF token if needed
            value: "your-csrf-token-here",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
        },
        // Add more cookies as needed based on your auth system
    ]);

    // Now navigate to the app
    await page.goto("/");

    // Verify you're logged in
    await expect(page.locator("body")).toBeVisible();

    // Add assertions to verify authentication worked
    // Example: check for user menu, profile, etc.
});

test("login with cookies from file", async ({ page, context }) => {
    // Method B: Load cookies from a JSON file
    const fs = require("node:fs");
    const cookiesFile = "./e2e/cookies.json";

    if (fs.existsSync(cookiesFile)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, "utf8"));
        await context.addCookies(cookies);
    }

    await page.goto("/");
    // Your test assertions here
});
