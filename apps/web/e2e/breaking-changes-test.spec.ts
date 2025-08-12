import { expect, test } from '@playwright/test';

test.describe('Tailwind v4 Breaking Changes Detection', () => {
    test('should identify deprecated utilities in use', async ({ page }) => {
        await page.goto('/');

        // Inject test elements with deprecated utilities
        await page.evaluate(() => {
            const container = document.createElement('div');
            container.id = 'breaking-changes-test';

            // Test deprecated shadow utilities
            const shadowSmElement = document.createElement('div');
            shadowSmElement.className = 'shadow-sm p-4 bg-white';
            shadowSmElement.textContent = 'shadow-sm (should be shadow-xs)';
            container.appendChild(shadowSmElement);

            const shadowElement = document.createElement('div');
            shadowElement.className = 'shadow p-4 bg-white';
            shadowElement.textContent = 'shadow (should be shadow-sm)';
            container.appendChild(shadowElement);

            // Test deprecated rounded utilities
            const roundedSmElement = document.createElement('div');
            roundedSmElement.className = 'rounded-sm p-4 bg-blue-100';
            roundedSmElement.textContent = 'rounded-sm (should be rounded-xs)';
            container.appendChild(roundedSmElement);

            const roundedElement = document.createElement('div');
            roundedElement.className = 'rounded p-4 bg-green-100';
            roundedElement.textContent = 'rounded (should be rounded-sm)';
            container.appendChild(roundedElement);

            // Test deprecated outline-none
            const outlineElement = document.createElement('button');
            outlineElement.className = 'outline-none p-2 bg-red-100';
            outlineElement.textContent = 'outline-none (should be outline-hidden)';
            container.appendChild(outlineElement);

            // Test deprecated ring utility
            const ringElement = document.createElement('div');
            ringElement.className = 'ring p-4 bg-yellow-100';
            ringElement.textContent = 'ring (should be ring-3)';
            container.appendChild(ringElement);

            // Test border without explicit color (should now be currentColor)
            const borderElement = document.createElement('div');
            borderElement.className = 'border p-4 bg-purple-100';
            borderElement.textContent = 'border (now uses currentColor)';
            container.appendChild(borderElement);

            document.body.appendChild(container);
        });

        // Test shadow utilities
        const shadowSm = page.locator('div:has-text("shadow-sm")').first();
        const shadowSmStyles = await shadowSm.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                className: el.className,
            };
        });

        const shadow = page.locator('div:has-text("shadow (should")').first();
        const shadowStyles = await shadow.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                className: el.className,
            };
        });

        // Test rounded utilities
        const roundedSm = page.locator('div:has-text("rounded-sm")').first();
        const roundedSmStyles = await roundedSm.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                borderRadius: computed.borderRadius,
                className: el.className,
            };
        });

        const rounded = page.locator('div:has-text("rounded (should")').first();
        const roundedStyles = await rounded.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                borderRadius: computed.borderRadius,
                className: el.className,
            };
        });

        // Test outline utility
        const outline = page.locator('button:has-text("outline-none")').first();
        const outlineStyles = await outline.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                outline: computed.outline,
                outlineStyle: computed.outlineStyle,
                className: el.className,
            };
        });

        // Test ring utility
        const ring = page.locator('div:has-text("ring (should")').first();
        const ringStyles = await ring.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                boxShadow: computed.boxShadow,
                className: el.className,
            };
        });

        // Test border utility
        const border = page.locator('div:has-text("border (now")').first();
        const borderStyles = await border.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                borderColor: computed.borderColor,
                borderWidth: computed.borderWidth,
                className: el.className,
            };
        });

        // Log all results for analysis
        console.log('=== BREAKING CHANGES ANALYSIS ===');
        console.log('Shadow utilities:');
        console.log('  shadow-sm:', shadowSmStyles);
        console.log('  shadow:', shadowStyles);
        console.log('Rounded utilities:');
        console.log('  rounded-sm:', roundedSmStyles);
        console.log('  rounded:', roundedStyles);
        console.log('Outline utility:');
        console.log('  outline-none:', outlineStyles);
        console.log('Ring utility:');
        console.log('  ring:', ringStyles);
        console.log('Border utility:');
        console.log('  border:', borderStyles);

        // Verify utilities are being applied (even if deprecated)
        expect(shadowSmStyles.boxShadow).not.toBe('none');
        expect(shadowStyles.boxShadow).not.toBe('none');
        expect(roundedSmStyles.borderRadius).not.toBe('0px');
        expect(roundedStyles.borderRadius).not.toBe('0px');
        expect(borderStyles.borderWidth).not.toBe('0px');

        // Check if ring utility is working (might be different in v4)
        console.log('Ring box-shadow:', ringStyles.boxShadow);

        // Check if border uses currentColor (v4 behavior)
        console.log('Border color (should be currentColor in v4):', borderStyles.borderColor);
    });

    test('should test CSS custom properties accessibility', async ({ page }) => {
        await page.goto('/');

        const cssVariables = await page.evaluate(() => {
            const root = document.documentElement;
            const computedStyle = window.getComputedStyle(root);

            // Test key CSS custom properties
            const variables = {
                // Colors
                '--color-primary': computedStyle.getPropertyValue('--color-primary'),
                '--color-background': computedStyle.getPropertyValue('--color-background'),
                '--color-foreground': computedStyle.getPropertyValue('--color-foreground'),
                '--color-border': computedStyle.getPropertyValue('--color-border'),
                '--color-ring': computedStyle.getPropertyValue('--color-ring'),

                // Spacing
                '--spacing-18': computedStyle.getPropertyValue('--spacing-18'),

                // Border radius
                '--radius-sm': computedStyle.getPropertyValue('--radius-sm'),
                '--radius-md': computedStyle.getPropertyValue('--radius-md'),

                // Fonts
                '--font-family-sans': computedStyle.getPropertyValue('--font-family-sans'),

                // Shadows
                '--shadow-premium': computedStyle.getPropertyValue('--shadow-premium'),
            };

            return variables;
        });

        console.log('=== CSS CUSTOM PROPERTIES ===');
        console.log(cssVariables);

        // Verify key variables are defined
        expect(cssVariables['--color-primary']).toBeTruthy();
        expect(cssVariables['--color-background']).toBeTruthy();
        expect(cssVariables['--color-foreground']).toBeTruthy();
        expect(cssVariables['--font-family-sans']).toBeTruthy();
    });

    test('should test space-between utilities', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            const container = document.createElement('div');
            container.id = 'space-test';
            container.className = 'space-y-4 p-4';

            for (let i = 0; i < 3; i++) {
                const child = document.createElement('div');
                child.className = 'bg-blue-100 p-2';
                child.textContent = `Child ${i + 1}`;
                container.appendChild(child);
            }

            document.body.appendChild(container);
        });

        const container = page.locator('#space-test');
        const children = container.locator('div');

        // Check spacing between children
        const firstChild = children.nth(0);
        const secondChild = children.nth(1);

        const firstChildStyles = await firstChild.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                marginTop: computed.marginTop,
                marginBottom: computed.marginBottom,
            };
        });

        const secondChildStyles = await secondChild.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                marginTop: computed.marginTop,
                marginBottom: computed.marginBottom,
            };
        });

        console.log('=== SPACE-BETWEEN UTILITIES ===');
        console.log('First child margins:', firstChildStyles);
        console.log('Second child margins:', secondChildStyles);

        // In v4, space-y should use margin-bottom on :not(:last-child)
        // So first child should have margin-bottom, second should have margin-bottom too (except last)
        expect(await children.count()).toBe(3);
    });

    test('should test gradient variants behavior', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            const container = document.createElement('div');
            container.id = 'gradient-test';

            // Test gradient with variant
            const gradientElement = document.createElement('div');
            gradientElement.className =
                'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-red-500 p-8 w-64 h-32';
            gradientElement.textContent = 'Hover to test gradient variant';
            container.appendChild(gradientElement);

            document.body.appendChild(container);
        });

        const gradientElement = page.locator('#gradient-test div');

        // Get initial gradient
        const initialStyles = await gradientElement.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                backgroundImage: computed.backgroundImage,
            };
        });

        // Hover and get gradient
        await gradientElement.hover();
        await page.waitForTimeout(100);

        const hoverStyles = await gradientElement.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
                backgroundImage: computed.backgroundImage,
            };
        });

        console.log('=== GRADIENT VARIANTS ===');
        console.log('Initial gradient:', initialStyles.backgroundImage);
        console.log('Hover gradient:', hoverStyles.backgroundImage);

        // Both should have gradients
        expect(initialStyles.backgroundImage).toContain('gradient');
        expect(hoverStyles.backgroundImage).toContain('gradient');
    });
});
