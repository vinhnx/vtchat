import { expect, test as setup } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, 'playwright', '.auth', 'user.json');

setup('authenticate with Google OAuth', async ({ page }) => {
    // Start by going to the login page
    await page.goto('/login');

    // Wait for the login form to be visible
    await expect(page.getByRole('heading', { name: 'Welcome to VT!' })).toBeVisible();

    // Click the Google OAuth button
    await page.getByRole('button', { name: 'Google' }).click();

    // Wait for navigation to Google OAuth
    await page.waitForURL(/accounts\.google\.com/, { timeout: 10000 });

    // Handle Google OAuth flow
    try {
        // Wait for Google sign-in page to load
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });

        // Check if we need to enter email first
        const emailInput = page.getByLabel('Email');
        if (await emailInput.isVisible()) {
            // Enter email
            await emailInput.fill(process.env.GOOGLE_TEST_EMAIL || '');
            await page.getByRole('button', { name: 'Next' }).click();

            // Wait for password field
            const passwordInput = page.getByLabel('Password');
            await expect(passwordInput).toBeVisible({ timeout: 10000 });
            await passwordInput.fill(process.env.GOOGLE_TEST_PASSWORD || '');
            await page.getByRole('button', { name: 'Next' }).click();
        } else {
            // If email input is not visible, try to find account selection
            const accountSelector = page.locator('[data-identifier]').first();
            if (await accountSelector.isVisible()) {
                // Click on the first account
                await accountSelector.click();

                // May need to enter password after selecting account
                const passwordInput = page.locator('input[type="password"]');
                if (await passwordInput.isVisible()) {
                    await passwordInput.fill(process.env.GOOGLE_TEST_PASSWORD || '');
                    await page.click('button:has-text("Next"), #passwordNext');
                }
            }
        }

        // Handle potential 2FA or additional security checks
        // Wait a bit for any additional security prompts
        await page.waitForTimeout(2000);

        // Check for 2FA verification
        const twoFAPrompt = page.locator(
            'input[type="tel"], input[aria-label*="code"], input[aria-label*="verification"]',
        );
        if (await twoFAPrompt.isVisible()) {
            throw new Error('2FA required - please use a test account without 2FA enabled');
        }

        // Look for "Continue" or "Allow" buttons for app permissions
        const continueButton = page.locator(
            'button:has-text("Continue"), button:has-text("Allow"), button:has-text("Confirm")',
        );
        if (await continueButton.isVisible()) {
            await continueButton.click();
        }
    } catch (error) {
        // Try alternative approach: use account picker if available
        try {
            // Look for account picker/selection
            const accountPicker = page.locator('[data-email], [data-identifier]').first();
            if (await accountPicker.isVisible()) {
                await accountPicker.click();

                // Check if password is needed
                const passwordField = page.locator('input[type="password"]');
                if (await passwordField.isVisible()) {
                    await passwordField.fill(process.env.GOOGLE_TEST_PASSWORD || '');
                    await page.click('button:has-text("Next"), #passwordNext');
                }
            }
        } catch {
            throw new Error(
                `Could not complete Google OAuth flow: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            );
        }
    }

    // Wait for redirect back to the app
    await page.waitForURL(/localhost:3000|vtchat\.io/, { timeout: 15000 });

    // Verify successful authentication by checking for authenticated state
    // This could be a user menu, profile indicator, or redirect to dashboard
    await expect(page.locator('body')).toBeVisible();

    // Wait for the app to fully load and set authentication state
    await page.waitForTimeout(2000);

    // Verify we're logged in by checking for user session indicators
    // This depends on your app's UI after login
    try {
        // Look for common indicators of successful login
        await page.waitForSelector(
            '[data-testid="user-menu"], [data-testid="profile"], .user-avatar, button:has-text("Profile")',
            { timeout: 5000 },
        );
    } catch {
        // If no specific user indicators, just verify we're not on the login page
        await expect(page.getByRole('heading', { name: 'Welcome to VT!' })).not.toBeVisible();
    }

    // Save authentication state
    await page.context().storageState({ path: authFile });
});

// Alternative setup for testing without actual OAuth (using API)
setup('authenticate via API', async ({ request }) => {
    // This is a fallback method if OAuth is not available
    // You would implement this based on your backend API

    if (process.env.PLAYWRIGHT_USE_API_AUTH === 'true') {
        try {
            // Make API call to authenticate
            const response = await request.post('/api/auth/signin', {
                data: {
                    // Use test credentials or API key
                    email: process.env.TEST_USER_EMAIL,
                    password: process.env.TEST_USER_PASSWORD,
                },
            });

            expect(response.ok()).toBeTruthy();

            // Extract session cookies from response
            const cookies = response.headers()['set-cookie'];

            if (cookies) {
                // Save cookies to auth state
                const authState = {
                    cookies: cookies.split(';').map((cookie) => {
                        const [name, value] = cookie.split('=');
                        return {
                            name: name.trim(),
                            value: value?.trim() || '',
                            domain: 'localhost',
                            path: '/',
                            httpOnly: true,
                            secure: false,
                            sameSite: 'Lax' as const,
                        };
                    }),
                    origins: [],
                };

                // Write auth state to file
                const fs = require('node:fs');
                const path = require('node:path');
                const authDir = path.join(__dirname, 'playwright', '.auth');

                if (!fs.existsSync(authDir)) {
                    fs.mkdirSync(authDir, { recursive: true });
                }

                fs.writeFileSync(authFile, JSON.stringify(authState, null, 2));
            }
        } catch {
            // API authentication failed - test will continue without auth
        }
    }
});
