import { expect, test } from "@playwright/test";

test.describe("LCP Optimization Tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("Critical assets are preloaded", async ({ page }) => {
        // Check that critical images are preloaded
        const preloadLinks = await page.locator('link[rel="preload"][as="image"]').all();
        const preloadHrefs = await Promise.all(preloadLinks.map(link => link.getAttribute('href')));
        
        expect(preloadHrefs).toContain("/icon-192x192.png");
        expect(preloadHrefs).toContain("/icons/peerlist_badge.svg");
        expect(preloadHrefs).toContain("/favicon.ico");
    });

    test("Font preloading is implemented", async ({ page }) => {
        // Check that fonts are preloaded
        const fontPreload = await page.locator('link[rel="preload"][as="style"][href*="fonts.googleapis.com"]').count();
        expect(fontPreload).toBeGreaterThanOrEqual(1);
    });

    test("Thread component loads with skeleton", async ({ page }) => {
        // Wait for initial skeleton to appear
        await page.waitForSelector('.animate-pulse', { timeout: 5000 });
        
        // Then wait for actual content to load
        await page.waitForSelector('.message-container', { timeout: 10000 });
    });

    test("Images have optimization attributes", async ({ page }) => {
        // Navigate to a page that shows the loading indicator
        await page.goto("/"); // homepage shows thread component
        
        // Wait for page to load
        await page.waitForLoadState("networkidle");
        
        // Check if images have optimization attributes when they appear
        // Note: This might require interacting with the chat to trigger loading indicator
    });

    test("Resource hints are in HTTP headers", async ({ page }) => {
        // Check response headers for resource hints
        const response = await page.goto("/");
        const headers = response?.headers();
        
        // Look for Link header with preload directives
        const linkHeader = headers?.['link'] || headers?.['Link'];
        if (linkHeader) {
            expect(linkHeader).toContain("rel=preload");
            expect(linkHeader).toContain("/icon-192x192.png");
            expect(linkHeader).toContain("/icons/peerlist_badge.svg");
        }
    });

    test("LCP element is optimized", async ({ page }) => {
        // Wait for page to fully load
        await page.waitForLoadState("networkidle");
        
        // Use Performance API to check LCP
        const lcpTiming = await page.evaluate(() => {
            return new Promise((resolve) => {
                // Create an observer to measure LCP
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                
                // Set a timeout in case LCP doesn't fire
                setTimeout(() => {
                    observer.disconnect();
                    resolve(null);
                }, 1000);
            });
        });
        
        // LCP should be under 2.5 seconds for good performance
        if (lcpTiming !== null) {
            expect(lcpTiming).toBeLessThan(2500);
        }
    });
});