# Gemini Web Search Error Fix

## Issue

The application was experiencing a `TypeError: can't convert undefined to object` error when using Gemini web search functionality. This error occurred in the AI workflow system when attempting to perform web searches with Gemini models.

**Specific Errors Identified:**

1. `ReferenceError: window is not defined` - The code was trying to access the `window` object in a server-side environment (Web Worker or Node.js context)
2. `GenerateContentRequest.contents[X].parts: contents.parts must not be empty` - Messages with empty content were being passed to the Gemini API

## Root Cause

Through comprehensive runtime logging, the specific issue was identified:

1. **Server-Side Window Access**: The API key checking logic was attempting to access `window.AI_API_KEYS` in a server-side environment
2. **Unsafe Environment Detection**: Even with `typeof window !== 'undefined'` checks, some JavaScript environments still threw errors when accessing window properties
3. **Web Worker Context**: The code was running in a Web Worker context where `window` is not available
4. **Original Issues (Previously Addressed)**:
   - Undefined API Key Handling
   - Unsafe Promise Resolution
   - Missing Error Context
   - Inconsistent Error Handling
   - Insufficient Runtime Debugging

## Debugging Approach

To identify the exact source of the "can't convert undefined to object" error, comprehensive runtime logging was added:

### 1. Parameter Validation Logging

- Added detailed logging of all input parameters to `generateTextWithGeminiSearch`
- Logged API key availability checks across different environments
- Tracked model selection and validation steps

### 2. Provider Instance Logging

- Added logging in `getLanguageModel` to track model creation process
- Logged provider instance creation and configuration
- Tracked model wrapping with middleware

### 3. StreamText Execution Logging

- Added logging before and after `streamText` calls
- Tracked configuration object creation and validation
- Logged fullStream access and iteration

### 4. Promise Resolution Logging

- Added detailed logging for sources and providerMetadata resolution
- Tracked async operation success/failure
- Logged final result composition

## Solution

### 1. Server-Side Environment Fix (PRIMARY FIX)

- **Root Issue**: `ReferenceError: window is not defined` when accessing `window.AI_API_KEYS` in Web Worker context
- **Solution**: Wrapped window access in try-catch blocks to handle environments where window is not available
- **Implementation**:

  ```typescript
  let windowApiKey = false;
  try {
      windowApiKey = typeof window !== 'undefined' && !!window.AI_API_KEYS?.google;
  } catch (error) {
      // window is not available in this environment
      windowApiKey = false;
  }
  ```

- **Applied in**: `packages/ai/workflow/utils.ts` and `packages/ai/providers.ts`

### 2. Message Content Filtering Fix (SECONDARY FIX)

- **Root Issue**: `GenerateContentRequest.contents[X].parts: contents.parts must not be empty` when empty messages were passed to Gemini API
- **Solution**: Filter out messages with empty content before sending to AI models
- **Implementation**:

  ```typescript
  let filteredMessages = messages;
  if (messages?.length) {
      filteredMessages = messages.filter((message) => {
          const hasContent = message.content &&
              (typeof message.content === 'string' ? message.content.trim() !== '' :
               Array.isArray(message.content) ? message.content.length > 0 :
               true);
          return hasContent;
      });
  }
  ```

- **Applied in**: `generateObject`, `generateText`, and `generateTextWithGeminiSearch` functions

### 3. Enhanced API Key Validation

- Added explicit checks for Gemini API keys in `generateTextWithGeminiSearch`
- Modified `getProviderInstance` to throw descriptive errors when Google API keys are missing
- Added fallback dummy keys for other providers to prevent immediate initialization errors

### 4. Safe Promise Resolution

- Wrapped `sources` and `providerMetadata` promise resolution in try-catch blocks
- Added proper typing for resolved values to prevent TypeScript errors
- Implemented graceful fallbacks when these values are undefined

### 5. Improved Error Messages

- Added specific error handling for common API issues (401, 403, 429)
- Provided user-friendly error messages that guide users to solutions
- Enhanced error context in both utils and task files

### 6. Robust Error Handling

- Added proper error propagation from providers to tasks
- Implemented consistent error handling patterns across the codebase
- Added appropriate step status updates for failed operations

## Files Modified

### `/packages/ai/workflow/utils.ts`

- Enhanced `generateTextWithGeminiSearch` function with:
  - API key validation
  - Safe promise resolution
  - Better error handling and messages
  - Proper TypeScript typing
  - **Comprehensive runtime logging** for debugging

### `/packages/ai/workflow/tasks/gemini-web-search.ts`

- Improved error handling in the task execution
- Added user-friendly error messages
- Fixed step status update properties
- **Added detailed execution logging** to track parameter flow

### `/packages/ai/providers.ts`

- Enhanced `getProviderInstance` with explicit Google API key validation
- Improved `getLanguageModel` with better error context
- Added fallback handling for missing API keys
- **Added comprehensive model creation logging**

## Debugging Features Added

### 1. Runtime Parameter Tracking

- All function inputs are logged with sanitized content
- API key availability is tracked across different environments
- Model selection process is fully logged

### 2. Provider Instance Debugging

- Provider creation process is logged step-by-step
- Model instantiation errors are captured with full context
- Model configuration options are tracked

### 3. StreamText Execution Monitoring

- Configuration object creation is logged
- StreamText call success/failure is tracked
- FullStream access and iteration is monitored

### 4. Promise Resolution Monitoring

- Sources and providerMetadata resolution is tracked
- Async operation failures are logged with context
- Final result composition is verified

## Error Prevention

The fix prevents the following error scenarios:

1. **Undefined Object Conversion**: Safely handles undefined `sources` and `providerMetadata`
2. **Missing API Keys**: Validates API keys before model creation
3. **Network Failures**: Provides appropriate error messages for API failures
4. **Configuration Issues**: Guides users to correct configuration problems

## Testing

To test the fix:

1. **Without API Key**: Verify appropriate error message is shown
2. **With Invalid API Key**: Confirm 401/403 errors are handled gracefully
3. **With Valid API Key**: Ensure web search works correctly
4. **Network Issues**: Test rate limiting and timeout scenarios

## User Impact

- Users will now see clear, actionable error messages instead of cryptic TypeScript errors
- The system degrades gracefully when API keys are missing or invalid
- Better guidance for users to configure their API keys correctly
- Improved reliability of the Gemini web search feature

## Related Issues

This fix addresses the core issue of undefined object conversion errors in the Gemini web search workflow while also improving the overall robustness of the AI provider system.
