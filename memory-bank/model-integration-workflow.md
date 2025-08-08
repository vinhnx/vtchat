# Model Integration Workflow - Knowledge Base

_Date: 2025-08-08_
_Context: GPT-5 OpenRouter Integration Lessons Learned_

## Overview

This document captures the complete workflow for integrating new AI models into the VTchat application, based on lessons learned from the GPT-5 OpenRouter integration. This knowledge should be applied to all future model integrations.

## Complete Model Integration Checklist

### 1. Model Configuration (`packages/ai/models.ts`)

#### A. ModelEnum Definition

```typescript
// Add to ModelEnum
GPT_5_OPENROUTER: "openai/gpt-5",
```

#### B. Model Configuration Array

```typescript
{
    id: ModelEnum.GPT_5_OPENROUTER,
    name: "GPT-5 (via OpenRouter)",
    provider: "openrouter",
    maxTokens: 128_000,
    contextWindow: 400_000,
}
```

#### C. ChatMode to Model Mapping

```typescript
// In getModelFromChatMode function
case ChatMode.GPT_5_OPENROUTER:
    return ModelEnum.GPT_5_OPENROUTER;
```

#### D. Token Limits Configuration

```typescript
// In getChatModeMaxTokens function
case ChatMode.GPT_5_OPENROUTER:
    return 400_000; // or appropriate limit
```

#### E. Tool Support (if applicable)

```typescript
// Add to openrouterToolModels array if tools supported
ModelEnum.GPT_5_OPENROUTER,
```

#### F. Web Search Support Classification

**CRITICAL:** Choose the correct web search support based on model capabilities:

```typescript
// For OpenAI models (including via OpenRouter)
export const supportsOpenAIWebSearch = (model: ModelEnum): boolean => {
    const openaiWebSearchModels = [
        ModelEnum.GPT_4o_Mini,
        ModelEnum.GPT_4o,
        ModelEnum.GPT_5_OPENROUTER, // Add here for OpenAI models
    ];
    return openaiWebSearchModels.includes(model);
};

// For Google/Gemini models
export const supportsNativeWebSearch = (model: ModelEnum): boolean => {
    const googleModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        // Add Gemini models here
    ];
    return googleModels.includes(model);
};
```

### 2. Chat Mode Configuration (`packages/shared/config/chat-mode.ts`)

#### A. ChatMode Enum

```typescript
// Add to ChatMode enum
GPT_5_OPENROUTER: "gpt-5-openrouter",
```

#### B. ChatModeConfig

```typescript
[ChatMode.GPT_5_OPENROUTER]: {
    webSearch: true,        // Based on model capabilities
    imageUpload: true,      // Based on model capabilities
    multiModal: true,       // Based on model capabilities
    retry: true,           // Usually true for paid models
    isAuthRequired: true,  // True for non-free models
    isNew: true,          // For newly added models
},
```

#### C. Display Name

```typescript
// In getChatModeName function
case ChatMode.GPT_5_OPENROUTER:
    return "GPT-5 (via OpenRouter)";
```

### 3. API Key Configuration

#### A. Workflow Utils (`packages/ai/workflow/utils.ts`)

```typescript
// Add to provider mapping
[ModelEnum.GPT_5_OPENROUTER]: "OPENROUTER_API_KEY",
```

#### B. API Keys Store (`packages/common/store/api-keys.store.ts`)

```typescript
// Add to appropriate provider section
case ChatMode.GPT_5_OPENROUTER:
    return isValidKey(apiKeys.OPENROUTER_API_KEY);
```

#### C. BYOK Validation Dialog (`packages/common/components/byok-validation-dialog.tsx`)

```typescript
// Add to API key mapping
[ChatMode.GPT_5_OPENROUTER]: "OPENROUTER_API_KEY",
```

### 4. UI Configuration (`packages/common/components/chat-input/chat-config.tsx`)

#### A. Model ID to ChatMode Mapping

```typescript
// Add to modelIdToChatModeMap
"openai/gpt-5": ChatMode.GPT_5_OPENROUTER,
```

#### B. Custom Labels (if needed)

```typescript
// Add to customLabels if special display name needed
"openai/gpt-5": "GPT-5 (via OpenRouter)",
```

#### C. Provider-Specific Options

```typescript
// Add to modelOptionsByProvider for the appropriate provider
OpenRouter: [
    // ... existing models
    {
        label: "GPT-5 (via OpenRouter)",
        value: ChatMode.GPT_5_OPENROUTER,
        modelId: "openai/gpt-5",
        isNew: true,
    },
],
```

## Critical Integration Patterns

### 1. Provider Classification

**OpenRouter Models:**

- Use model IDs like `"openai/gpt-5"`, `"deepseek/deepseek-chat-v3-0324"`
- API key: `OPENROUTER_API_KEY`
- Can support OpenAI web search tools if they're OpenAI models via OpenRouter

**Direct Provider Models:**

- Use model IDs like `"gpt-4o"`, `"claude-4-sonnet"`
- API key: Provider-specific (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
- Support provider-native capabilities

### 2. Web Search Support Logic

The completion task routing logic depends on proper web search support classification:

```typescript
// In completion task
if (webSearch && !supportsOpenAISearch) {
    redirectTo('planner'); // Breaks chat functionality!
    return;
}
// Continue with completion
```

**Key Rules:**

- OpenAI models (direct or via OpenRouter) → `supportsOpenAIWebSearch`
- Google/Gemini models → `supportsNativeWebSearch`
- Other models → Neither (will redirect to planner for web search)

### 3. API Key Validation Chain

Three places must be updated for API key validation to work:

1. **Workflow Utils:** Maps model to API key name
2. **API Keys Store:** Validates the API key for the chat mode
3. **BYOK Dialog:** Shows correct API key prompt to users

Missing any of these will cause the send button to not work.

### 4. Common Integration Errors

#### A. Missing API Key Validation

**Symptom:** Send button doesn't work, `hasApiKey: false` in logs
**Fix:** Add to all three API key validation locations

#### B. Incorrect Web Search Support

**Symptom:** Chat redirects to planner instead of completion
**Fix:** Add to correct web search support function (`supportsOpenAIWebSearch` or `supportsNativeWebSearch`)

#### C. Missing UI Configuration

**Symptom:** Model doesn't appear in dropdown or appears but can't be selected
**Fix:** Add to `chat-config.tsx` with proper mappings

#### D. Inconsistent Provider Classification

**Symptom:** Model works in some contexts but not others
**Fix:** Ensure consistent provider classification across all files

## Testing Workflow

After integration, verify:

1. **Model appears in dropdown:** Check UI configuration
2. **Model can be selected:** Check ChatMode mapping
3. **Send button works:** Check API key validation
4. **Chat workflow starts:** Check web search support classification
5. **API calls succeed:** Check model ID and provider configuration

## Model-Specific Considerations

### OpenRouter Models

- Always use `provider: "openrouter"`
- Model ID format: `"provider/model-name"`
- API key: `OPENROUTER_API_KEY`
- May support OpenAI tools if underlying model is OpenAI

### Direct Provider Models

- Use provider-specific configuration
- Model ID format varies by provider
- Provider-specific API keys
- Native tool support

### Free vs Paid Models

- Free models: `isAuthRequired: false`
- Paid models: `isAuthRequired: true` + proper API key validation

## Future Model Integration Template

When adding a new model, copy this checklist and fill in the specifics:

1. [ ] Add ModelEnum entry
2. [ ] Add model configuration
3. [ ] Add ChatMode enum entry
4. [ ] Add ChatModeConfig
5. [ ] Add ChatMode to model mapping
6. [ ] Add token limits
7. [ ] Add to tool support (if applicable)
8. [ ] Add to web search support (choose correct function)
9. [ ] Add API key workflow mapping
10. [ ] Add API key store validation
11. [ ] Add BYOK dialog mapping
12. [ ] Add UI model mapping
13. [ ] Add UI provider options
14. [ ] Test complete integration workflow

## Key Learnings

1. **API key validation is critical** - missing entries break send button
2. **Web search support classification affects workflow routing** - wrong classification breaks chat
3. **Provider consistency matters** - inconsistent classification causes issues
4. **UI configuration must be complete** - missing mappings prevent model selection
5. **Test the complete flow** - integration requires end-to-end verification

This workflow ensures new models integrate seamlessly without the issues encountered during GPT-5 OpenRouter integration.
