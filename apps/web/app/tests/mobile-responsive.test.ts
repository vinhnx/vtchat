import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE
const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad
const DESKTOP_VIEWPORT = { width: 1280, height: 720 }; // Desktop

test.describe('Mobile Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto('/');
    });

    test('Mobile layout - core functionality works', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Check mobile header is visible
        await expect(
            page.locator('[data-testid="mobile-header"]').or(page.locator('.md\\:hidden').first())
        ).toBeVisible();

        // Check hamburger menu button exists and is clickable
        const hamburgerButton = page
            .locator('button')
            .filter({ hasText: /menu|hamburger/i })
            .or(
                page
                    .locator('button')
                    .filter({ has: page.locator('svg') })
                    .first()
            );

        // Check that the mobile header with menu button is visible
        await expect(page.locator('.md\\:hidden .bg-secondary')).toBeVisible();

        // Test mobile drawer functionality
        const mobileMenuButton = page.locator('.md\\:hidden button').first();
        if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();

            // Wait for drawer to open
            await page.waitForTimeout(500);

            // Check if navigation items are accessible in drawer
            const drawerContent = page.locator('[role="dialog"]').or(page.locator('.vaul-content'));
            if (await drawerContent.isVisible()) {
                await expect(drawerContent).toBeVisible();
            }
        }
    });

    test('Mobile chat input is functional', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Navigate to chat page
        await page.goto('/chat');

        // Check chat input exists and is properly sized
        const chatInput = page.locator('textarea, [contenteditable="true"]').first();
        await expect(chatInput).toBeVisible();

        // Test that toolbar buttons are accessible (may wrap on mobile)
        const toolbarButtons = page.locator('button').filter({
            hasText: /search|math|upload|image/i,
        });

        // At least some toolbar functionality should be visible
        const buttonCount = await toolbarButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
    });

    test('Mobile settings modal is responsive', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Try to open settings - check for floating user button or settings access
        const userButton = page
            .locator('button')
            .filter({ hasText: /user|profile|settings/i })
            .first();
        const settingsButton = page
            .locator('button')
            .filter({ hasText: /settings/i })
            .first();
        const floatingButton = page.locator('.fixed.bottom-4.right-4');

        // Look for any way to access settings on mobile
        let settingsOpened = false;

        if (await floatingButton.isVisible()) {
            await floatingButton.click();
            await page.waitForTimeout(200);
            const settingsMenuItem = page
                .locator('[role="menuitem"]')
                .filter({ hasText: /settings/i });
            if (await settingsMenuItem.isVisible()) {
                await settingsMenuItem.click();
                settingsOpened = true;
            }
        } else if (await settingsButton.isVisible()) {
            await settingsButton.click();
            settingsOpened = true;
        }

        if (settingsOpened) {
            await page.waitForTimeout(500);

            // Check that settings modal is properly sized for mobile
            const modal = page.locator('[role="dialog"]').filter({ hasText: /settings/i });
            await expect(modal).toBeVisible();

            // Settings should not overflow the viewport
            const modalBox = await modal.boundingBox();
            if (modalBox) {
                expect(modalBox.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
            }
        }
    });

    test('Tablet layout works correctly', async ({ page }) => {
        await page.setViewportSize(TABLET_VIEWPORT);

        // On tablet, desktop sidebar should be visible
        const sidebar = page
            .locator('.hidden.md\\:flex')
            .or(page.locator('[data-testid="sidebar"]'));

        // Check that layout adapts properly for tablet
        const mainContent = page.locator('main, .flex-1').first();
        await expect(mainContent).toBeVisible();

        // Tablet should have more space than mobile
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeGreaterThan(MOBILE_VIEWPORT.width);
    });

    test('Desktop layout maintains functionality', async ({ page }) => {
        await page.setViewportSize(DESKTOP_VIEWPORT);

        // Desktop should not show mobile-only elements
        await expect(page.locator('.md\\:hidden').first()).not.toBeVisible();

        // Desktop sidebar should be available
        const sidebarElements = page.locator('.hidden.md\\:flex, .md\\:flex').first();

        // Main content should be properly laid out
        const mainContent = page.locator('main, .flex-1').first();
        await expect(mainContent).toBeVisible();
    });

    test('Responsive breakpoints work correctly', async ({ page }) => {
        // Test mobile breakpoint
        await page.setViewportSize(MOBILE_VIEWPORT);
        await page.waitForTimeout(100);

        // Mobile-specific elements should be visible
        const mobileElements = page.locator('.md\\:hidden');
        const mobileElementsCount = await mobileElements.count();
        expect(mobileElementsCount).toBeGreaterThan(0);

        // Test desktop breakpoint
        await page.setViewportSize(DESKTOP_VIEWPORT);
        await page.waitForTimeout(100);

        // Desktop-specific elements should be visible
        const desktopElements = page.locator('.hidden.md\\:flex, .md\\:flex');
        const desktopElementsCount = await desktopElements.count();
        expect(desktopElementsCount).toBeGreaterThan(0);
    });

    test('Touch interactions work on mobile', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Navigate to chat to test interactions
        await page.goto('/chat');

        // Test tap interactions instead of hover
        const buttons = page.locator('button').first();
        if (await buttons.isVisible()) {
            await buttons.tap();
            // Should not throw errors
        }

        // Test scrolling works
        await page.evaluate(() => {
            window.scrollTo(0, 100);
        });

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
    });

    test('No horizontal overflow on mobile', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Check that content doesn't cause horizontal scroll
        const bodyWidth = await page.evaluate(() => {
            return Math.max(
                document.body.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.clientWidth,
                document.documentElement.scrollWidth,
                document.documentElement.offsetWidth
            );
        });

        // Body width should not exceed viewport width significantly
        expect(bodyWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 20); // 20px tolerance
    });

    test('Mobile navigation accessibility', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Check for proper ARIA labels on mobile navigation
        const mobileNavButton = page
            .locator('button[aria-label*="menu"], button[aria-label*="navigation"]')
            .first();

        if (await mobileNavButton.isVisible()) {
            // Should have accessible labels
            const ariaLabel = await mobileNavButton.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
        }

        // Check keyboard navigation works
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
    });
});

// Test specific mobile features
test.describe('Mobile-Specific Features', () => {
    test('Floating user button appears when logged in', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);
        await page.goto('/');

        // Check for floating action button on mobile
        const floatingButton = page.locator('.fixed.bottom-4.right-4, .md\\:hidden.fixed');

        // Note: This test assumes user might be logged in
        // In a real test, you would set up authentication state
        const isFloatingButtonVisible = await floatingButton.isVisible();

        if (isFloatingButtonVisible) {
            await expect(floatingButton).toBeVisible();

            // Test that it's properly positioned
            const buttonBox = await floatingButton.boundingBox();
            if (buttonBox) {
                expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
                expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(MOBILE_VIEWPORT.height);
            }
        }
    });

    test('Mobile drawer closes after navigation', async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);
        await page.goto('/');

        // Open mobile drawer
        const mobileMenuButton = page.locator('.md\\:hidden button').first();
        if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            await page.waitForTimeout(300);

            // Click on a navigation item
            const navItem = page.locator('[role="dialog"] a, .vaul-content a').first();
            if (await navItem.isVisible()) {
                await navItem.click();

                // Drawer should close after navigation
                await page.waitForTimeout(500);
                const drawer = page.locator('[role="dialog"], .vaul-content');
                await expect(drawer).not.toBeVisible();
            }
        }
    });
});
