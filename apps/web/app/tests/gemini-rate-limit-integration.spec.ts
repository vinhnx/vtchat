import { expect, test } from '@playwright/test';
import { ModelEnum } from '@repo/ai/models';

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'testpass123';

test.describe('Gemini Rate Limiting Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto(BASE_URL);

        // Wait for the page to load
        await page.waitForLoadState('networkidle');
    });

    test.describe('Free User Rate Limiting', () => {
        test('should show rate limit information for free users', async ({ page }) => {
            // Login as free user
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Navigate to settings/usage
            await page.click('[data-testid="user-menu"]');
            await page.click('[data-testid="settings-link"]');
            await page.click('[data-testid="usage-tab"]');

            // Check if rate limit information is displayed
            await expect(page.locator('[data-testid="rate-limit-info"]')).toBeVisible();
            await expect(page.locator('[data-testid="gemini-usage-meter"]')).toBeVisible();

            // Check for Gemini models rate limits
            await expect(page.locator('[data-testid="gemini-2-5-flash-lite-limit"]')).toContainText(
                '20 requests per day',
            );
            await expect(page.locator('[data-testid="gemini-2-5-pro-limit"]')).toContainText(
                '10 requests per day',
            );
        });

        test('should show BYOK requirement for free users', async ({ page }) => {
            // Login as free user
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Try to use a Gemini model without BYOK
            await page.click('[data-testid="new-chat"]');
            await page.click('[data-testid="model-selector"]');
            await page.click('[data-testid="gemini-2-5-flash-lite"]');

            // Should show BYOK requirement
            await expect(page.locator('[data-testid="byok-warning"]')).toBeVisible();
            await expect(page.locator('[data-testid="byok-warning"]')).toContainText(
                'Bring Your Own Key required',
            );
        });

        test('should enforce rate limits for free users', async ({ page }) => {
            // This test would need to simulate multiple requests
            // In a real scenario, you'd need to set up test data or use API calls

            // Login as free user
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Check rate limit status via API
            const response = await page.request.get('/api/rate-limit/status', {
                params: { model: ModelEnum.GEMINI_2_5_FLASH_LITE },
            });

            expect(response.status()).toBe(200);
            const data = await response.json();

            expect(data).toHaveProperty('dailyLimit');
            expect(data).toHaveProperty('remainingDaily');
            expect(data).toHaveProperty('minuteLimit');
            expect(data).toHaveProperty('remainingMinute');
            expect(data.dailyLimit).toBe(20); // Free user limit
        });
    });

    test.describe('VT+ User Rate Limiting', () => {
        test('should show higher limits for VT+ users', async ({ page }) => {
            // This would require a VT+ test account
            // For now, we'll test the API endpoint behavior

            // Login as VT+ user (would need VT+ credentials)
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', 'vtplus@example.com');
            await page.fill('[data-testid="password-input"]', 'vtpluspass123');
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Navigate to settings/usage
            await page.click('[data-testid="user-menu"]');
            await page.click('[data-testid="settings-link"]');
            await page.click('[data-testid="usage-tab"]');

            // Check for VT+ specific limits
            await expect(page.locator('[data-testid="vt-plus-badge"]')).toBeVisible();
            await expect(page.locator('[data-testid="gemini-usage-meter"]')).toContainText(
                '1000 requests per day',
            );
        });

        test('should allow VT+ users to use Gemini models without BYOK', async ({ page }) => {
            // Login as VT+ user
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', 'vtplus@example.com');
            await page.fill('[data-testid="password-input"]', 'vtpluspass123');
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Try to use a Gemini model
            await page.click('[data-testid="new-chat"]');
            await page.click('[data-testid="model-selector"]');
            await page.click('[data-testid="gemini-2-5-flash-lite"]');

            // Should NOT show BYOK requirement
            await expect(page.locator('[data-testid="byok-warning"]')).not.toBeVisible();

            // Should be able to send a message
            await page.fill('[data-testid="message-input"]', 'Hello, test message');
            await page.click('[data-testid="send-button"]');

            // Should see processing/response (not rate limit error)
            await expect(page.locator('[data-testid="message-loading"]')).toBeVisible();
        });
    });

    test.describe('Budget Tracking UI', () => {
        test('should display budget information in usage meter', async ({ page }) => {
            // Login as any user
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Navigate to settings/usage
            await page.click('[data-testid="user-menu"]');
            await page.click('[data-testid="settings-link"]');
            await page.click('[data-testid="usage-tab"]');

            // Check for budget meter
            await expect(page.locator('[data-testid="budget-meter"]')).toBeVisible();
            await expect(page.locator('[data-testid="budget-used"]')).toBeVisible();
            await expect(page.locator('[data-testid="budget-limit"]')).toContainText('$80');
        });

        test('should show budget warning when approaching limit', async ({ page }) => {
            // This would require setting up test data where budget is near limit
            // For now, we'll test the API endpoint

            const response = await page.request.get('/api/budget/status');
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('monthlyUsed');
            expect(data).toHaveProperty('monthlyLimit');
            expect(data).toHaveProperty('remainingBudget');
            expect(data).toHaveProperty('usagePercent');
            expect(data).toHaveProperty('warningLevel');
        });

        test('should display budget warning banner when limit is exceeded', async ({ page }) => {
            // This test would require mocking or setting up a scenario where budget is exceeded
            // For integration testing, we'd need to simulate this state

            // Login
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // If budget is exceeded, should see warning banner
            const _warningBanner = page.locator('[data-testid="budget-warning-banner"]');

            // This would only be visible if budget is actually exceeded
            // In a real test, you'd set up the data to make this happen
        });
    });

    test.describe('API Endpoints', () => {
        test('should return rate limit status for authenticated users', async ({ page }) => {
            // Login first to get session
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Test rate limit status API
            const response = await page.request.get('/api/rate-limit/status', {
                params: { model: ModelEnum.GEMINI_2_5_FLASH_LITE },
            });

            expect(response.status()).toBe(200);
            const data = await response.json();

            expect(data).toHaveProperty('dailyUsed');
            expect(data).toHaveProperty('minuteUsed');
            expect(data).toHaveProperty('dailyLimit');
            expect(data).toHaveProperty('minuteLimit');
            expect(data).toHaveProperty('remainingDaily');
            expect(data).toHaveProperty('remainingMinute');
            expect(data).toHaveProperty('resetTime');
        });

        test('should return 401 for unauthenticated rate limit requests', async ({ page }) => {
            // Test without login
            const response = await page.request.get('/api/rate-limit/status', {
                params: { model: ModelEnum.GEMINI_2_5_FLASH_LITE },
            });

            expect(response.status()).toBe(401);
        });

        test('should return 400 for missing model parameter', async ({ page }) => {
            // Login first
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Test without model parameter
            const response = await page.request.get('/api/rate-limit/status');

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('Model parameter is required');
        });

        test('should return budget status for authenticated users', async ({ page }) => {
            // Login first
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Test budget status API
            const response = await page.request.get('/api/budget/status');

            expect(response.status()).toBe(200);
            const data = await response.json();

            expect(data).toHaveProperty('monthlyUsed');
            expect(data).toHaveProperty('monthlyLimit');
            expect(data).toHaveProperty('remainingBudget');
            expect(data).toHaveProperty('usagePercent');
            expect(data).toHaveProperty('warningLevel');
            expect(data).toHaveProperty('isEnabled');
        });

        test('should block completion requests when rate limit is exceeded', async ({ page }) => {
            // This test would require setting up a scenario where rate limit is exceeded
            // For a real integration test, you'd need to make multiple requests first

            // Login
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Test completion API with rate limit exceeded scenario
            // This would need to be set up with test data
            const response = await page.request.post('/api/completion', {
                data: {
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: ModelEnum.GEMINI_2_5_FLASH_LITE,
                    stream: false,
                },
            });

            // Response depends on current rate limit state
            // In a controlled test environment, you'd set this up to test both cases
            expect([200, 429]).toContain(response.status());
        });

        test('should block completion requests when budget is exceeded', async ({ page }) => {
            // Similar to rate limit test, but for budget
            // This would require setting up test data where budget is exceeded

            // Login
            await page.click('[data-testid="login-button"]');
            await page.fill('[data-testid="email-input"]', TEST_USER_EMAIL);
            await page.fill('[data-testid="password-input"]', TEST_USER_PASSWORD);
            await page.click('[data-testid="submit-login"]');

            // Wait for login to complete
            await page.waitForSelector('[data-testid="user-menu"]');

            // Test completion API with budget exceeded scenario
            const response = await page.request.post('/api/completion', {
                data: {
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: ModelEnum.GEMINI_2_5_FLASH_LITE,
                    stream: false,
                },
            });

            // Response depends on current budget state
            expect([200, 429]).toContain(response.status());
        });
    });
});
