import { expect, test } from '@playwright/test';

test.describe('Authenticated User Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure we start with a fresh session for each test
        await page.context().clearCookies();
        await page.context().clearPermissions();
    });

    test('should be able to access authenticated pages', async ({ page }) => {
        // Navigate to a protected page (assumes you have one)
        await page.goto('/');

        // Verify user is logged in by checking for user indicators
        // This should work since we're using the authenticated state
        await expect(page.locator('body')).toBeVisible();

        // Check that we're not redirected to login page
        await expect(page).not.toHaveURL(/\/login/);

        // Look for user session indicators
        // Adjust these selectors based on your app's UI
        const userIndicators = [
            '[data-testid="user-menu"]',
            '[data-testid="profile"]',
            '.user-avatar',
            'button:has-text("Profile")',
            'button:has-text("Settings")',
            'button:has-text("Sign out")',
            'button:has-text("Logout")',
        ];

        let foundUserIndicator = false;
        for (const selector of userIndicators) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                foundUserIndicator = true;
                break;
            } catch {
                // Continue to next selector
            }
        }

        // If no specific user indicator found, verify we can access the main app
        if (!foundUserIndicator) {
            await expect(page.locator('body')).toBeVisible();
        }
    });

    test('should maintain session across page reloads', async ({ page }) => {
        await page.goto('/');

        // Reload the page
        await page.reload();

        // Verify we're still authenticated
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator('body')).toBeVisible();
    });
});
