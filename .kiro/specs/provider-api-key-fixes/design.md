# Design Document

## Overview

This design addresses critical API key transmission issues in the AI provider system. The current implementation has inconsistencies in how API keys are passed from the frontend through the completion API to the AI providers, resulting in authentication failures and no model responses. Additionally, OpenRouter integration may have issues with proper API request handling.

## Architecture

The API key flow follows this path:

1. Frontend sends `apiKeys` object in completion request
2. Completion route validates and passes `apiKeys` to workflow
3. Workflow passes `apiKeys` as `byokKeys` to `generateText`
4. `generateText` calls `getLanguageModel` with `byokKeys`
5. `getLanguageModel` calls `getProviderInstance` with mapped keys
6. Provider instance uses keys for authentication

The issue occurs in the key mapping and transformation between these layers.

## Components and Interfaces

### API Key Mapping Service

**Purpose**: Centralize and standardize API key name mapping between frontend and providers.

**Interface**:

```typescript
interface ApiKeyMappingService {
    // Map frontend API key names to provider key names
    mapFrontendToProvider(apiKeys: Record<string, string>): Record<string, string>;

    // Map provider names to expected key names
    getProviderKeyName(provider: ProviderEnumType): string;

    // Validate API key presence for a given provider
    validateProviderKey(provider: ProviderEnumType, keys: Record<string, string>): boolean;
}
```

### Enhanced Provider Instance Creation

**Purpose**: Improve error handling and logging in provider instance creation.

**Interface**:

```typescript
interface EnhancedProviderInstance {
    // Create provider with detailed logging and validation
    createWithValidation(
        provider: ProviderEnumType,
        apiKeys: Record<string, string>,
        options?: ProviderOptions
    ): Promise<ProviderInstance>;

    // Validate API key format and presence
    validateApiKey(provider: ProviderEnumType, apiKey: string): ValidationResult;
}
```

### OpenRouter Request Handler

**Purpose**: Ensure proper API request handling for OpenRouter models.

**Interface**:

```typescript
interface OpenRouterHandler {
    // Send authentic API requests to OpenRouter
    sendRequest(model: string, messages: any[], apiKey: string): Promise<Response>;

    // Validate OpenRouter API key format
    validateApiKey(apiKey: string): boolean;

    // Handle OpenRouter-specific error responses
    handleError(error: any): StandardError;
}
```

## Data Models

### API Key Configuration

```typescript
interface ApiKeyConfig {
    // Frontend key names (what UI sends)
    frontend: {
        OPENAI_API_KEY: string;
        ANTHROPIC_API_KEY: string;
        OPENROUTER_API_KEY: string;
        GEMINI_API_KEY: string;
        // ... other providers
    };

    // Provider key names (what providers expect)
    provider: {
        openai: string;
        anthropic: string;
        openrouter: string;
        google: string;
        // ... other providers
    };
}
```

### Provider Validation Result

```typescript
interface ProviderValidationResult {
    isValid: boolean;
    provider: ProviderEnumType;
    hasApiKey: boolean;
    keyLength?: number;
    error?: string;
}
```

## Error Handling

### API Key Validation Errors

- **Missing API Key**: Clear error message indicating which provider key is missing
- **Invalid Key Format**: Validation error with expected format information
- **Provider Not Supported**: Error when trying to use unsupported provider

### OpenRouter Specific Errors

- **Authentication Failed**: When OpenRouter API key is invalid
- **Rate Limited**: When OpenRouter rate limits are exceeded
- **Model Not Available**: When requested OpenRouter model is unavailable

### Logging Strategy

- Log API key presence (not values) at each transformation step
- Log provider instance creation success/failure
- Log request/response status for debugging
- Never log actual API key values in any environment

## Testing Strategy

### Unit Tests

1. **API Key Mapping Tests**
    - Test frontend to provider key name mapping
    - Test key validation for each provider
    - Test error handling for missing/invalid keys

2. **Provider Instance Tests**
    - Test successful provider creation with valid keys
    - Test error handling with invalid/missing keys
    - Test logging output without exposing keys

3. **OpenRouter Integration Tests**
    - Test authentic API request sending
    - Test error response handling
    - Test API key validation

### Integration Tests

1. **End-to-End API Key Flow**
    - Test complete flow from frontend to provider
    - Test with valid BYOK keys for each provider
    - Test error propagation through the stack

2. **Provider Response Tests**
    - Test actual model responses with valid keys
    - Test error responses with invalid keys
    - Test timeout and network error handling

### Manual Testing

1. **Provider Authentication**
    - Test each provider with valid API keys
    - Test each provider with invalid API keys
    - Verify error messages are user-friendly

2. **OpenRouter Functionality**
    - Test OpenRouter models with valid API key
    - Verify authentic responses (not dummy data)
    - Test error handling and fallback behavior

## Implementation Notes

### Key Mapping Standardization

The current system has inconsistent key naming between:

- Frontend: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
- Provider mapping: `openai`, `anthropic`, etc.
- Worker: Mixed naming conventions

This needs to be standardized with a single source of truth for key mappings.

### OpenRouter Request Handling

The OpenRouter provider should use the `@openrouter/ai-sdk-provider` package correctly and ensure:

- Proper API key header formatting
- Correct endpoint usage
- Authentic response processing (no dummy data)

### Debugging and Monitoring

Enhanced logging should help identify:

- Where API keys are lost in the transformation chain
- Which provider instance creation is failing
- What specific authentication errors occur

The logging must be security-conscious and never expose actual API key values.
