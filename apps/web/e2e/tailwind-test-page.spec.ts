import { expect, test } from "@playwright/test";

test.describe("Tailwind v4 Test Page", () => {
    test("should show actual utility styles", async ({ page }) => {
        await page.goto("/tailwind-test");
        
        // Test deprecated utilities
        const shadowSm = page.locator('div:has-text("Test shadow-sm and rounded-sm")');
        const shadowSmStyles = await shadowSm.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                borderRadius: computed.borderRadius,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        const shadow = page.locator('div:has-text("Test shadow and rounded")');
        const shadowStyles = await shadow.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                borderRadius: computed.borderRadius,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        const ring = page.locator('div:has-text("Test ring utility")');
        const ringStyles = await ring.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        // Test new v4 utilities
        const shadowXs = page.locator('div:has-text("Test shadow-xs and rounded-xs")');
        const shadowXsStyles = await shadowXs.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                borderRadius: computed.borderRadius,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        const ring3 = page.locator('div:has-text("Test ring-3")');
        const ring3Styles = await ring3.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        const outlineNone = page.locator('button:has-text("Test outline-none")');
        const outlineNoneStyles = await outlineNone.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                outline: computed.outline,
                outlineStyle: computed.outlineStyle,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        const outlineHidden = page.locator('button:has-text("Test outline-hidden")');
        const outlineHiddenStyles = await outlineHidden.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                outline: computed.outline,
                outlineStyle: computed.outlineStyle,
                backgroundColor: computed.backgroundColor,
                className: el.className
            };
        });
        
        console.log("=== TAILWIND V4 TEST PAGE RESULTS ===");
        console.log("Deprecated utilities:");
        console.log("  shadow-sm + rounded-sm:", shadowSmStyles);
        console.log("  shadow + rounded:", shadowStyles);
        console.log("  ring:", ringStyles);
        console.log("New v4 utilities:");
        console.log("  shadow-xs + rounded-xs:", shadowXsStyles);
        console.log("  ring-3:", ring3Styles);
        console.log("Outline utilities:");
        console.log("  outline-none:", outlineNoneStyles);
        console.log("  outline-hidden:", outlineHiddenStyles);
        
        // Basic checks - at least colors should work
        expect(shadowSmStyles.backgroundColor).toContain("rgb(59, 130, 246)"); // bg-blue-500
        expect(shadowStyles.backgroundColor).toContain("rgb(239, 68, 68)"); // bg-red-500
        expect(ringStyles.backgroundColor).toContain("rgb(34, 197, 94)"); // bg-green-500
        expect(shadowXsStyles.backgroundColor).toContain("rgb(168, 85, 247)"); // bg-purple-500
        expect(ring3Styles.backgroundColor).toContain("rgb(234, 179, 8)"); // bg-yellow-500
    });
});
