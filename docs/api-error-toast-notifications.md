# API Error Toast Notifications

## Overview

This feature adds user-friendly Sonner toast notifications to the thread details page whenever API calls fail. Instead of users only seeing error alerts in the chat interface, they'll now receive immediate toast notifications that categorize different types of failures.

## Implementation

### Location

- **Component**: `packages/common/components/thread/thread-item.tsx`
- **Hook**: Uses `useToast` from `@repo/ui`
- **Trigger**: `useEffect` that monitors `threadItem.error` and `threadItem.status`

### Error Categories

The system automatically categorizes errors and shows appropriate toast titles with emojis:

| Error Type         | Toast Title               | Triggers                                            |
| ------------------ | ------------------------- | --------------------------------------------------- |
| Credit Balance     | 💳 Credit Balance Too Low | "credit balance", "too low"                         |
| Rate Limiting      | ⏱️ Rate Limit Exceeded     | "rate limit", "quota"                               |
| Network Issues     | 🌐 Network Error          | "network", "connection", "networkerror"             |
| Authentication     | 🔑 Authentication Error   | "unauthorized", "invalid api key", "authentication" |
| Billing            | 💸 Billing Issue          | "billing", "payment", "plans & billing"             |
| Service Issues     | 🔧 Service Unavailable    | "503", "service unavailable", "502"                 |
| Cancelled Requests | ⏹️ Request Cancelled       | "aborted", "stopped", "cancelled"                   |
| Generic Errors     | API Call Failed           | Any other error                                     |

### Features

1. **Smart Categorization**: Automatically detects error types from error messages
2. **Visual Feedback**: Uses emojis and color coding (destructive vs default variants)
3. **Extended Duration**: Shows for 6 seconds to give users time to read
4. **Non-intrusive**: Doesn't block the UI, works alongside existing error alerts
5. **Comprehensive Coverage**: Handles both "ERROR" and "ABORTED" thread statuses

### Example Usage

When an API call fails with "Your credit balance is too low to access the Anthropic API", users will see:

```
💳 Credit Balance Too Low
Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.
```

## Testing

Run the test suite to verify error categorization:

```bash
bun test apps/web/app/tests/toast-api-error-notification.test.ts
```

Tests cover:

- All error categorization logic
- Thread item creation with different error types
- Edge cases and fallbacks

## Benefits

1. **Immediate Feedback**: Users get instant notification when API calls fail
2. **Better UX**: Clear, categorized error messages with helpful context
3. **Reduced Confusion**: Users understand what went wrong without scrolling
4. **Actionable Information**: Error titles help users understand next steps

## Technical Details

- **No Performance Impact**: Only triggers on error states
- **Memory Efficient**: Uses existing error diagnostic utilities
- **Accessible**: Works with screen readers and keyboard navigation
- **Responsive**: Adapts to mobile and desktop layouts

## Related Components

- `RateLimitErrorAlert`: Still shows detailed error information in chat
- `getErrorDiagnosticMessage`: Provides formatted error messages
- `SonnerToaster`: Already included in root layout for display
