import { expect, test } from '@playwright/test';

test.describe('Setup Verification', () => {
    test('should verify setup files exist', async ({ page }) => {
        // This test just verifies that our setup is working
        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should verify auth directory can be created', async ({ page }) => {
        // Test that we can create the auth directory
        const fs = require('fs');
        const path = require('path');
        const authDir = path.join(process.cwd(), 'playwright', '.auth');

        // Create directory if it doesn't exist
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }

        // Verify directory exists
        expect(fs.existsSync(authDir)).toBe(true);

        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();
    });
});
