/**
 * Test: Sidebar User Icon Alignment in Collapsed State
 *
 * This test verifies that the user icon is properly centered when the sidebar is collapsed.
 * The fix ensures that the container div has proper centering styles when isSidebarOpen is false.
 */

import { expect, test } from '@playwright/test';

test.describe('Sidebar User Icon Alignment', () => {
    test('user icon should be centered when sidebar is collapsed', async ({ page }) => {
        // Navigate to the application
        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Check if user is logged in by looking for avatar
        const avatar = page.locator('[data-testid="user-avatar"]');

        if (await avatar.isVisible()) {
            // User is logged in - test the collapsed sidebar alignment

            // First, ensure sidebar is expanded
            const expandButton = page.locator('[title="Open Sidebar"]');

            // If sidebar is collapsed, expand it first
            if (await expandButton.isVisible()) {
                await expandButton.click();
                await page.waitForTimeout(500); // Wait for animation
            }

            // Now collapse the sidebar
            const collapseButton = page.locator('[title="Close Sidebar"]');
            if (await collapseButton.isVisible()) {
                await collapseButton.click();
                await page.waitForTimeout(500); // Wait for animation
            }

            // Check that the user section container has proper centering styles
            const userSection = page.locator('[data-testid="sidebar-user-section"]').first();

            if (await userSection.isVisible()) {
                // Verify the container has justify-center class when collapsed
                const containerClasses = await userSection.getAttribute('class');
                expect(containerClasses).toContain('justify-center');

                // Get the user icon trigger element
                const userTrigger = userSection.locator('[data-testid="sidebar-user-trigger"]');
                await expect(userTrigger).toBeVisible();

                // Check that the trigger has proper sizing for collapsed state
                const triggerClasses = await userTrigger.getAttribute('class');
                expect(triggerClasses).toContain('h-8');
                expect(triggerClasses).toContain('w-8');
                expect(triggerClasses).toContain('justify-center');
            }
        }
    });

    test('sidebar should maintain user icon centering across state changes', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Test multiple collapse/expand cycles to ensure alignment is maintained
        for (let i = 0; i < 3; i++) {
            // Toggle sidebar state
            const expandButton = page.locator('[title="Open Sidebar"]');
            const collapseButton = page.locator('[title="Close Sidebar"]');

            if (await expandButton.isVisible()) {
                await expandButton.click();
                await page.waitForTimeout(300);
            }

            if (await collapseButton.isVisible()) {
                await collapseButton.click();
                await page.waitForTimeout(300);

                // Verify centering is maintained
                const userSection = page.locator('[data-testid="sidebar-user-section"]').first();
                if (await userSection.isVisible()) {
                    const containerClasses = await userSection.getAttribute('class');
                    expect(containerClasses).toContain('justify-center');
                }
            }
        }
    });
});
