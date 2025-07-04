# Error Diagnostic System Examples

This document shows examples of the improved error diagnostic messages that replace the generic "Something went wrong while processing your request. Please try again." message.

## Before vs After

### Before (Generic)

```
❌ Something went wrong while processing your request. Please try again.
```

### After (Diagnostic)

The new system provides context-aware error messages with actionable troubleshooting steps.

## Error Categories & Examples

### 1. API Key Errors

**Example Error:**

```
🔑 API key issue detected. This could be due to missing, invalid, or expired API keys.

🔧 Try these steps:
1. Check your API keys in Settings → API Keys
2. Verify your API key is valid and not expired
3. Try regenerating your API key from the provider
4. For free models, try again later if limits are reached
5. Contact support if you continue having issues

[Open Settings] [Refresh Page]
```

**Triggers:**

- "api key", "unauthorized", "invalid key", "forbidden"

### 2. Network/Connection Errors

**Example Error:**

```
🌐 Network connectivity issue detected. The request failed to reach the AI service.

🔧 Try these steps:
1. Check your internet connection
2. Try refreshing the page
3. Disable any VPN or proxy temporarily
4. Clear your browser cache and cookies
5. Try again in a few minutes

[Open Settings] [Refresh Page]
```

**Triggers:**

- "network", "timeout", "connection", "fetch", "cors"

### 3. Model/Feature Compatibility Errors

**Example Error:**

```
🤖 Model or feature compatibility issue detected.

🔧 Try these steps:
1. Try switching to a different AI model
2. Check if the selected model supports your request
3. Update your browser to the latest version
4. Try again with a simpler request

[Open Settings] [Refresh Page]
```

**Triggers:**

- "model", "unsupported", "not available"

### 4. Rate Limit Errors (Enhanced)

**Example Error:**

```
⏱️ Daily free web search limit reached. Add your own Gemini API key in settings for unlimited usage.

🔧 Try these steps:
1. Wait a few minutes before trying again
2. Check your usage limits in Settings → Usage
3. Consider upgrading to VT+ for higher limits
4. Add your own API key for unlimited usage

[View Usage] [Upgrade to VT+]
```

**Triggers:**

- "rate limit", "daily limit", "per minute", "minute"

### 5. Configuration Errors

**Example Error:**

```
⚙️ Configuration issue detected. The system may need to be set up properly.

🔧 Try these steps:
1. Try refreshing the page
2. Clear your browser data and try again
3. Contact support if the issue persists
4. Check if you have the required permissions

[Open Settings] [Refresh Page]
```

**Triggers:**

- "config", "setup", "environment"

### 6. Request Cancellation

**Example Error:**

```
🚫 Request was cancelled or interrupted.

🔧 Try these steps:
1. Try submitting your request again
2. Check your internet connection stability
3. Avoid navigating away while processing

[Open Settings] [Refresh Page]
```

**Triggers:**

- "aborted", "cancelled"

### 7. Billing/Quota Issues

**Example Error:**

```
💳 Service quota or billing issue detected.

🔧 Try these steps:
1. Check your account billing status
2. Verify your subscription is active
3. Contact support for quota-related issues
4. Try using a different model or feature

[Open Settings] [Refresh Page]
```

**Triggers:**

- "quota", "billing"

## UI Components

### Enhanced Error Alert Layout

The new error alerts include:

1. **Clear Error Message** - Explains what went wrong
2. **Categorized Icon** - Visual indicator (🔑🌐🤖⏱️⚙️🚫💳)
3. **Numbered Action Steps** - Specific troubleshooting guidance
4. **Action Buttons** - Quick access to settings, refresh, upgrade options

### Responsive Design

- **Mobile-friendly** layout with proper spacing
- **Accessible** with proper ARIA labels and keyboard navigation
- **Consistent** with the existing design system

## Implementation Details

### Key Features

1. **Smart Error Detection** - Analyzes error messages to determine category
2. **Context-Aware Suggestions** - Provides relevant troubleshooting steps
3. **Progressive Enhancement** - Falls back gracefully for unknown errors
4. **User-Friendly Language** - Avoids technical jargon
5. **Actionable Guidance** - Each suggestion is something users can actually do

### Technical Implementation

- **Error Diagnostic Utility** (`packages/common/utils/error-diagnostics.ts`)
- **Enhanced Error Alert Component** (`packages/common/components/rate-limit-error-alert.tsx`)
- **Comprehensive Test Coverage** - Unit tests for all error categories
- **Build Integration** - Works seamlessly with existing error handling

## Benefits

### For Users

- ✅ **Clear Understanding** - Know what went wrong
- ✅ **Actionable Steps** - Know how to fix issues
- ✅ **Reduced Frustration** - No more mysterious errors
- ✅ **Faster Resolution** - Quick access to relevant settings

### For Support

- ✅ **Reduced Support Tickets** - Users can self-diagnose many issues
- ✅ **Better Bug Reports** - More specific error information
- ✅ **Improved User Experience** - Happy users = fewer complaints

### For Development

- ✅ **Better Error Tracking** - Categorized error patterns
- ✅ **Maintainable Code** - Centralized error handling logic
- ✅ **Extensible System** - Easy to add new error types
