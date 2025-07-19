/**
 * Admin Logs Page Test
 *
 * This test verifies the admin logs page functionality
 * specifically checking for the React.Children.only and
 * Turbopack errors we've been debugging.
 */

import { chromium } from 'playwright';

async function testAdminLogsPage() {
    console.log('🧪 Testing Admin Logs Page...');

    const browser = await chromium.launch({
        headless: false,
        devtools: true, // Open dev tools to see console errors
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log('❌ Console Error:', msg.text());
        }
    });

    // Listen for page errors
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('❌ Page Error:', error.message);
    });

    try {
        // Navigate to home first
        await page.goto('http://localhost:3000');
        console.log('📍 Navigated to home page');

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Try direct navigation to admin logs
        await page.goto('http://localhost:3000/admin/logs');
        console.log('📍 Navigated to admin/logs');

        // Wait to see if errors occur
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: 'admin-logs-test.png' });
        console.log('📸 Screenshot saved: admin-logs-test.png');

        // Check if we see the admin access required message or actual content
        const hasAdminAccess = await page
            .locator('[data-testid="admin-logs-content"]')
            .isVisible()
            .catch(() => false);
        const needsAuth = await page
            .locator('text=Admin Access Required')
            .isVisible()
            .catch(() => false);

        if (needsAuth) {
            console.log('🔐 Admin authentication required - expected behavior');
            console.log('ℹ️  To test the admin logs page:');
            console.log('   1. Set up admin user in environment variables');
            console.log('   2. Login with admin credentials');
            console.log('   3. Run this test again');
        } else if (hasAdminAccess) {
            console.log('✅ Admin logs page loaded successfully!');
        } else {
            console.log('⚠️  Unknown page state');
        }

        // Report on errors
        if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected!');
        } else {
            console.log(`❌ Found ${errors.length} JavaScript errors:`);
            errors.forEach((error, i) => {
                console.log(`   ${i + 1}. ${error}`);
            });
        }
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminLogsPage().catch(console.error);
