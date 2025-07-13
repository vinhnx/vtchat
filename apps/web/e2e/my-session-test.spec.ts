import { expect, test } from "@playwright/test";

test.describe("My Real Session Tests", () => {
    test("should be logged in with my real OAuth session", async ({ page }) => {
        // Navigate to the app
        await page.goto("/", { waitUntil: "load" });

        // Take a screenshot to see the current state
        await page.screenshot({ path: "my-session-test.png" });

        // Wait for basic page elements
        await expect(page.locator("body")).toBeVisible();

        // Check if we have the main chat interface (indicates we're logged in)
        const chatInput = page.locator('textarea, [contenteditable="true"]');
        await expect(chatInput).toBeVisible({ timeout: 10000 });

        // Check if we're NOT on the login page
        const loginHeading = page.getByRole("heading", { name: "Welcome to VT!" });
        await expect(loginHeading).not.toBeVisible();

        // Successfully authenticated - can access chat interface
    });

    test("should have chat functionality available", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        // Test chat functionality
        const chatInput = page.locator('textarea, [contenteditable="true"]');
        await expect(chatInput).toBeVisible({ timeout: 10000 });

        // Try typing in the chat
        await chatInput.fill("Test message from Playwright");

        // For contenteditable, check text content instead of value
        const inputText = await chatInput.textContent();
        expect(inputText).toContain("Test message from Playwright");

        // Check subscription status - be more specific with locators
        const freeIndicator = page.locator("text=Free").first();
        const upgradeButtons = page.locator('button:has-text("Upgrade")');
        const upgradeButtonCount = await upgradeButtons.count();

        if (upgradeButtonCount > 0 || (await freeIndicator.isVisible())) {
            console.log("User appears to be on free tier");
        } else {
            console.log("User might have VT+ subscription");
        }
    });

    test("should maintain session across page refreshes", async ({ page }) => {
        await page.goto("/", { waitUntil: "load" });

        // Verify we can access chat before refresh
        await expect(page.locator('textarea, [contenteditable="true"]')).toBeVisible({
            timeout: 10000,
        });

        // Refresh the page
        await page.reload({ waitUntil: "load" });

        // Should still be able to access chat (indicating we're still logged in)
        await expect(page.locator('textarea, [contenteditable="true"]')).toBeVisible({
            timeout: 10000,
        });

        // Should not be on login page
        await expect(page.getByRole("heading", { name: "Welcome to VT!" })).not.toBeVisible();
    });
});
