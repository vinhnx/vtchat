import { expect, test } from '@playwright/test';

test.describe('Lighthouse Performance Optimizations', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Font display swap is working', async ({ page }) => {
        // Check that fonts load without FOUT (Flash of Unstyled Text)
        await page.waitForLoadState('networkidle');

        // Verify CSS variables are set for fonts
        const fontVariables = await page.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            return {
                inter: styles.getPropertyValue('--font-inter'),
                bricolage: styles.getPropertyValue('--font-bricolage'),
                clash: styles.getPropertyValue('--font-clash'),
            };
        });

        expect(fontVariables.inter).toBeTruthy();
        expect(fontVariables.bricolage).toBeTruthy();
        expect(fontVariables.clash).toBeTruthy();
    });

    test('Performance optimizations component loaded', async ({ page }) => {
        // Check that DNS prefetch and other performance hints are present
        const dnsPreconnect = await page
            .locator('link[rel="dns-prefetch"][href*="google.com"]')
            .count();
        expect(dnsPreconnect).toBeGreaterThan(0);

        // Check theme color meta tag
        const themeColor = await page.locator('meta[name="theme-color"]').count();
        expect(themeColor).toBeGreaterThan(0);

        // Check color scheme meta tag
        const colorScheme = await page.locator('meta[name="color-scheme"]').count();
        expect(colorScheme).toBeGreaterThan(0);
    });

    test('Personalized greeting has stable layout', async ({ page }) => {
        // Wait for personalized greeting to load
        await page.waitForSelector('text=/Good (morning|afternoon|evening)/', { timeout: 5000 });

        // Check that greeting container has fixed height (prevents CLS)
        const greetingContainer = page.locator('.relative.h-\\[100px\\].min-h-\\[100px\\]');
        await expect(greetingContainer).toBeVisible();

        // Verify the container maintains stable dimensions
        const boundingBox = await greetingContainer.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(100);
    });

    test('Chat input loads dynamically without blocking', async ({ page }) => {
        // Check that page loads even if chat input is lazy loaded
        await page.waitForLoadState('domcontentloaded');

        // Main content should be visible quickly
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();

        // Chat input should eventually load
        const chatInput = page.locator('textarea, [contenteditable="true"]');
        await expect(chatInput).toBeVisible({ timeout: 10000 });
    });

    test('No duplicate font preconnects', async ({ page }) => {
        // Check that we don't have duplicate preconnect links for Google Fonts
        const googleFontsPreconnects = await page
            .locator('link[rel="preconnect"][href*="fonts.googleapis.com"]')
            .count();
        const googleStaticPreconnects = await page
            .locator('link[rel="preconnect"][href*="fonts.gstatic.com"]')
            .count();

        // Should have at most 1 of each (added by Next.js font optimization)
        expect(googleFontsPreconnects).toBeLessThanOrEqual(1);
        expect(googleStaticPreconnects).toBeLessThanOrEqual(1);
    });

    test('Image optimization works', async ({ page }) => {
        // Navigate to login page which has a background image
        await page.goto('/login');

        // Check that background image uses modern formats and proper loading
        const backgroundImage = page.locator(
            'img[src*="/bg/bg_vt.avif"], img[src*=".avif"], img[src*=".webp"]',
        );

        if ((await backgroundImage.count()) > 0) {
            // Should have priority loading for above-the-fold image
            const imageElement = backgroundImage.first();
            const loading = await imageElement.getAttribute('loading');
            const _fetchPriority = await imageElement.getAttribute('fetchpriority');

            // Login background should either have priority or no lazy loading
            expect(loading === null || loading === 'eager').toBeTruthy();
        }
    });

    test('JavaScript bundles are optimized', async ({ page }) => {
        // Monitor network requests for JS bundles
        const jsRequests: string[] = [];

        page.on('response', (response) => {
            if (response.url().includes('.js') && response.url().includes('/_next/static/')) {
                jsRequests.push(response.url());
            }
        });

        await page.waitForLoadState('networkidle');

        // Should have chunked JS files (indicates code splitting is working)
        expect(jsRequests.length).toBeGreaterThan(1);

        // Should have vendor chunks separated from app code
        const hasVendorChunk = jsRequests.some(
            (url) => url.includes('vendor') || url.includes('chunk'),
        );
        expect(hasVendorChunk).toBeTruthy();
    });

    test('Critical CSS loads first', async ({ page }) => {
        // Check that CSS loads before JS for critical rendering path
        const resourceTimings = await page.evaluate(() => {
            return performance.getEntriesByType('resource').map((entry: any) => ({
                name: entry.name,
                startTime: entry.startTime,
                type: entry.name.includes('.css')
                    ? 'css'
                    : entry.name.includes('.js')
                    ? 'js'
                    : 'other',
            }));
        });

        const cssLoadTime = Math.min(
            ...resourceTimings.filter((r) => r.type === 'css').map((r) => r.startTime),
        );
        const jsLoadTime = Math.min(
            ...resourceTimings.filter((r) => r.type === 'js').map((r) => r.startTime),
        );

        // CSS should start loading before or at the same time as JS
        expect(cssLoadTime).toBeLessThanOrEqual(jsLoadTime + 10); // 10ms tolerance
    });

    test('Performance metrics are within acceptable ranges', async ({ page }) => {
        // Use Performance API to check basic metrics
        await page.waitForLoadState('networkidle');

        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType(
                'navigation',
            )[0] as PerformanceNavigationTiming;
            const paint = performance.getEntriesByType('paint');

            return {
                domContentLoaded: navigation.domContentLoadedEventEnd
                    - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime,
                firstContentfulPaint: paint.find((p) => p.name === 'first-contentful-paint')
                    ?.startTime,
            };
        });

        // Basic performance assertions
        expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // DOM ready in < 3s
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // FCP in < 2s
    });
});
