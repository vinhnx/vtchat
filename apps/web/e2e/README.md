# E2E Tests

## Test Files

### `web-search-auth.spec.ts`
Tests web search authentication behavior and API responses.

**Test Coverage:**
- **API Authentication**: Verifies 401/400 errors when web search is attempted without authentication
- **Chat Mode Validation**: Tests authentication requirements for different chat modes
- **UI State**: Verifies feature toggle buttons are present and functional
- **Error Handling**: Tests malformed requests and validation errors
- **Session Management**: Checks session API responses

**Key Assertions:**
- Web search requires authentication (returns 401 for auth, 400 for validation)
- All chat modes with web search have `isAuthRequired: true`
- Error messages are clear and appropriate
- UI components load correctly

### `my-session-test.spec.ts`
Tests authenticated user functionality with real OAuth sessions.

**Test Coverage:**
- Authentication state verification
- Chat functionality with real sessions
- Session persistence across page refreshes
- Subscription status detection (fixed strict mode violation)

### `vt-plus-web-search.spec.ts`
Tests VT+ subscriber web search functionality and fixes.

**Test Coverage:**
- VT+ web search API functionality (requires active subscription)
- Rate limit status API (fixed 500 errors)
- Web search UI interactions for VT+ users
- Subscription status verification

## Running Tests

```bash
# Run web search auth tests (unauthenticated)
bunx playwright test web-search-auth.spec.ts --project=chromium

# Run authenticated session tests
bunx playwright test my-session-test.spec.ts --project=chromium-my-session

# Run VT+ web search tests (requires active VT+ subscription)
bunx playwright test vt-plus-web-search.spec.ts --project=chromium-my-session

# Run all tests
bunx playwright test

# View test results
bunx playwright show-report
```

## Test Configuration

Tests are configured in `playwright.config.ts` with:
- **Unauthenticated tests**: Run on `chromium` project
- **Authenticated tests**: Run on `chromium-my-session` project with real session state
- **Development server**: Automatically starts with `bun run dev`

## Expected Behavior

The web search authentication tests validate the correct behavior:
1. **Unauthenticated users** cannot use web search (401/400 errors)
2. **Authentication is required** for all web search-enabled chat modes
3. **Error handling** is graceful with clear messages
4. **UI components** load and function properly

This ensures the authentication system works as designed to prevent abuse while providing clear feedback to users.
