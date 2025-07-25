# Playwright Authentication Setup

This document describes the Google OAuth authentication setup for Playwright tests in the VT Chat application, following Playwright best practices.

## Overview

The authentication system allows Playwright tests to authenticate with Google OAuth and maintain session state across tests. This implementation follows Playwright's recommended best practices for maintainable, reliable, and efficient testing.

## ✅ Playwright Best Practices Implemented

This setup follows the [official Playwright best practices](https://playwright.dev/docs/best-practices):

### 🎯 User-Facing Locators

- Uses `page.getByRole()`, `page.getByLabel()`, `page.getByText()` instead of CSS selectors
- Prioritizes semantic HTML elements and ARIA roles
- Avoids brittle CSS class-based selectors

### 🔒 Test Isolation

- Each test runs independently with fresh browser context
- Proper cleanup between tests using `beforeEach` hooks
- Separate projects for authenticated and non-authenticated tests

### 🏗️ Page Object Model

- Organized test code using Page Object Model pattern
- Centralized locators and actions in page classes
- Improved maintainability and reusability

### 🚀 Web-First Assertions

- Uses `await expect().toBeVisible()` instead of manual assertions
- Automatic waiting and retry logic
- Better error reporting and debugging

### 🔧 Debugging & Tracing

- Configured trace collection on test failures
- Screenshot and video capture for debugging
- Proper error handling without console.log pollution

### 📊 Multi-Browser Testing

- Tests run across Chromium, Firefox, and WebKit
- Mobile viewport testing included
- Consistent behavior across platforms

## Components

### 1. Authentication Setup File (`playwright-auth.setup.ts`)

This file contains the main authentication logic:

- **Google OAuth Flow**: Handles the complete OAuth flow including:
    - Navigation to login page
    - Clicking Google OAuth button
    - Entering credentials
    - Handling account selection
    - Managing 2FA prompts
    - Saving authentication state

- **API Fallback**: Alternative authentication method using API calls when OAuth isn't available

- **Robust Error Handling**: Multiple fallback strategies for different OAuth scenarios

### 2. Playwright Configuration (`playwright.config.ts`)

Updated configuration includes:

- **Setup Project**: Runs authentication setup before tests
- **Regular Projects**: Run tests without authentication (chromium, firefox, webkit, etc.)
- **Authenticated Project**: `chromium-authenticated` project that uses saved auth state
- **Test Directory**: Uses `./e2e` for Playwright tests
- **Test Filtering**: Ignores Vitest test files (_.test.ts, _.test.js)

### 3. Test Files

- **`e2e/auth.spec.ts`**: Tests login functionality and OAuth flow
- **`e2e/authenticated.spec.ts`**: Tests that require authenticated state
- **`e2e/setup-verification.spec.ts`**: Verification tests for setup
- **`e2e/page-objects/login-page.ts`**: Page Object Model for login functionality

## Environment Variables

Required environment variables for authentication:

```env
GOOGLE_TEST_EMAIL=your-test-email@gmail.com
GOOGLE_TEST_PASSWORD=your-test-password
PLAYWRIGHT_USE_API_AUTH=true  # Optional: Use API auth instead of OAuth
TEST_USER_EMAIL=test@example.com  # For API auth fallback
TEST_USER_PASSWORD=testpassword   # For API auth fallback
```

## Usage

### Running Tests

```bash
# Run all tests (without authentication)
npx playwright test

# Run only authenticated tests
npx playwright test --project=chromium-authenticated

# Run authentication setup
npx playwright test --project=setup

# Run specific test file
npx playwright test auth.spec.ts
```

### Project Structure

```
apps/web/
├── playwright.config.ts          # Main configuration
├── e2e/                          # E2E test files
│   ├── auth.spec.ts             # Authentication tests
│   ├── authenticated.spec.ts    # Authenticated user tests
│   ├── setup-verification.spec.ts # Setup verification tests
│   ├── playwright-auth.setup.ts  # Authentication setup
│   └── page-objects/            # Page Object Models
│       └── login-page.ts        # Login page POM
├── playwright/                   # Playwright data
│   └── .auth/                   # Authentication state
│       └── user.json           # Saved auth state
├── .env.test                    # Test environment variables
└── docs/
    └── playwright-auth-setup.md # This documentation
```

## Authentication Flow

1. **Setup Phase**:
    - `playwright-auth.setup.ts` runs first
    - Navigates to `/login`
    - Clicks Google OAuth button
    - Handles Google OAuth flow
    - Saves authentication state to `./playwright/.auth/user.json`

2. **Test Phase**:
    - Authenticated tests load saved state
    - Tests run with user session active
    - No need to re-authenticate for each test

## OAuth Flow Details

The OAuth flow handles multiple scenarios:

1. **Fresh Login**: Enter email and password
2. **Account Selection**: Choose from existing accounts
3. **2FA Detection**: Warns about 2FA requirements
4. **App Permissions**: Handles consent screens
5. **Error Recovery**: Multiple fallback strategies

## Troubleshooting

### Common Issues

1. **No tests found**: Check `testMatch` patterns in config
2. **Auth state not found**: Run setup project first
3. **2FA required**: Use test account without 2FA
4. **OAuth timeout**: Increase timeout or use API auth

### Debug Mode

```bash
# Run with debug info
npx playwright test --debug

# Run in headed mode
npx playwright test --headed

# Generate trace for debugging
npx playwright test --trace on
```

## Best Practices

1. **Use Test Accounts**: Never use production accounts for testing
2. **Disable 2FA**: Test accounts should not have 2FA enabled
3. **Environment Variables**: Keep credentials in environment variables
4. **Error Handling**: Always handle OAuth errors gracefully
5. **State Management**: Save and reuse authentication state

## Security Considerations

1. **Credential Security**: Never commit credentials to version control
2. **Test Isolation**: Each test should be independent
3. **Environment Separation**: Use different accounts for different environments
4. **Session Management**: Clear sessions after test suites

## Future Enhancements

1. **Multiple Auth Providers**: Support for GitHub, Twitter, etc.
2. **Role-Based Testing**: Different user roles and permissions
3. **Session Persistence**: Longer-lived sessions for development
4. **CI/CD Integration**: Automated authentication in pipelines
