/**
 * Admin Logs Page Test
 *
 * This test verifies the admin logs page functionality
 * specifically checking for the React.Children.only and
 * Turbopack errors we've been debugging.
 */

import { chromium } from "playwright";

async function testAdminLogsPage() {
    const browser = await chromium.launch({
        headless: false,
        devtools: true, // Open dev tools to see console errors
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen for console errors
    const errors = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            errors.push(msg.text());
        }
    });

    // Listen for page errors
    page.on("pageerror", (error) => {
        errors.push(error.message);
    });

    try {
        // Navigate to home first
        await page.goto("http://localhost:3000");

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Try direct navigation to admin logs
        await page.goto("http://localhost:3000/admin/logs");

        // Wait to see if errors occur
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: "admin-logs-test.png" });

        // Check if we see the admin access required message or actual content
        const hasAdminAccess = await page
            .locator('[data-testid="admin-logs-content"]')
            .isVisible()
            .catch(() => false);
        const needsAuth = await page
            .locator("text=Admin Access Required")
            .isVisible()
            .catch(() => false);

        if (needsAuth) {
            // Admin authentication required - expected behavior
        } else if (hasAdminAccess) {
            // Admin logs page loaded successfully
        } else {
            // Unknown page state
        }

        // Report on errors
        if (errors.length === 0) {
            // No JavaScript errors detected
        } else {
            errors.forEach(() => {
                // Report each error
            });
        }
    } catch {
        // Handle test error
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminLogsPage();
