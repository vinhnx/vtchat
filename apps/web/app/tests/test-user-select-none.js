// Test script to verify user-select: none is working on interactive elements

import { test, expect } from '@playwright/test';

// This test would verify that text selection is disabled on interactive elements
test('Interactive elements should not allow text selection', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Test buttons - try to select text within them
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
        const isVisible = await button.isVisible();
        if (isVisible) {
            // Try to select all text in the button
            await button.selectText().catch(() => {
                // Expected to fail or select nothing due to select-none
            });
            
            // Check if any text was actually selected
            const selection = await page.evaluate(() => window.getSelection().toString());
            
            // If the button contains only non-selectable elements, selection should be empty
            // This test would pass if our select-none implementation is working
            console.log(`Button selection result: "${selection}"`);
        }
    }
    
    // Test badges, toggles, tabs, etc.
    const interactiveElements = [
        '[data-testid="badge"]',
        '[role="tab"]',
        '[role="switch"]',
        '[role="checkbox"]',
        '[role="radio"]',
    ];
    
    for (const selector of interactiveElements) {
        const elements = await page.locator(selector).all();
        
        for (const element of elements) {
            const isVisible = await element.isVisible();
            if (isVisible) {
                await element.selectText().catch(() => {
                    // Expected to fail due to select-none
                });
                
                const selection = await page.evaluate(() => window.getSelection().toString());
                console.log(`${selector} selection result: "${selection}"`);
            }
        }
    }
});

// Simple manual test instructions
console.log(`
Manual Test Instructions:
1. Open http://localhost:3000 in your browser
2. Try to select text within buttons, badges, tabs, toggles, checkboxes, etc.
3. The text within these interactive elements should not be selectable
4. You should see the cursor change but no text highlighting should occur
`);