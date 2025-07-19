/**
 * Test to verify that the footer flash issue is fixed
 * - VT+ users shouldn't see footer flash on page reload
 * - Footer should only appear after authentication state is loaded
 */

const { test, expect } = require('@playwright/test');

test.describe('Footer Flash Fix', () => {
    test('VT+ user should not see footer flash on home page reload', async ({ page }) => {
        // Mock a VT+ user session
        await page.addInitScript(() => {
            // Mock the session loading state
            window.__TEST_SESSION_LOADING__ = true;
            window.__TEST_SESSION_DATA__ = { user: { id: '123', planSlug: 'vt_plus' } };

            setTimeout(() => {
                window.__TEST_SESSION_LOADING__ = false;
            }, 100); // Simulate async session loading
        });

        await page.goto('/');

        // Check that footer is not visible initially (while session is loading)
        const footer = page.locator('footer').first();
        await expect(footer).not.toBeVisible();

        // Wait for session to load
        await page.waitForTimeout(150);

        // Footer should still not be visible for logged-in users
        await expect(footer).not.toBeVisible();
    });

    test('Free user should see footer after session loads', async ({ page }) => {
        // Mock a free user (no session)
        await page.addInitScript(() => {
            window.__TEST_SESSION_LOADING__ = true;
            window.__TEST_SESSION_DATA__ = null;

            setTimeout(() => {
                window.__TEST_SESSION_LOADING__ = false;
            }, 100);
        });

        await page.goto('/');

        // Footer should not be visible initially (while loading)
        const footer = page.locator('footer').first();
        await expect(footer).not.toBeVisible();

        // Wait for session to load
        await page.waitForTimeout(150);

        // Footer should now be visible for non-logged users
        await expect(footer).toBeVisible();
    });

    test('Chat footer should not flash for VT+ users', async ({ page }) => {
        // Mock VT+ user
        await page.addInitScript(() => {
            window.__TEST_SESSION_LOADING__ = true;
            window.__TEST_SESSION_DATA__ = { user: { id: '123', planSlug: 'vt_plus' } };

            setTimeout(() => {
                window.__TEST_SESSION_LOADING__ = false;
            }, 100);
        });

        await page.goto('/');

        // Chat footer should not be visible initially or after session loads
        const footer = page.locator('footer').first();
        await expect(footer).not.toBeVisible();

        // Wait for session to load
        await page.waitForTimeout(150);

        // Should still not be visible for logged-in users
        await expect(footer).not.toBeVisible();
    });
});
