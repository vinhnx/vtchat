# GPT-5 OpenRouter Chat Workflow Fix - Implementation Summary

## Problem Identified

The user reported that GPT-5 OpenRouter was visible in the dropdown but clicking the "Send message" button didn't work. The issue was in the workflow routing logic.

## Root Cause Analysis

1. **GPT_5_OPENROUTER was properly configured** in models, chat modes, and UI
2. **The issue was in the completion task** (`packages/ai/workflow/tasks/completion.ts`)
3. **When web search was enabled**, the completion task checked `supportsOpenAIWebSearch(model)`
4. **GPT_5_OPENROUTER was NOT in the `supportsOpenAIWebSearch` list**
5. **This caused redirection to "planner"** instead of staying in "completion"
6. **The planner is for research planning**, not normal chat, breaking the workflow

## Solution Implemented

### 1. Added GPT_5_OPENROUTER to `supportsOpenAIWebSearch`

**File:** `packages/ai/models.ts`

```typescript
export const supportsOpenAIWebSearch = (model: ModelEnum): boolean => {
    const openaiWebSearchModels = [
        ModelEnum.GPT_4o_Mini,
        ModelEnum.GPT_4o,
        ModelEnum.O3,
        ModelEnum.O3_Mini,
        // OpenAI models via OpenRouter also support OpenAI web search tools
        ModelEnum.GPT_OSS_120B,
        ModelEnum.GPT_OSS_20B,
        ModelEnum.GPT_5_OPENROUTER,
        // Add other models as they become available for Responses API
    ];

    return openaiWebSearchModels.includes(model);
};
```

### 2. Applied Consistent Pattern to All OpenAI Models

- **GPT_OSS_120B** and **GPT_OSS_20B** also had the same issue
- Added them to `supportsOpenAIWebSearch` for consistency
- All OpenAI models (direct + OpenRouter) now behave consistently

## How Web Search Works in VTchat

### Automatic Enablement

- **Pro Search mode**: Web search auto-enabled for VT+ users
- **Other modes**: Web search controlled by user clicking web search button

### Workflow Routing Logic

```typescript
// In completion task
if (webSearch && !supportsOpenAISearch) {
    redirectTo('planner'); // ❌ This was breaking GPT-5
    return;
}
// Continue with completion ✅ Now works for GPT-5
```

### Web Search Support Types

1. **Native Web Search**: Gemini models (uses Google's native capabilities)
2. **OpenAI Web Search**: OpenAI models (uses OpenAI's web search tools)
3. **Other providers**: Redirect to planner for research-style queries

## Testing Results

### Before Fix

```
GPT_5_OPENROUTER + web search enabled → redirect to "planner" → broken chat
```

### After Fix

```
GPT_5_OPENROUTER + web search enabled → stay in "completion" → working chat
GPT_5_OPENROUTER + no web search → stay in "completion" → working chat
```

## Model Support Summary

| Model            | Provider                  | Web Search Support     | Chat Works |
| ---------------- | ------------------------- | ---------------------- | ---------- |
| GPT-4o           | OpenAI Direct             | ✅ OpenAI Tools        | ✅         |
| GPT-4o-mini      | OpenAI Direct             | ✅ OpenAI Tools        | ✅         |
| GPT-OSS-120B     | OpenAI via OpenRouter     | ✅ OpenAI Tools        | ✅         |
| GPT-OSS-20B      | OpenAI via OpenRouter     | ✅ OpenAI Tools        | ✅         |
| **GPT-5**        | **OpenAI via OpenRouter** | **✅ OpenAI Tools**    | **✅**     |
| Gemini models    | Google Direct             | ✅ Native Search       | ✅         |
| Other OpenRouter | Various                   | ❌ Redirect to Planner | ✅         |

## Key Learning

The issue wasn't with model configuration or UI setup - it was with **workflow routing logic**. OpenAI models accessed through OpenRouter should be treated the same as direct OpenAI models for web search capabilities, since they're the same underlying models with the same tool support.

## Status: ✅ FIXED

GPT-5 OpenRouter now works correctly for:

- ✅ Normal chat (no tools selected)
- ✅ Chat with web search enabled
- ✅ Chat with other tools (math calculator, charts)
- ✅ Consistent behavior with other OpenAI models
