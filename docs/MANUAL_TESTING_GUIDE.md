# Manual Testing Guide: AI Routing Fix

## Overview

This guide helps you manually test the AI routing fix to ensure all models correctly route to the `/api/completion` endpoint.

## Prerequisites

1. ✅ **Authentication**: Login to https://vtchat.io.vn
2. ✅ **VT+ Subscription**: Required to test VT+ models
3. ✅ **Browser DevTools**: Open Network tab to monitor requests

## Test Scenarios

### 1. Free Models (Should work without VT+)

- **Model**: Gemini 2.5 Flash Lite Preview
- **Expected**: Routes to `/api/completion` (managed VT+ flow)
- **Test**: Send a simple message like "Hello, test free model"

### 2. VT+ Models (Require VT+ subscription)

Test these models should all route to `/api/completion`:

#### Anthropic Models

- **Claude Sonnet 4.5** ✅
- **Claude 4 Sonnet** ✅
- **Claude 4 Opus** ✅

#### OpenAI Models

- **GPT 4o** ✅
- **GPT 4o Mini** ✅

#### Google Models

- **Gemini 2.5 Pro** ✅
- **Gemini 2.5 Flash** ✅

#### Other Providers

- **DeepSeek R1** (Fireworks) ✅
- **Grok 4** (xAI) ✅

### 3. VT+ Exclusive Features

These should **always** route to `/api/completion`:

- **Deep Research** ✅
- **Pro Search** ✅

## Testing Steps

### Step 1: Login

1. Go to https://vtchat.io.vn
2. Click login and authenticate
3. Verify you see "VT+" in the interface

### Step 2: Open DevTools

1. Press F12 or right-click → Inspect
2. Go to **Network** tab
3. Filter by "completion" to see `/api/completion` calls

### Step 3: Test Each Model

For each model in the list above:

1. **Select Model**: Click model selector → Choose model
2. **Send Message**: Type "Test routing for [model name]"
3. **Check Network**: Look for `/api/completion` requests
4. **Verify**: ✅ if `/api/completion` is called, ❌ if not

### Step 4: Test VT+ Features

1. Select "Deep Research" from model selector
2. Send a research query like "Research latest AI developments"
3. Verify `/api/completion` is called
4. Repeat for "Pro Search"

## Expected Results

### ✅ PASS Criteria

- VT+ models call `/api/completion`
- VT+ exclusive features call `/api/completion`
- Free models may call either endpoint
- No authentication errors for VT+ users

### ❌ FAIL Criteria

- VT+ models don't call `/api/completion`
- VT+ features use client-side routing
- Authentication errors for valid users

## Network Request Analysis

### What to Look For:

```
Request URL: https://vtchat.io.vn/api/completion
Method: POST
Status: 200 OK
```

### Request Headers Should Include:

- `Content-Type: application/json`
- `Authorization: Bearer [token]` (if applicable)

### Request Body Should Contain:

- `mode`: Selected model (e.g., "claude-4-sonnet")
- `messages`: User messages
- `hasVtPlus`: true (for VT+ users)

## Common Issues & Fixes

### Issue 1: VT+ Models Not Routing to `/api/completion`

**Symptoms**: VT+ models using client-side routing
**Fix**: Check `shouldUseServerSideAPI()` function in `packages/common/lib/ai-routing.ts`

### Issue 2: API Key Errors

**Symptoms**: "Invalid API key" errors
**Fix**: Check `filterApiKeysForServerSide()` function removes provider keys

### Issue 3: Authentication Issues

**Symptoms**: Login dialogs for authenticated users
**Fix**: Check session validation in routing logic

## Debugging Commands

### Check Routing Logic

```bash
# Test the routing functions
bun test packages/common/tests/ai-routing.test.ts
```

### Check Build Status

```bash
# Verify app builds correctly
bun run build
```

### Check Logs

```bash
# Check application logs
bun run dev
```

## Automated Testing

### Run Test Scripts

```bash
# Install dependencies
npm install playwright

# Run verification
node verify-routing-fix.js

# Run detailed tests (after login)
node test-routing-detailed.js
```

## Success Criteria Checklist

- [ ] Free models work correctly
- [ ] All VT+ models route to `/api/completion`
- [ ] VT+ exclusive features route to `/api/completion`
- [ ] No authentication errors for VT+ users
- [ ] API keys are properly filtered for server-side calls
- [ ] Network requests show correct routing
- [ ] No console errors related to routing

## Report Issues

If you find any issues, please report:

1. Model name and provider
2. Expected vs actual routing
3. Network request details
4. Console errors (if any)
5. Steps to reproduce

## Additional Resources

- **Routing Logic**: `packages/common/lib/ai-routing.ts`
- **Tests**: `packages/common/tests/ai-routing.test.ts`
- **Implementation**: `packages/common/hooks/agent-provider.tsx`
- **Deployment**: https://vtchat.io.vn (v2.4.6)
