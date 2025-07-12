# Playwright Testing with OAuth Authentication

This directory contains Playwright tests for VT Chat with real OAuth authentication support.

## 🚀 Quick Start

### Method 1: Use Your Real OAuth Session (Recommended)

1. **Extract your session** (one-time setup):
   ```bash
   cd apps/web
   npx tsx e2e/extract-my-cookies.ts
   ```
   This opens a browser where you log in with your real OAuth, then extracts your session.

2. **Run tests with your session**:
   ```bash
   npx playwright test --project=chromium-my-session
   ```

### Method 2: Use Automated OAuth Setup

1. **Set environment variables** in `.env.local`:
   ```bash
   GOOGLE_TEST_EMAIL=your-test-email@gmail.com
   GOOGLE_TEST_PASSWORD=your-test-password
   ```

2. **Run the setup**:
   ```bash
   npx playwright test --project=setup
   ```

3. **Run authenticated tests**:
   ```bash
   npx playwright test --project=chromium-authenticated
   ```

## 📁 Project Structure

```
e2e/
├── playwright/.auth/          # 🔒 Authentication files (gitignored)
│   ├── my-real-session.json   # Your real OAuth session
│   ├── user.json             # Automated setup session
│   └── my-auth-cookies.json  # Extracted cookies
├── playwright-auth.setup.ts  # Automated OAuth setup
├── extract-my-cookies.ts     # Interactive session extraction
├── my-session-test.spec.ts   # Tests for your real session
├── auth.spec.ts             # Basic auth flow tests
└── authenticated.spec.ts    # Tests requiring authentication
```

## 🔧 Available Test Projects

- **`setup`**: Automated OAuth authentication setup
- **`chromium-authenticated`**: Tests using automated setup session
- **`chromium-my-session`**: Tests using your real OAuth session
- **`chromium`**: Basic tests without authentication
- **`firefox`**, **`webkit`**: Cross-browser testing

## 📝 Common Commands

```bash
# Extract your real session (when session expires)
npx tsx e2e/extract-my-cookies.ts

# Run all tests with your session
npx playwright test --project=chromium-my-session

# Run specific test file
npx playwright test --project=chromium-my-session my-session-test.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --project=chromium-my-session --headed

# Generate test report
npx playwright show-report

# Update snapshots
npx playwright test --update-snapshots
```

## 🔒 Security Notes

- **Authentication files are gitignored** - they won't be committed
- **Session tokens are automatically excluded** from version control
- **Refresh your session** when it expires (usually weekly)

## 🎯 Writing New Tests

### For Authenticated Tests:
```typescript
import { test, expect } from '@playwright/test';

test('my authenticated feature', async ({ page }) => {
    await page.goto('/'); // Already logged in!
    
    // Your test code here
    await expect(page.locator('textarea')).toBeVisible();
});
```

### For Public Tests:
```typescript
test('public page test', async ({ page }) => {
    await page.goto('/about');
    // Test public functionality
});
```

## 🔄 Session Management

### When to Update Your Session:
- Session expires (usually after 7 days)
- You change your password
- You want to test with a different account

### How to Update:
```bash
cd apps/web
npx tsx e2e/extract-my-cookies.ts
```

## 🐛 Troubleshooting

### Common Issues:

1. **"storageState file not found"**:
   ```bash
   # Run extraction first
   npx tsx e2e/extract-my-cookies.ts
   ```

2. **Tests timeout on login**:
   - Check if dev server is running (`bun dev`)
   - Verify OAuth credentials in `.env.local`

3. **"strict mode violation" errors**:
   - Use more specific locators
   - Use `.first()` or `.nth(0)` for multiple elements

4. **Session expired**:
   ```bash
   # Extract fresh session
   npx tsx e2e/extract-my-cookies.ts
   ```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs)
- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [VT Chat Authentication System](../lib/auth-server.ts)
