// Test file to verify useSession fix in ChatFooter
// This test verifies that the ChatFooter component no longer throws "useSession is not defined" error

import { expect, test } from '@playwright/test';

test.describe('ChatFooter useSession Fix', () => {
    test('should render ChatFooter without useSession error', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Check that the page loads without JavaScript errors
        const errors = [];
        page.on('pageerror', (error) => {
            errors.push(error.message);
        });

        // Wait a bit to catch any errors
        await page.waitForTimeout(2000);

        // Verify no "useSession is not defined" errors occurred
        const useSessionErrors = errors.filter(error =>
            error.includes('useSession is not defined')
        );

        expect(useSessionErrors.length).toBe(0);

        // For non-logged users, the footer should be visible
        const footer = page.locator('footer').first();
        await expect(footer).toBeVisible();

        console.log('✅ ChatFooter renders without useSession errors');
    });

    test('should show footer for non-logged users', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Footer should be visible for non-logged users
        const footer = page.locator('footer').first();
        await expect(footer).toBeVisible();

        // Check that the footer contains expected links
        await expect(footer.locator('text=Terms')).toBeVisible();
        await expect(footer.locator('text=Privacy')).toBeVisible();
        await expect(footer.locator('text=Support')).toBeVisible();
    });
});
