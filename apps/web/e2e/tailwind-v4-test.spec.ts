import { expect, test } from '@playwright/test';

test.describe('Tailwind v4 Verification', () => {
    test('should load CSS and apply Tailwind classes', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Check that the page loads (even if there are errors, CSS should still load)
        await expect(page.locator('body')).toBeVisible();

        // Check that CSS is loaded by looking for computed styles
        const body = page.locator('body');

        // Get computed styles to verify Tailwind CSS is working
        const backgroundColor = await body.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });

        // The background should not be the default (transparent/rgba(0,0,0,0))
        // Tailwind should apply some background color from our CSS variables
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(backgroundColor).not.toBe('transparent');

        console.log('Body background color:', backgroundColor);
    });

    test('should have CSS custom properties defined', async ({ page }) => {
        await page.goto('/');

        // Check that CSS custom properties are defined
        const customProperties = await page.evaluate(() => {
            const rootStyles = window.getComputedStyle(document.documentElement);
            return {
                background: rootStyles.getPropertyValue('--background').trim(),
                foreground: rootStyles.getPropertyValue('--foreground').trim(),
                primary: rootStyles.getPropertyValue('--primary').trim(),
                border: rootStyles.getPropertyValue('--border').trim(),
            };
        });

        // These should be defined in our CSS
        expect(customProperties.background).toBeTruthy();
        expect(customProperties.foreground).toBeTruthy();
        expect(customProperties.primary).toBeTruthy();
        expect(customProperties.border).toBeTruthy();

        console.log('CSS Custom Properties:', customProperties);
    });

    test('should apply Tailwind utility classes', async ({ page }) => {
        await page.goto('/');

        // Inject a test element with Tailwind classes
        await page.evaluate(() => {
            const testDiv = document.createElement('div');
            testDiv.id = 'tailwind-test';
            testDiv.className = 'bg-primary text-foreground p-4 rounded-lg shadow-md';
            testDiv.textContent = 'Tailwind v4 Test Element';
            document.body.appendChild(testDiv);
        });

        const testElement = page.locator('#tailwind-test');
        await expect(testElement).toBeVisible();

        // Check computed styles
        const styles = await testElement.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                padding: computed.padding,
                borderRadius: computed.borderRadius,
                boxShadow: computed.boxShadow,
                backgroundColor: computed.backgroundColor,
                color: computed.color,
            };
        });

        // Verify that Tailwind classes are applied
        expect(styles.padding).not.toBe('0px');
        expect(styles.borderRadius).not.toBe('0px');
        expect(styles.boxShadow).not.toBe('none');

        console.log('Applied Tailwind styles:', styles);
    });
});
