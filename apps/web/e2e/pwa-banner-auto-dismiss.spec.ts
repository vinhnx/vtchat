/**
 * PWA Banner Auto-Dismiss Test
 * 
 * Tests the PWA install banner functionality:
 * 1. Banner appears when conditions are met
 * 2. Banner auto-dismisses after 4 seconds
 * 3. Close button works immediately
 * 4. Banner doesn't reappear after being dismissed
 */

import { test, expect } from '@playwright/test';

test.describe('PWA Install Banner', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to homepage where PWA banner should appear
        await page.goto('/');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
    });

    test('should show PWA banner on mobile viewport', async ({ page }) => {
        // Set mobile viewport to trigger mobile-only banner
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Mock the beforeinstallprompt event to simulate PWA installability
        await page.evaluate(() => {
            // Simulate PWA installability
            const event = new Event('beforeinstallprompt') as any;
            event.preventDefault = () => {};
            event.prompt = () => Promise.resolve();
            event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });
            window.dispatchEvent(event);
        });

        // Wait for banner to appear
        const banner = page.locator('.pwa-install-banner');
        await expect(banner).toBeVisible({ timeout: 2000 });
        
        // Verify banner content
        await expect(banner.locator('text=Install VT App')).toBeVisible();
        await expect(banner.locator('text=Get a better experience, offline access.')).toBeVisible();
        
        // Verify close button is present
        const closeButton = banner.locator('button').first();
        await expect(closeButton).toBeVisible();
        
        // Verify install button is present
        const installButton = banner.locator('button:has-text("Install")');
        await expect(installButton).toBeVisible();
    });

    test('should auto-dismiss banner after 4 seconds', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Mock PWA installability
        await page.evaluate(() => {
            const event = new Event('beforeinstallprompt') as any;
            event.preventDefault = () => {};
            event.prompt = () => Promise.resolve();
            event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });
            window.dispatchEvent(event);
        });

        const banner = page.locator('.pwa-install-banner');
        
        // Banner should be visible initially
        await expect(banner).toBeVisible({ timeout: 2000 });
        
        // Wait for auto-dismiss (4 seconds + small buffer)
        await page.waitForTimeout(4500);
        
        // Banner should be hidden after auto-dismiss
        await expect(banner).not.toBeVisible();
    });

    test('should close banner immediately when close button is clicked', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Mock PWA installability
        await page.evaluate(() => {
            const event = new Event('beforeinstallprompt') as any;
            event.preventDefault = () => {};
            event.prompt = () => Promise.resolve();
            event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });
            window.dispatchEvent(event);
        });

        const banner = page.locator('.pwa-install-banner');
        
        // Wait for banner to appear
        await expect(banner).toBeVisible({ timeout: 2000 });
        
        // Click close button (X icon)
        const closeButton = banner.locator('button').first();
        await closeButton.click();
        
        // Banner should disappear immediately
        await expect(banner).not.toBeVisible();
    });

    test('should not show on desktop viewport', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1024, height: 768 });
        
        // Mock PWA installability
        await page.evaluate(() => {
            const event = new Event('beforeinstallprompt') as any;
            event.preventDefault = () => {};
            event.prompt = () => Promise.resolve();
            event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });
            window.dispatchEvent(event);
        });

        const banner = page.locator('.pwa-install-banner');
        
        // Wait a bit and ensure banner doesn't appear on desktop
        await page.waitForTimeout(1000);
        await expect(banner).not.toBeVisible();
    });
});
